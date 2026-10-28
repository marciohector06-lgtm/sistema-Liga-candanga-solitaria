create table public.categorias_doacao (
  nome text primary key check (btrim(nome) <> '' and char_length(nome) <= 60)
);

create table public.tipos_beneficiario (
  nome text primary key check (btrim(nome) <> '' and char_length(nome) <= 60)
);

create table public.regioes (
  nome text primary key check (btrim(nome) <> '' and char_length(nome) <= 60)
);

alter table public.categorias_doacao enable row level security;
alter table public.tipos_beneficiario enable row level security;
alter table public.regioes enable row level security;

revoke all on table public.categorias_doacao, public.tipos_beneficiario, public.regioes from anon, authenticated;

insert into public.categorias_doacao (nome) values
  ('Cesta básica'), ('Bola'), ('Rede'), ('Troféu'), ('Uniforme');

insert into public.tipos_beneficiario (nome) values
  ('Família'), ('Escolinha'), ('Instituição'), ('Time');

insert into public.regioes (nome) values
  ('Plano Piloto'), ('Gama'), ('Taguatinga'), ('Brazlândia'), ('Sobradinho'), ('Planaltina'),
  ('Paranoá'), ('Núcleo Bandeirante'), ('Ceilândia'), ('Guará'), ('Cruzeiro'), ('Samambaia'),
  ('Santa Maria'), ('São Sebastião'), ('Recanto das Emas'), ('Lago Sul'), ('Riacho Fundo'),
  ('Lago Norte'), ('Candangolândia'), ('Águas Claras'), ('Riacho Fundo II'), ('Sudoeste/Octogonal'),
  ('Varjão'), ('Park Way'), ('SCIA/Estrutural'), ('Sobradinho II'), ('Jardim Botânico'), ('Itapoã'),
  ('SIA'), ('Vicente Pires'), ('Fercal'), ('Sol Nascente/Pôr do Sol'), ('Arniqueira'), ('Arapoanga'),
  ('Água Quente'), ('Entorno (GO)'), ('Outro estado'), ('Não informada');

alter table public.doacoes drop constraint doacoes_categoria_check;
alter table public.beneficiarios drop constraint beneficiarios_tipo_check;
alter table public.beneficiarios drop constraint beneficiarios_regiao_check;

alter table public.doacoes
  add constraint doacoes_categoria_fkey foreign key (categoria)
  references public.categorias_doacao (nome) on update cascade on delete restrict;

alter table public.beneficiarios
  add constraint beneficiarios_tipo_fkey foreign key (tipo)
  references public.tipos_beneficiario (nome) on update cascade on delete restrict;

alter table public.beneficiarios
  add constraint beneficiarios_regiao_fkey foreign key (regiao)
  references public.regioes (nome) on update cascade on delete restrict;

create index doacoes_categoria_idx on public.doacoes (categoria);
create index beneficiarios_tipo_idx on public.beneficiarios (tipo);
create index beneficiarios_regiao_idx on public.beneficiarios (regiao);

create or replace function public.restaurar_exemplo(p_dados jsonb)
returns void
language plpgsql
set search_path = ''
as $$
begin
  perform public.apagar_tudo();

  insert into public.categorias_doacao (nome)
  select distinct item ->> 'categoria' from jsonb_array_elements(p_dados -> 'doacoes') item
  on conflict do nothing;

  insert into public.tipos_beneficiario (nome)
  select distinct item ->> 'tipo' from jsonb_array_elements(p_dados -> 'beneficiarios') item
  on conflict do nothing;

  insert into public.regioes (nome)
  select distinct item ->> 'regiao' from jsonb_array_elements(p_dados -> 'beneficiarios') item
  on conflict do nothing;

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

revoke execute on function public.restaurar_exemplo(jsonb) from public, anon, authenticated;
grant execute on function public.restaurar_exemplo(jsonb) to service_role;

