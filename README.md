# Velô Sprint - Configurador de Veículo Elétrico

Aplicação web em React para configuração e compra do veículo elétrico **Velô Sprint**.

## Sobre o Projeto

Uma SPA (Single Page Application) que permite:
- Personalizar cores, rodas e opcionais do veículo
- Calcular preços em tempo real
- Realizar pedidos com análise de crédito
- Consultar status de pedidos

**Especificações do Velô Sprint:** 450 km de autonomia | 0-100 km/h em 3.2s | 500 cv

---

## Stack Tecnológica

| Categoria | Tecnologias |
|-----------|-------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| **Estado** | Zustand (global), React Hook Form (formulários) |
| **Validação** | Zod |
| **Data Fetching** | TanStack Query |
| **Backend** | Supabase (PostgreSQL + Edge Functions) |

---

## Instalação

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev
```

Acesse: `http://localhost:8080`

---

## Configuração do Supabase

### 1. Criar Projeto

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Clique em **New Project**
3. Escolha um nome e senha para o banco
4. Aguarde a criação (~2 minutos)

### 2. Variáveis de Ambiente

Copie [`.env.example`](.env.example) para `.env` e preencha **um** conjunto de valores (preview para desenvolvimento local e E2E; produção só no Vercel e em máquinas que precisem dela).

```bash
cp .env.example .env
```

Não duplique as mesmas chaves no mesmo arquivo (por exemplo dois `VITE_SUPABASE_URL`); use um arquivo por ambiente (`.env` para o dia a dia, ou `.env.preview` / `.env.production` ignorados pelo Git) se precisar dos dois.

Variáveis usadas pela aplicação (Vite):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID` (opcional, se for usado no front)

Para os testes E2E que acessam o Postgres direto (Kysely), use `E2E_DATABASE_URL` ou `DATABASE_URL` (connection string do pooler). Em CI, só `E2E_DATABASE_URL` é usada (secret do GitHub).

> Valores do Supabase: **Project Settings → API** (e connection string em **Database**).

### 3. Vercel: Preview versus Produção

No painel do projeto em [Vercel](https://vercel.com) → **Settings → Environment Variables**, cadastre as mesmas chaves `VITE_*` em dois ambientes com valores diferentes:

| Variável | Preview | Production |
|----------|---------|------------|
| `VITE_SUPABASE_URL` | URL do projeto Supabase de **preview** | URL do projeto Supabase de **produção** |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | chave anon/publishable do preview | chave do projeto de produção |
| `VITE_SUPABASE_PROJECT_ID` | ref do projeto preview (opcional no front) | ref do projeto de produção |

**Importante:** cada variável precisa ter **valor preenchido** nos ambientes correspondentes (não deixe `VITE_*` apenas criadas ou com string vazia). Se o `vercel pull` trouxer `VITE_SUPABASE_URL=""`, o `vite build` gera bundle sem Supabase e o site pode abrir **em branco**. Depois de corrigir, faça um novo deploy (rode o workflow de CD ou redeploy manual).

O workflow em `.github/workflows/cd.yml` executa `vercel pull` + build com `--environment=preview` no deploy de preview e com `--environment=production` no promote; o bundle do front passa a apontar para o Supabase correspondente.

### 4. GitHub Actions (E2E no banco de preview)

No repositório GitHub → **Settings → Secrets and variables → Actions**, crie o secret **`SUPABASE_PREVIEW_DATABASE_URL`** com a connection string PostgreSQL (pooler) do projeto Supabase de **preview** apenas. O job `e2e-tests` define `E2E_DATABASE_URL` a partir desse secret para que seeds e limpezas do Playwright não usem produção.

**Opcional — reforço no CI (frontend):** Se as variáveis `VITE_*` no painel da Vercel vierem vazias no `vercel pull`, o workflow pode **sobrescrever** o `.env.production.local` antes do build com secrets do GitHub (apenas quando **URL** e **publishable key** estiverem definidas):

| Secret | Uso |
|--------|-----|
| `PREVIEW_VITE_SUPABASE_URL` | URL do projeto Supabase **preview** (job build preview) |
| `PREVIEW_VITE_SUPABASE_PUBLISHABLE_KEY` | Chave publishable/anônima do preview |
| `PREVIEW_VITE_SUPABASE_PROJECT_ID` | Opcional (`VITE_SUPABASE_PROJECT_ID`) |
| `PRODUCTION_VITE_SUPABASE_URL` | URL do Supabase **produção** (job promote) |
| `PRODUCTION_VITE_SUPABASE_PUBLISHABLE_KEY` | Chave de produção |
| `PRODUCTION_VITE_SUPABASE_PROJECT_ID` | Opcional |

Com isso, o CI continua alinhado ao Supabase mesmo com placeholders vazios na Vercel; o ideal é ainda assim corrigir os valores no painel da Vercel para ambientes Preview e Production.

### 5. Deploy (banco + functions)

```bash
# Instalar CLI
yarn add supabase -D

# Login e vincular projeto
yarn supabase login
yarn supabase link --project-ref seu_project_ref

# Aplicar migrações (cria tabelas e RLS)
yarn supabase db push

# Deploy das Edge Functions
yarn supabase functions deploy
```

Pronto! O banco e as functions estarão configurados.

---

## Continuous Deployment

Push na branch `main` dispara o workflow **Continuous Deployment** (`.github/workflows/cd.yml`): testes unitários, build e deploy **preview** na Vercel, testes E2E contra a URL de preview e o banco preview, e em seguida build + deploy de **produção**. O deploy automático pelo Git na `main` está desligado em `vercel.json`; o fluxo passa só pelo Actions.

Depois de ajustar variáveis na Vercel ou secrets `PREVIEW_VITE_*` / `PRODUCTION_VITE_*`, rode o workflow de novo em **Actions** e valide preview e domínio de produção no navegador (aba **Console** para erros de Supabase).

---

## Estrutura Principal

```
src/
├── pages/           # Páginas da aplicação
├── components/      # Componentes React
│   ├── configurator/   # Configurador do carro
│   ├── landing/        # Landing page
│   └── ui/             # Componentes shadcn/ui
├── store/           # Estado global (Zustand)
├── hooks/           # Hooks customizados
└── integrations/    # Cliente Supabase
```

---

## Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Landing page |
| `/configure` | Configurador do veículo |
| `/order` | Checkout/Pedido |
| `/success` | Confirmação do pedido |
| `/lookup` | Consulta de pedidos |

---

## Modelo de Preços

- **Preço base:** R$ 40.000
- **Rodas Sport:** +R$ 2.000
- **Precision Park:** +R$ 5.500
- **Flux Capacitor:** +R$ 5.000
- **Financiamento:** 12x com juros de 2% a.m.

---

## Banco de Dados

**Tabela `orders`** — campos principais:
- `order_number` — Formato: VLO-XXXXXX
- `color`, `wheel_type`, `optionals` — Configuração
- `customer_name`, `customer_email`, `customer_cpf` — Cliente
- `payment_method`, `total_price` — Pagamento
- `status` — pending, approved, rejected, analysis

---

## Análise de Crédito

| Score | Resultado |
|-------|-----------|
| > 700 | Aprovado |
| 501-700 | Em análise |
| ≤ 500 | Reprovado |

*Se entrada ≥ 50% do total, aprova mesmo com score < 700*

---

## Fluxo Principal

```
Landing → Configurador → Checkout → Análise de Crédito → Confirmação
```

---

## Scripts

```bash
npm run dev      # Desenvolvimento
npm run build    # Build de produção
npm run lint     # Verificar código
```