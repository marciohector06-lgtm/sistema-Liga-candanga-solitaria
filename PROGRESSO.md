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

## Próximas fases

- [ ] Trocar o arquivo JSON por banco de dados (PostgreSQL/Supabase)
- [ ] Mapa interativo (Leaflet.js) dos bairros atendidos
- [ ] Autenticação da equipe — importante: hoje a tela Configurações fica aberta para qualquer pessoa com o link
- [ ] Deploy (Render ou Railway)
- [ ] Relatório de impacto exportável

## Decisões tomadas

- **JavaScript + Express**: o sistema é apresentado na disciplina de Programação Web, que trabalha com Node.js e Express.
- **Arquivo JSON** como armazenamento: é a forma mais simples de explicar persistência no backend sem depender de banco instalado; a troca por um banco fica isolada em `backend/banco.js`.
- **Regras de negócio no backend**: o servidor é a fonte da verdade; o frontend só exibe a mensagem de erro que a API devolve.
- **Proxy do Vite** (`/api` → `localhost:3000`) no desenvolvimento, evitando configuração de CORS.
- **HashRouter**: permite que o Express sirva o frontend sem precisar de rota coringa.
- Doação tratada como lote único (sem fracionamento entre beneficiários).

## Observação para quem usa Windows

Se o `npm run dev` / `npm run build` do frontend falhar com "An Application Control policy has blocked this file", é o **Smart App Control** do Windows bloqueando os binários nativos do Vite 8. Dá para gerar o build via Docker (dentro da pasta `frontend`) e depois rodar o backend normalmente no modo apresentação:

```bash
docker run --rm -v "$PWD:/app" -v liga-candanga-nm:/app/node_modules -w /app node:24 sh -c "npm ci && npx vite build"
```

O backend (Express) não usa binários nativos e não é afetado.
