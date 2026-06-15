# Valore — Frontend

Interface do **Valore** construída com **React 19 + TypeScript + Vite**.

---

## Tecnologias

- React 19 + TypeScript
- Vite 7
- React Router v6
- Axios
- Recharts
- Tailwind CSS
- shadcn/ui + Radix UI
- Framer Motion
- next-themes
- lucide-react

---

## Estrutura

```text
frontend/
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── CategoryChart.tsx
│   │   │   ├── IncomeExpenseChart.tsx
│   │   │   ├── MonthlyChart.tsx
│   │   │   ├── StatCard.tsx
│   │   │   ├── TransactionItem.tsx
│   │   │   └── TrendsCard.tsx
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Topbar.tsx
│   │   └── ui/
│   ├── context/
│   │   ├── transaction/
│   │   │   ├── TransactionContext.tsx
│   │   │   ├── TransactionContext.test.tsx
│   │   │   ├── transactionInstance.ts
│   │   │   ├── types.ts
│   │   │   └── useTransactions.ts
│   │   ├── user/
│   │   │   ├── UserContext.tsx
│   │   │   ├── userInstance.ts
│   │   │   ├── types.ts
│   │   │   └── useUser.ts
│   │   └── index.ts
│   ├── lib/
│   │   └── api.ts
│   ├── pages/
│   │   ├── Accounts.tsx
│   │   ├── Analytics.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Landing.tsx
│   │   ├── Login.tsx
│   │   ├── Profile.tsx
│   │   ├── Register.tsx
│   │   ├── Settings.tsx
│   │   └── Transactions.tsx
│   ├── services/
│   │   ├── accountService.ts
│   │   ├── analyticsService.ts
│   │   ├── categoryService.ts
│   │   ├── hintService.ts
│   │   ├── transactionService.ts
│   │   └── transactionService.test.ts
│   ├── types/
│   │   ├── finance.ts
│   │   ├── transaction.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── transactionFormat.ts
│   │   └── transactionFormat.test.ts
│   ├── test/
│   │   └── setup.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── vercel.json
├── vite.config.ts
├── index.html
└── package.json
```

---

## Páginas

| Rota            | Descrição                                         |
| --------------- | ------------------------------------------------- |
| `/landing`      | Landing page pública                              |
| `/login`        | Login                                             |
| `/register`     | Cadastro                                          |
| `/`             | Dashboard com visão geral e gráficos              |
| `/accounts`     | Contas financeiras (débito e crédito)             |
| `/transactions` | Listagem, criação, edição e deleção de transações |
| `/analytics`    | Análises detalhadas com comparativos              |
| `/profile`      | Edição de perfil e senha                          |
| `/settings`     | Tema e preferências                               |

---

## Arquitetura

**API client** — instância Axios em `lib/api.ts` com `baseURL="/api"` (proxy Vercel para o backend Heroku) e `withCredentials: true` para envio automático do cookie de autenticação.

**Contextos** — `UserProvider` verifica sessão via `GET /auth/me` ao carregar a aplicação. `TransactionProvider` carrega transações do usuário autenticado e expõe funções de CRUD, incluindo operações em grupo (parcelas, transferências).

**Rotas protegidas** — `ProtectedRoute` redireciona para `/landing` se não autenticado. `PublicRoute` redireciona para `/` se já autenticado.

---

## Como Executar

```bash
npm install
npm run dev
```

O app fica disponível em http://localhost:5173.

Em desenvolvimento, o Axios aponta para `http://localhost:8000` via variável de ambiente. Crie `.env.local` se necessário:

```env
VITE_API_URL=http://localhost:8000
```

---

## Scripts

| Comando            | Descrição                       |
| ------------------ | ------------------------------- |
| `npm run dev`      | Servidor de desenvolvimento     |
| `npm run build`    | Build de produção               |
| `npm run lint`     | ESLint                          |
| `npm run preview`  | Serve a build localmente        |
| `npm run test`     | Testes em modo watch (Vitest)   |
| `npm run test:run` | Executa todos os testes uma vez |
| `npm run test:ui`  | Interface visual do Vitest      |

---

## Testes

```bash
npm run test:run
```

25 testes cobrindo três frentes:

| Arquivo                                           | Cobertura                                                                                    |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `utils/transactionFormat.test.ts`                 | Formatação de valores, classes de estilo condicionais, agrupamento de transações por mês     |
| `services/transactionService.test.ts`             | Chamadas corretas à API (Axios mockado) para CRUD, parcelas e transferências                 |
| `context/transaction/TransactionContext.test.tsx` | Atualizações de estado: adicionar, editar, remover transação/parcela/grupo, limpar por conta |

**Resultado atual: 25/25 (100%) de aprovação.**

Complementarmente, a interface é validada manualmente: fluxo de autenticação, CRUD de contas e transações, parcelamento, transferências, navegação entre análises, dark/light mode e responsividade (Chrome/Firefox DevTools + iPhone físico).

---

## Deploy

```bash
vercel --prod
```

O `vercel.json` configura proxy para o backend e rewrites para o React Router:

```json
{
  "rewrites": [
    {
      "source": "/api/:path+/",
      "destination": "https://valore-api-...herokuapp.com/:path+/"
    },
    {
      "source": "/api/:path*",
      "destination": "https://valore-api-...herokuapp.com/:path*"
    },
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

