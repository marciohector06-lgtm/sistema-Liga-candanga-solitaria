# Liga Candanga Solidária

Sistema de controle de doações e beneficiários da Liga Candanga de Futsal do DF, desenvolvido para o projeto de extensão universitária (UCB) com a Liga Candanga como parceira, dentro do programa **Liga Candanga Solidária** (ODS 10 — Redução das Desigualdades).

O projeto é dividido em duas partes, ambas em **JavaScript**:

- **`backend/`** — API REST em **Node.js + Express**. Guarda os dados e aplica todas as regras de negócio.
- **`frontend/`** — interface em **React** (Vite + Tailwind CSS). Mostra as telas e conversa com a API via `fetch`.

## Stack

| Parte | Tecnologias |
|---|---|
| Backend | Node.js 20+, Express 5 |
| Frontend | React 19, React Router (`HashRouter`), Vite, Tailwind CSS v4 |
| Dados | Arquivo `backend/dados.json` (criado automaticamente) |

## Como rodar

Pré-requisito: Node.js 20 ou superior.

### Modo desenvolvimento (dois terminais)

Terminal 1 — backend:

```bash
cd backend
npm install
npm run dev
```

A API sobe em `http://localhost:3000`.

Terminal 2 — frontend:

```bash
cd frontend
npm install
npm run dev
```

A interface sobe em `http://localhost:5173`. O Vite repassa toda chamada `/api/...` para o backend (configurado em `frontend/vite.config.js`), por isso não é preciso configurar CORS.

### Modo apresentação (um único servidor)

```bash
cd frontend
npm install
npm run build

cd ../backend
npm install
npm start
```

Acesse `http://localhost:3000`. O Express serve a API e também as telas já compiladas (`frontend/dist`).

### Variáveis de ambiente

| Variável | Padrão | Uso |
|---|---|---|
| `PORT` | `3000` | Porta do servidor Express |

## Estrutura

```
backend/
  server.js            Cria o app Express, registra as rotas e sobe o servidor
  banco.js             Lê e grava o arquivo dados.json
  seed.js              Dados de exemplo usados no primeiro acesso
  util.js              gerarId e hojeLocal
  rotas/
    doacoes.js         CRUD de doações + regras
    beneficiarios.js   CRUD de beneficiários + regras
    entregas.js        CRUD de entregas + regras (muda o status da doação)
    resumo.js          Números do dashboard
    sistema.js         Restaurar exemplo / apagar tudo
frontend/
  src/
    components/        Layout, Modal, StatCard, StatusBadge, Field
    lib/
      DataContext.jsx  Única camada que fala com a API (fetch)
      constantes.js    Categorias, status, tipos e regiões
      datas.js         Data de hoje no fuso local
    pages/
      Dashboard.jsx, Doacoes.jsx, Beneficiarios.jsx, Entregas.jsx
      configuracoes/   Área do administrador (editar/remover)
```

## API

Todas as rotas começam com `/api`. Os dados vão e voltam em JSON. Quando uma regra de negócio impede a operação, a API responde **400** com `{ "erro": "mensagem" }`, e o frontend mostra essa mensagem na tela.

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
| POST | `/api/entregas` | Registra entrega (doação passa para `Entregue`) |
| PUT | `/api/entregas/:id` | Edita entrega |
| DELETE | `/api/entregas/:id` | Remove entrega (doação volta para `Disponível`) |
| GET | `/api/resumo` | Totais do dashboard |
| POST | `/api/sistema/restaurar-exemplo` | Substitui tudo pelos dados de exemplo |
| POST | `/api/sistema/apagar-tudo` | Apaga todos os dados |

### Regras de negócio (aplicadas no backend)

- Doação precisa de origem e de quantidade inteira maior que zero.
- Beneficiário precisa de nome.
- Só uma doação `Disponível` pode ser entregue, e a data da entrega não pode ser anterior ao recebimento da doação.
- Uma doação só fica `Entregue` registrando uma entrega; enquanto tiver entrega, não pode mudar de status nem ter data de recebimento posterior à entrega.
- Não é possível remover doação entregue nem beneficiário com entregas.
- Remover uma entrega devolve a doação para `Disponível`.

Simplificação assumida: cada doação é tratada como um lote único, vinculado a um único beneficiário por vez.

## Dados

Os dados ficam em `backend/dados.json`. Se o arquivo não existir, a API responde com os dados de exemplo (`seed.js`) e cria o arquivo na primeira alteração. Para recomeçar do zero, basta apagar o arquivo ou usar a aba **Configurações → Sistema**.

## Próximas fases

- Trocar o arquivo JSON por um banco de dados (PostgreSQL/Supabase).
- Mapa interativo (Leaflet.js) com as regiões administrativas atendidas.
- Autenticação da equipe — hoje a tela Configurações fica aberta para qualquer pessoa com o link.
- Fracionamento de doações entre múltiplos beneficiários.
- Relatório de impacto exportável.
- Deploy (Render ou Railway, por ter um servidor Node).
