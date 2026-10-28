# Liga Candanga Solidária

Sistema de controle de doações e beneficiários da Liga Candanga de Futsal do DF. Foi desenvolvido no projeto de extensão universitária da UCB, com a Liga Candanga como parceira, dentro do programa **Liga Candanga Solidária** (ODS 10 — Redução das Desigualdades).

O projeto é dividido em duas partes, ambas em **JavaScript**:

- **`backend/`** — API REST em **Node.js + Express**. Aplica todas as regras de negócio e guarda os dados no **Supabase** (PostgreSQL).
- **`frontend/`** — interface em **React** (Vite + Tailwind CSS). Exige login da equipe (Supabase Auth) e conversa com a API via `fetch`.

Em produção, os dois rodam na **Vercel**: o frontend é servido como site estático e a API como Vercel Function (`api/index.js`).

## Stack

| Parte | Tecnologias |
|---|---|
| Backend | Node.js 22, Express 5, `@supabase/supabase-js` |
| Frontend | React 19, React Router (`HashRouter`), Vite 8, Tailwind CSS v4, `@supabase/supabase-js` |
| Banco de dados | Supabase (PostgreSQL), com migração SQL em `backend/supabase/migrations/` |
| Autenticação | Supabase Auth (e-mail e senha), sem auto-cadastro |
| Hospedagem | Vercel |
| Testes | `node:test` (backend), contra o Supabase local |

## Variáveis de ambiente

Os modelos estão em `backend/.env.example` e `frontend/.env.example`. Copie cada um para `.env` na mesma pasta e preencha os valores. Os arquivos `.env` não vão para o Git.

| Variável | Onde | Uso |
|---|---|---|
| `SUPABASE_URL` | backend | URL do projeto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | backend | Chave secreta do servidor. **Nunca** pode ir para o frontend |
| `PORT` | backend | Porta do servidor local (padrão `3000`) |
| `VITE_SUPABASE_URL` | frontend | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | frontend | Chave pública (anon), usada só para o login |

No Supabase local, os valores saem de `npx supabase status -o env` (pasta `backend/`).

## Como rodar localmente

Pré-requisitos: Node.js 22 (ou 20.19+) e Docker Desktop, que roda o Supabase local.

### 1. Supabase local

```bash
cd backend
npm install
npx supabase start
npx supabase db reset
```

O `db reset` aplica a migração. O painel local fica em `http://127.0.0.1:54323`, onde é possível criar um usuário em Authentication.

### 2. Backend e frontend (dois terminais)

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

A API sobe em `http://localhost:3000` e a interface em `http://localhost:5173`. O Vite repassa toda chamada `/api/...` para o backend (`frontend/vite.config.js`).

### 3. Testes

```bash
cd backend
npm test
```

Os testes exigem o Supabase local rodando e as variáveis `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` e `SUPABASE_ANON_KEY` definidas no terminal.

## Deploy

- **Banco:** `npx supabase link --project-ref <ref>` e `npx supabase db push`, rodados em `backend/`.
- **Vercel:** a configuração está em `vercel.json`. A instalação é feita separadamente no backend e no frontend, o build é o do frontend e a pasta publicada é `frontend/dist`. As rotas `/api/*` vão para a função `api/index.js`. As quatro variáveis de ambiente precisam estar cadastradas no projeto da Vercel.

## Estrutura

```
api/
  index.js             Função da Vercel: reexporta o app Express
backend/
  app.js               Cria o app Express, exige login em /api e registra as rotas
  server.js            Sobe o servidor local (carrega backend/.env)
  autenticacao.js      Valida o token de login (Bearer) no Supabase Auth
  supabase.js          Cliente do Supabase com a chave secreta
  banco.js             Acesso aos dados (consultas e funções do banco)
  constantes.js        Status das doações
  erros.js             Erros de regra (400) e falhas internas (500)
  seed.js              Dados de exemplo
  util.js              gerarId, hojeLocal (fuso de Brasília) e dataValida
  rotas/               doacoes, beneficiarios, entregas, resumo, sistema, cadastros
  supabase/
    config.toml        Configuração do Supabase local
    migrations/        Esquema do banco (tabelas, regras, funções e RLS)
  testes/              Testes da API
frontend/
  src/
    components/        Layout, Modal, StatCard, StatusBadge, Field
    lib/
      DataContext.jsx  Única camada que fala com a API (envia o token)
      supabase.js      Cliente do Supabase para o login
      constantes.js    Status das doações
      datas.js         Data de hoje no fuso local
    pages/
      Login.jsx
      Dashboard.jsx, Doacoes.jsx, Beneficiarios.jsx, Entregas.jsx
      cadastros/       Categorias, tipos e regiões (adicionar, renomear, remover)
      configuracoes/   Área do administrador (editar/remover)
vercel.json            Configuração do deploy
```

