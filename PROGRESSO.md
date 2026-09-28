# Progresso — Liga Candanga Solidária (app)

## Fase atual: v1 — protótipo funcional local

**Status: concluída**

- [x] Projeto Vite + React + TypeScript + Tailwind v4 configurado
- [x] Camada de dados local (`DataContext.tsx`), pronta para ser trocada por Supabase sem mexer nas páginas
- [x] Cadastro e listagem de doações, com status (Disponível / Reservada / Entregue)
- [x] Cadastro e listagem de beneficiários (família, escolinha, instituição)
- [x] Fluxo de entrega: vincula doação disponível a um beneficiário
- [x] Dashboard com totais, doações por categoria e beneficiários por região
- [x] Testado ponta a ponta (cadastro → vínculo → atualização do dashboard) e visualmente em todas as telas

## v1.1 — área do administrador e correções

**Status: concluída**

- [x] Tela **Configurações** (`src/pages/configuracoes/`): editar e remover doações, beneficiários e entregas, com busca
- [x] Regras de consistência: não remove doação entregue nem beneficiário com entregas; remover entrega devolve a doação para Disponível
- [x] Status **Reservada** pode ser definido na edição da doação
- [x] Aba **Sistema**: restaurar dados de exemplo ou apagar tudo
- [x] Correção: data padrão usa o fuso local (antes, após 21h em Brasília, vinha o dia seguinte)
- [x] Correção: layout responsivo no celular (menu e tabelas)
- [x] Correção: app não quebra mais com `localStorage` incompleto
- [x] Correção: entrega não pode ter data anterior ao recebimento da doação

## Próximas fases

- [ ] Conectar Supabase de verdade (ver README.md, seção "Próximo passo")
- [ ] Mapa interativo (Leaflet.js) dos bairros atendidos
- [ ] Autenticação da equipe — importante: hoje a tela Configurações fica aberta para qualquer pessoa com o link
- [ ] Deploy no Vercel
- [ ] Relatório de impacto exportável

## Decisões tomadas

- **HashRouter** em vez de BrowserRouter: evita precisar configurar rewrites no host estático (ex.: Vercel) nesta fase inicial.
- **localStorage** como stand-in do Supabase: permite validar o fluxo completo sem esperar credenciais, e a troca depois é isolada em um único arquivo (`DataContext.tsx`).
- Doação tratada como lote único (sem fracionamento entre beneficiários) para manter a v1 simples — ver README para o racional.
- Regras de edição/remoção ficam no `DataContext.tsx` (não nas telas), para continuarem valendo na troca para o Supabase.

## Observação para quem usa Windows

Se o `npm run dev` / `npm run build` falhar com "An Application Control policy has blocked this file", é o **Smart App Control** do Windows bloqueando os binários nativos do Vite 8. Dá para rodar via Docker:

```bash
docker run -d --name liga-candanga-dev -p 5174:5173 -v "$PWD:/app" -v liga-candanga-nm:/app/node_modules -w /app node:24 sh -c "npm ci && npx vite --host 0.0.0.0"
```

Acesse em `http://localhost:5174`. Após alterar o código, rode `docker restart liga-candanga-dev`.
