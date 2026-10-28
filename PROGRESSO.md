# Progresso — Liga Candanga Solidária (app)

## v1 — protótipo funcional local

**Status: concluída**

- [x] Projeto Vite + React + Tailwind v4 configurado
- [x] Cadastro e listagem de doações, com status (Disponível / Reservada / Entregue)
- [x] Cadastro e listagem de beneficiários (família, escolinha, instituição)
- [x] Fluxo de entrega: vincula doação disponível a um beneficiário
- [x] Dashboard com totais, doações por categoria e beneficiários por região

## v1.1 — área do administrador e correções

**Status: concluída**

- [x] Tela **Configurações**: editar e remover doações, beneficiários e entregas, com busca
- [x] Regras de consistência: não remove doação entregue nem beneficiário com entregas; remover entrega devolve a doação para Disponível
- [x] Status **Reservada** pode ser definido na edição da doação
- [x] Aba **Sistema**: restaurar dados de exemplo ou apagar tudo
- [x] Correção: data padrão usa o fuso local
- [x] Correção: layout responsivo no celular
- [x] Correção: entrega não pode ter data anterior ao recebimento da doação

## v2 — backend em Node.js + Express e código em JavaScript

**Status: concluída**

- [x] Projeto separado em `backend/` e `frontend/`
- [x] TypeScript removido: todo o código em JavaScript (`.js` / `.jsx`)
- [x] API REST em Express com rotas de doações, beneficiários, entregas, resumo e sistema
- [x] Regras de negócio movidas do navegador (`DataContext`) para o backend
- [x] Dados salvos em `backend/dados.json` (antes: `localStorage` do navegador) — agora compartilhados entre todos os usuários
- [x] Frontend consome a API via `fetch`; telas e mensagens mantidas iguais
- [x] Express serve o frontend compilado, permitindo rodar tudo com um único comando
- [x] Testado: 22 cenários de regra de negócio na API e renderização das telas com dados vindos do backend

## v3 — Supabase, login da equipe e Vercel

**Status: concluída e em produção em https://liga-candanga-solidaria.vercel.app**

- [x] Arquivo JSON substituído por banco no Supabase (PostgreSQL), com migração SQL em `backend/supabase/migrations/`
- [x] Regras reforçadas no banco:
  - restrições de domínio (tipo, região, categoria, status, quantidade);
  - chaves estrangeiras com `ON DELETE RESTRICT`;
  - entrega única por doação;
  - gatilhos de status e de datas;
  - funções transacionais para registrar e remover entregas
- [x] Lacunas da v2 fechadas: tipo, região, categoria e datas validados no servidor; entrega para beneficiário inexistente recusada
- [x] RLS ativo sem políticas: só a API (chave secreta) acessa os dados
- [x] Login da equipe com Supabase Auth (e-mail e senha), sem auto-cadastro; API responde 401 sem token válido; botão "Sair"
- [x] API separada em `app.js` (exportável) e `server.js` (local); `api/index.js` publica o app como Vercel Function
- [x] `hojeLocal()` no fuso de Brasília, para não registrar a data errada em servidor UTC
- [x] Testes automatizados: 35 testes `node:test` da API contra o Supabase local
- [x] Teste no navegador (largura de celular): login, cadastro de beneficiário, doação, entrega, dashboard e saída
- [x] Projeto Supabase de produção criado (região São Paulo) e migração aplicada
- [x] Deploy na Vercel e quatro fluxos de aceite validados no site com conta real
- [x] Correção: telas de cadastro de Doações e Beneficiários passam a mostrar a mensagem de erro (da API ou de campo só com espaços)

## v3.1 — Cadastros, times da Liga, logo e tela cheia

**Status: pronta localmente (branch `v3.1-cadastros`), ainda sem publicação.** Pedidos da Liga em 28/10/2026.

- [x] Nova tela **Cadastros** com três listas editáveis: categorias de doação, tipos de beneficiário e regiões (adicionar, renomear e remover)
- [x] Listas fixas trocadas por tabelas no banco (`categorias_doacao`, `tipos_beneficiario`, `regioes`), com chave estrangeira `ON UPDATE CASCADE ON DELETE RESTRICT`
- [x] Novo tipo de beneficiário **Time**; regiões ampliadas para as 35 RAs do DF, mais Entorno (GO), Outro estado e Não informada
- [x] 131 times da Liga importados como beneficiários, com região "Não informada", porque a cidade da lista de origem é só o padrão do sistema da Liga. Ficaram de fora os inativos (Águia Dourada, Gol de Placa) e o nome repetido (MOLEKADA entrou uma vez)
- [x] Tela Beneficiários com busca e filtro por tipo; seletor de beneficiário em Entregas em ordem alfabética
- [x] Escudo da Liga na entrada (tela cheia, dividida em painel verde e formulário), no cabeçalho e como ícone da aba
- [x] Telas do sistema usando a largura inteira do monitor

## Próximas fases

- [ ] Mapa interativo (Leaflet.js) dos bairros atendidos
- [ ] Indicadores por quantidade de itens e por beneficiários atendidos
- [ ] Relatório de impacto exportável
- [ ] Completar a região de cada time importado

## Decisões tomadas

- **JavaScript + Express**: o sistema é apresentado na disciplina de Programação Web, que trabalha com Node.js e Express.
- **Arquivo JSON** como armazenamento: é a forma mais simples de explicar persistência no backend sem depender de banco instalado; a troca por um banco fica isolada em `backend/banco.js`.
- **Regras de negócio no backend**: o servidor é a fonte da verdade; o frontend só exibe a mensagem de erro que a API devolve.
- **Proxy do Vite** (`/api` → `localhost:3000`) no desenvolvimento, evitando configuração de CORS.
- **HashRouter**: permite que o Express sirva o frontend sem precisar de rota coringa.
- Doação tratada como lote único (sem fracionamento entre beneficiários).
- **v3 — Express mantido como Vercel Function**: as regras continuam no servidor e a API não mudou de contrato. O frontend só usa o Supabase para o login.
- **v3 — Chave secreta só no servidor + RLS sem políticas**: a chave pública não acessa dados, mesmo que alguém a extraia do frontend.
- **v3 — Contas de hospedagem**: o Supabase e a Vercel (equipe CursosEad) estão em contas pessoais do coordenador da equipe. A transferência para contas da Liga ao fim do projeto ainda precisa ser combinada.

## Observação para quem usa Windows

Se o `npm run dev` / `npm run build` do frontend falhar com "An Application Control policy has blocked this file", é o **Smart App Control** do Windows bloqueando os binários nativos do Vite 8. Dá para gerar o build via Docker (dentro da pasta `frontend`) e depois rodar o backend normalmente no modo apresentação:

```bash
docker run --rm -v "$PWD:/app" -v liga-candanga-nm:/app/node_modules -w /app node:24 sh -c "npm ci && npx vite build"
```

O backend (Express) não usa binários nativos e não é afetado.