insert into public.beneficiarios (id, nome, tipo, regiao, contato, necessidade, data_cadastro)
select format('time-%s', lpad(times.posicao::text, 3, '0')), times.nome, 'Time', 'Não informada', '', '', date '2026-10-28'
from unnest(array[
  'A2 FUTSAL',
  'AAGP/PROJEÇÃO',
  'AAGP/PROJEÇÃO GOLD',
  'AAGP/PROJEÇAO RED',
  'ABARKA FUTSAL',
  'ABC',
  'ACF FUTSAL',
  'AD3 FUTSAL',
  'ADESP',
  'ADV FUTSAL',
  'AKF FUTSAL',
  'ALEXFUTFSA',
  'AMERICA MINEIRO BRASÍLIA',
  'AMIGOS DO SETE',
  'ARTE LÍDER',
  'ASAS BRASÍLIA',
  'ASSOC PRÓ ESPORTE, EDUC E CULT MISSÃO RIO DE VIDA',
  'ASSOCIAÇÃO ESPORTIVA AO ALCANCE DE TODOS',
  'ASSOCIAÇÃO ESPORTIVA FILHOS DE DAVI',
  'ATHLETIC FUTEBOL CLUBE',
  'ATLETICO GUARÁ FUTSAL',
  'ATLÉTICO SOBRADINHO',
  'BARBOSA FUTSAL',
  'BLESSED FUTSAL',
  'BM FUTSAL',
  'BRASILIA FUTSAL',
  'BSA',
  'BVB PLANALTINA',
  'CARDIM SPORTS',
  'CDD ESPORTVAL',
  'CEMEIT',
  'CENTRO DE FORMAÇÃO DO ATLETA',
  'CENTRO DE TREINAMENTOS MD ESPORTES',
  'CEPE CANOAS',
  'CERRADO FUTSAL',
  'CERROS FUTSAL',
  'CESEA',
  'CESEA B',
  'CFA NOROESTE',
  'CHUTEIRA DE OURO ESPORTE CLUBE',
  'CID GAMA',
  'CID RIACHO FUNDO 2',
  'CLG',
  'CLV',
  'CRESSPOM / MILAN BSB',
  'DISTRITO FUTSAL',
  'DRIBLE SPORTS',
  'EC15',
  'EDUCANDÁRIO DE MARIA',
  'ESCOLA AJAX DF',
  'ESCOLA NOROESTE FUTSAL',
  'ESCOLINHA DE FUTSAL SÃO SEBASTIÃO',
  'ESPERANÇA -FC',
  'ESPORTIVO TIMBÓ',
  'ESTRUTURAL FUTSAL',
  'F&R FUTSAL',
  'FAFINHA FUTSAL',
  'FALA BAIXO F.C.',
  'FAMÍLIA SOUSA',
  'FÊNIX FUTSAL PLANALTINA DF',
  'FIDAS',
  'FUT CERRADO',
  'GAROTOS DO PLACAR',
  'GUERREIROS FC',
  'HD SPORTS',
  'HD SPORTS B',
  'HIBRIDUS FC',
  'I.R.S FUTSAL',
  'IMPACTO FUTSAL',
  'IMPERIAL CITY',
  'INICIAÇÃO ESPORTIVA DE FUTSAL - JACOB RIBEIRO',
  'INOVA FUT',
  'INSTITUTO DE MÃOS DADAS',
  'INSTITUTO ESPORTIVO VITÓRIA',
  'JARAGUÁ FUTSAL',
  'JUVENTUDE FUTSAL ACADEMY',
  'JUVENTUS RIACHO',
  'LAGO NORTE CLUBE ESPORTIVO',
  'LARANJA MECÂNICA',
  'LEGIÃO FUTSAL',
  'LOCTRAD SOCIAL',
  'MAGNUS',
  'MAITE VEICULOS / MAVERIEKS',
  'MINAS BRASÍLIA',
  'MOLEKADA',
  'NOVA GERAÇÃO',
  'NOVA GERAÇÃO B',
  'OESTE RÃ FUTSAL',
  'OLIMPICO/VIZINHANÇA',
  'OLIMPO DF',
  'OUSADIA FUTSAL CLUBE',
  'PARÇAS FUTSAL',
  'PELADAS DA VILA',
  'PFC FUTSAL FORTALEZA',
  'PINTAS E AMIGOS FUTEBOL CLUBE',
  'PJB',
  'PLANALTINA FUTSAL',
  'PLANALTO ESCOLA DE FUTSAL',
  'POTIGUAR EVENTOS ESPORTIVOS LTDA',
  'PRAZERES FUTSAL',
  'PROJETO KRG ANÁPOLIS',
  'PROJETO SUPER CAMPEOES',
  'RAÇA FUTSAL',
  'REAL ARUEIRA FUTSAL',
  'REAL ESPORTIVO UNIÃO',
  'REAL ESTÂNCIA F.C.',
  'REAL KONG',
  'RECBULL FUTSAL',
  'REDE GOL',
  'RIACHO FUNDO',
  'SABIA F.C.',
  'SAIDEIRA ETERNA',
  'SANTOS DF',
  'SANTOS DUMONT FUTSAL ESPORTE CLUBE',
  'SCJM',
  'SELEÇÃO DF',
  'SESC CEILÂNDIA',
  'SESI ESPORTES',
  'SHOW BRINDES',
  'SHOW DE BOLA FUTSAL',
  'SOL PRA SI FUTSAL',
  'TALENTOSOS',
  'TIGRES FUTSAL',
  'TITÃS FUTSAL CLUBE',
  'TOQUE DE FÉ',
  'TRÍADE FUTSAL',
  'TROVÃO FUTSAL',
  'UNB FUTSAL',
  'UNB FUTSAL FEMININO',
  'W. JUNIOR FUTSAL',
  'WILLSHOES F,C.'
]) with ordinality as times (nome, posicao)
on conflict (id) do nothing;
