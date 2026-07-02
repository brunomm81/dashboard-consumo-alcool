# Dashboard de Consumo Global de Álcool (Next.js)

Dashboard em **Next.js (App Router)** protegido por login server-side, que
permite enviar um arquivo `drinks.csv` e visualizar o consumo global de álcool
em gráficos. A cada envio, os dados são gravados no **Supabase** através de uma
API route no servidor (usando a `service_role`, que nunca é exposta ao navegador).

## Funcionalidades

- **Login server-side**: credenciais validadas em `/api/login`, sessão via
  cookie `httpOnly`. Rotas protegidas por `middleware.js`.
- Botão para **enviar o `drinks.csv`** (parsing feito no navegador).
- Visualização com **indicadores** e **4 gráficos** (Chart.js via react-chartjs-2):
  - Top 10 países por litros puros de álcool
  - Distribuição de países por faixa de consumo
  - Consumo global por tipo de bebida (cerveja / destilados / vinho)
  - Cerveja x Destilados x Vinho nos 10 maiores países
- Tabela com os dados completos.
- **Gravação server-side** no Supabase (tabelas `uploads` e `drinks`).

## Estrutura

```
app/
  layout.js            Layout raiz + CSS global
  globals.css          Estilos
  page.js              Redireciona para /login ou /dashboard conforme o cookie
  login/page.js        Tela de login (client)
  dashboard/
    page.js            Server component (revalida o cookie)
    Dashboard.js       UI do dashboard (client): upload, stats, tabela
    Charts.js          Gráficos (client)
  api/
    login/route.js     Valida credenciais e define o cookie httpOnly
    logout/route.js    Encerra a sessão
    upload/route.js    Grava os dados no Supabase (service_role)
lib/
  auth.js              Helpers de autenticação (servidor)
  csv.js               Parser de CSV e normalização (cliente)
  supabaseServer.js    Cliente Supabase server-side (service_role)
middleware.js          Protege /dashboard e /api/upload
```

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha (o `.env.local` **não** é
versionado):

| Variável                    | Descrição                                   |
| --------------------------- | ------------------------------------------- |
| `DASHBOARD_USER`            | Usuário do login.                           |
| `DASHBOARD_PASSWORD`        | Senha do login.                             |
| `AUTH_COOKIE_SECRET`        | Segredo que assina o cookie de sessão.      |
| `SUPABASE_URL`              | URL do projeto Supabase.                     |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave secreta (somente servidor).           |
| `SUPABASE_SECRET_KEY`       | Chave secreta alternativa (referência).      |
| `SUPABASE_DB_PASSWORD`      | Senha do banco (referência).                 |

> Nenhuma variável usa o prefixo `NEXT_PUBLIC_`, ou seja, **nada** vai ao
> navegador. Todo acesso ao Supabase acontece no servidor.

## Como rodar localmente

Requer **Node.js 18.18+**.

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## Formato esperado do CSV

Cabeçalho:

```
country,beer_servings,spirit_servings,wine_servings,total_litres_of_pure_alcohol
```

Apenas `country` e `total_litres_of_pure_alcohol` são obrigatórias.

## Banco de dados (Supabase)

Projeto: **dashdrink**. Tabelas:

- `uploads` — `id`, `file_name`, `row_count`, `uploaded_at`.
- `drinks` — `id`, `upload_id`, `country`, `beer_servings`, `spirit_servings`,
  `wine_servings`, `total_litres_of_pure_alcohol`, `created_at`.

RLS habilitado, **sem políticas públicas**: apenas a `service_role` (servidor)
acessa as tabelas.

## Deploy (Vercel)

Feito manualmente. Ao importar o repositório na Vercel:

1. Framework detectado automaticamente: **Next.js** (sem configuração extra).
2. Configure as **Environment Variables** (as mesmas do `.env.local`) no painel
   da Vercel.
3. Deploy.

## Segurança

- Login e gravação no Supabase são **server-side**; a `service_role` e a senha
  ficam apenas no servidor, nunca no navegador.
- Ainda assim, **rotacione as chaves do Supabase** — elas já circularam durante
  o desenvolvimento.
- O login usa comparação simples de usuário/senha via env; para produção
  considere hashing de senha e/ou Supabase Auth.
