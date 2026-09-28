# Liga Candanga Solidária

Protótipo do sistema de controle de doações e beneficiários da Liga Candanga de Futsal do DF, desenvolvido para o projeto de extensão universitária (UCB) com a Liga Candanga como parceira, dentro do programa **Liga Candanga Solidária** (ODS 10 — Redução das Desigualdades).

## Stack

- [Vite](https://vitejs.dev/) + React + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/) (via `@tailwindcss/vite`)
- [React Router](https://reactrouter.com/) (`HashRouter`, para funcionar em qualquer host estático sem configuração extra)
- Persistência: `localStorage` nesta fase (ver seção **Dados** abaixo). O plano final é Supabase.

## Setup

```bash
npm install
npm run dev
```

A aplicação sobe em `http://localhost:5173`.

Build de produção:

```bash
npm run build
npm run preview
```

## Estrutura

```
src/
  components/     Layout, StatusBadge, StatCard, Field (componentes reutilizáveis)
  lib/
    types.ts        Tipos de domínio (Doacao, Beneficiario, Entrega, ResumoImpacto)
    seed.ts          Dados de exemplo usados no primeiro carregamento
    DataContext.tsx  Camada de dados (estado + persistência)
  pages/
    Dashboard.tsx       Resumo de impacto
    Doacoes.tsx         Cadastro e listagem de doações
    Beneficiarios.tsx   Cadastro e listagem de beneficiários
    Entregas.tsx        Vínculo de uma doação a um beneficiário
```

## Fluxo do protótipo (v1)

1. **Doações**: registra o que foi arrecadado (categoria, quantidade, origem, data). Toda doação nasce com status `Disponível`.
2. **Beneficiários**: cadastra famílias, escolinhas ou instituições que podem receber doações, com região administrativa e necessidade.
3. **Entregas**: vincula uma doação disponível a um beneficiário. Ao registrar, a doação passa para o status `Entregue`.
4. **Dashboard**: totais de doações, doações disponíveis, beneficiários e entregas, além de doações por categoria, beneficiários por região e as últimas entregas.

Simplificação assumida nesta v1: cada doação é tratada como um lote único, vinculado a um único beneficiário por vez (sem fracionar quantidade entre vários beneficiários). Isso cobre o fluxo essencial do programa e pode evoluir depois, se o grupo achar necessário.

## Dados

Por enquanto os dados vivem no `localStorage` do navegador (chave `liga-candanga-solidaria:v1`), começando com alguns exemplos (marcados como "(exemplo)"). Isso permite testar o fluxo completo sem depender de credenciais externas.

As funções em `DataContext.tsx` (`adicionarDoacao`, `adicionarBeneficiario`, `registrarEntrega`, etc.) já têm a mesma assinatura que teriam se chamassem o Supabase — a troca de `localStorage` para Supabase deve significar reescrever o *dentro* dessas funções (chamadas `supabase.from(...).insert(...)` etc.), sem precisar mudar nenhuma página.

### Próximo passo: conectar o Supabase de verdade

1. Criar um projeto em [supabase.com](https://supabase.com).
2. Criar as tabelas `doacoes`, `beneficiarios` e `entregas` espelhando os tipos em `src/lib/types.ts`.
3. Instalar `@supabase/supabase-js` e criar um client em `src/lib/supabaseClient.ts` com a URL e a anon key do projeto (via variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`).
4. Reescrever as funções de `DataContext.tsx` para ler/escrever no Supabase em vez do `localStorage`.

## Próximas fases (fora do escopo desta v1)

- Mapa interativo (Leaflet.js) com os bairros/regiões administrativas atendidas.
- Autenticação simples para os membros da equipe/Liga.
- Fracionamento de doações entre múltiplos beneficiários.
- Relatório de impacto exportável (o "Relatório anual de impacto" previsto no programa Liga Candanga Solidária).
- Deploy no Vercel.
