create table public.beneficiarios (
  id text primary key,
  ordem bigint generated always as identity,
  nome text not null check (btrim(nome) <> ''),
  tipo text not null check (tipo in ('Família', 'Escolinha', 'Instituição')),
  regiao text not null check (regiao in ('Ceilândia', 'Guará', 'Taguatinga', 'Samambaia', 'Planaltina', 'Recanto das Emas', 'Santa Maria', 'São Sebastião')),
  contato text not null default '',
  necessidade text not null default '',
  data_cadastro date not null
);

create table public.doacoes (
  id text primary key,
  ordem bigint generated always as identity,
  categoria text not null check (categoria in ('Cesta básica', 'Bola', 'Rede', 'Troféu', 'Uniforme')),
  quantidade integer not null check (quantidade > 0),
  origem text not null check (btrim(origem) <> ''),
  data date not null,
  status text not null default 'Disponível' check (status in ('Disponível', 'Reservada', 'Entregue'))
);

create table public.entregas (
  id text primary key,
  ordem bigint generated always as identity,
  doacao_id text not null unique references public.doacoes (id) on delete restrict,
  beneficiario_id text not null references public.beneficiarios (id) on delete restrict,
  data date not null,
  responsavel text not null check (btrim(responsavel) <> '')
);

create index entregas_beneficiario_id_idx on public.entregas (beneficiario_id);

alter table public.beneficiarios enable row level security;
alter table public.doacoes enable row level security;
alter table public.entregas enable row level security;

revoke all on table public.beneficiarios, public.doacoes, public.entregas from anon, authenticated;

create function public.validar_data_entrega()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_data_doacao date;
begin
  select d.data into v_data_doacao from public.doacoes d where d.id = new.doacao_id;
  if found and new.data < v_data_doacao then
    raise exception 'A data da entrega não pode ser anterior ao recebimento da doação (%).', to_char(v_data_doacao, 'YYYY-MM-DD');
  end if;
  return new;
end;
$$;

create trigger entregas_validar_data
before insert or update on public.entregas
for each row execute function public.validar_data_entrega();

create function public.validar_status_doacao()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_data_entrega date;
begin
  select e.data into v_data_entrega from public.entregas e where e.doacao_id = new.id;
  if found then
    if new.status <> 'Entregue' then
      raise exception 'Esta doação já tem uma entrega registrada. Remova a entrega para mudar o status.';
    end if;
    if new.data > v_data_entrega then
      raise exception 'A data de recebimento não pode ser posterior à entrega (%).', to_char(v_data_entrega, 'YYYY-MM-DD');
    end if;
  elsif new.status = 'Entregue' then
    raise exception 'Para marcar como Entregue, registre uma entrega na tela de Entregas.';
  end if;
  return new;
end;
$$;

create trigger doacoes_validar_status
before update on public.doacoes
for each row execute function public.validar_status_doacao();

create function public.registrar_entrega(
  p_id text,
  p_doacao_id text,
  p_beneficiario_id text,
  p_data date,
  p_responsavel text
)
returns public.entregas
language plpgsql
set search_path = ''
as $$
declare
  v_status text;
  v_entrega public.entregas;
begin
  select d.status into v_status from public.doacoes d where d.id = p_doacao_id for update;
  if not found or v_status <> 'Disponível' then
    raise exception 'Esta doação não está disponível para entrega.';
  end if;

  insert into public.entregas (id, doacao_id, beneficiario_id, data, responsavel)
  values (p_id, p_doacao_id, p_beneficiario_id, p_data, p_responsavel)
  returning * into v_entrega;

  update public.doacoes set status = 'Entregue' where id = p_doacao_id;

  return v_entrega;
end;
$$;

create function public.remover_entrega(p_id text)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  v_doacao_id text;
begin
  delete from public.entregas where id = p_id returning doacao_id into v_doacao_id;
  if not found then
    return false;
  end if;

  update public.doacoes set status = 'Disponível' where id = v_doacao_id;
  return true;
end;
$$;

create function public.apagar_tudo()
returns void
language plpgsql
set search_path = ''
as $$
begin
  delete from public.entregas where true;
  delete from public.doacoes where true;
  delete from public.beneficiarios where true;
end;
$$;

create function public.restaurar_exemplo(p_dados jsonb)
returns void
language plpgsql
set search_path = ''
as $$
begin
  perform public.apagar_tudo();

  insert into public.beneficiarios (id, nome, tipo, regiao, contato, necessidade, data_cadastro)
  select id, nome, tipo, regiao, contato, necessidade, data_cadastro
  from jsonb_populate_recordset(null::public.beneficiarios, p_dados -> 'beneficiarios');

  insert into public.doacoes (id, categoria, quantidade, origem, data, status)
  select id, categoria, quantidade, origem, data, status
  from jsonb_populate_recordset(null::public.doacoes, p_dados -> 'doacoes');

  insert into public.entregas (id, doacao_id, beneficiario_id, data, responsavel)
  select id, doacao_id, beneficiario_id, data, responsavel
  from jsonb_populate_recordset(null::public.entregas, p_dados -> 'entregas');
end;
$$;

revoke execute on function public.validar_data_entrega() from public, anon, authenticated;
revoke execute on function public.validar_status_doacao() from public, anon, authenticated;
revoke execute on function public.registrar_entrega(text, text, text, date, text) from public, anon, authenticated;
revoke execute on function public.remover_entrega(text) from public, anon, authenticated;
revoke execute on function public.apagar_tudo() from public, anon, authenticated;
revoke execute on function public.restaurar_exemplo(jsonb) from public, anon, authenticated;

grant execute on function public.registrar_entrega(text, text, text, date, text) to service_role;
grant execute on function public.remover_entrega(text) to service_role;
grant execute on function public.apagar_tudo() to service_role;
grant execute on function public.restaurar_exemplo(jsonb) to service_role;