## API

Todas as rotas começam com `/api`, trocam JSON e **exigem login**: o cabeçalho `Authorization: Bearer <token>` traz o token da sessão do Supabase. Sem token válido, a resposta é **401**. Quando uma regra de negócio impede a operação, a API responde **400** com `{ "erro": "mensagem" }`, e o frontend mostra essa mensagem.

| Método | Rota | O que faz |
|---|---|---|
| GET | `/api/doacoes` | Lista doações |
| POST | `/api/doacoes` | Cadastra doação (nasce `Disponível`) |
| PUT | `/api/doacoes/:id` | Edita doação |
| DELETE | `/api/doacoes/:id` | Remove doação |
| GET | `/api/beneficiarios` | Lista beneficiários |
| POST | `/api/beneficiarios` | Cadastra beneficiário |
| PUT | `/api/beneficiarios/:id` | Edita beneficiário |
| DELETE | `/api/beneficiarios/:id` | Remove beneficiário |
| GET | `/api/entregas` | Lista entregas |
| POST | `/api/entregas` | Registra entrega (a doação passa para `Entregue`) |
| PUT | `/api/entregas/:id` | Edita entrega |
| DELETE | `/api/entregas/:id` | Remove entrega (a doação volta para `Disponível`) |
| GET | `/api/resumo` | Totais do dashboard |
| POST | `/api/sistema/restaurar-exemplo` | Substitui tudo pelos dados de exemplo |
| POST | `/api/sistema/apagar-tudo` | Apaga todos os dados |
| GET | `/api/cadastros` | Listas de categorias, tipos e regiões, com o uso de cada item |
| POST | `/api/cadastros/:lista` | Adiciona item (`:lista` = `categorias`, `tipos` ou `regioes`) |
| PUT | `/api/cadastros/:lista/:nome` | Renomeia item (o novo nome vale também nos registros que o usam) |
| DELETE | `/api/cadastros/:lista/:nome` | Remove item sem uso |

### Regras de negócio

- Doação precisa de origem, de quantidade inteira maior que zero, de data válida e de uma categoria cadastrada.
- Beneficiário precisa de nome e de um tipo e uma região cadastrados.
- Categorias, tipos e regiões são listas editáveis na tela **Cadastros**. Renomear um item atualiza os registros que o usam; um item em uso não pode ser removido. Os nomes têm até 60 caracteres e não se repetem.
- Só uma doação `Disponível` pode ser entregue, e a data da entrega não pode ser anterior ao recebimento.
- Uma doação só fica `Entregue` com o registro de uma entrega. Enquanto tiver entrega, não pode mudar de status nem ter data de recebimento posterior à da entrega.
- Não é possível remover doação entregue nem beneficiário com entregas.
- Remover uma entrega devolve a doação para `Disponível`.

As regras são aplicadas na API e reforçadas no banco (restrições, chaves estrangeiras, gatilhos e funções transacionais). Por isso continuam valendo para acessos que não passem pela API.

Simplificação assumida: cada doação é tratada como um lote único, entregue a um único beneficiário.

## Segurança

- Só usuários cadastrados no Supabase Auth acessam o sistema. O auto-cadastro fica desligado e as contas são criadas pelo administrador no painel do Supabase.
- As tabelas têm RLS ativo e nenhuma política: a chave pública não lê nem grava dados. Só a API, com a chave secreta, acessa o banco.
- A chave secreta existe apenas no servidor (backend local e variáveis da Vercel).

## Próximas fases

- Mapa interativo (Leaflet.js) com as regiões administrativas atendidas.
- Completar a região dos times importados, que entraram como "Não informada".
- Indicadores por quantidade de itens e por beneficiários atendidos.
- Relatório de impacto exportável.
- Lista completa das 35 regiões administrativas do DF.
- Fracionamento de doações entre vários beneficiários.
