# Valore — Backend

API REST do **Valore** construída com **FastAPI** e **Python 3.13**.

---

## Tecnologias

- Python 3.13
- FastAPI 0.128
- SQLAlchemy 2.0 + Alembic
- PostgreSQL + psycopg2
- Pandas 3.0
- Pydantic v2 + pydantic-settings
- python-jose (JWT)
- bcrypt
- Uvicorn

---

## Estrutura

```text
backend/
├── src/
│   ├── api/
│   │   ├── app.py
│   │   └── routes/
│   │       ├── auth.py
│   │       ├── transactions.py
│   │       ├── accounts.py
│   │       ├── categories.py
│   │       ├── analytics.py
│   │       └── upload.py
│   ├── core/
│   │   ├── config.py
│   │   ├── cors.py
│   │   ├── database.py
│   │   ├── dependencies.py
│   │   └── security.py
│   ├── models/
│   │   ├── user.py
│   │   ├── account.py
│   │   ├── transaction.py
│   │   ├── category.py
│   │   └── description_hint.py
│   ├── schemas/
│   │   ├── user.py
│   │   ├── account.py
│   │   ├── transaction.py
│   │   ├── category.py
│   │   ├── finance.py
│   │   └── error.py
│   ├── services/
│   │   ├── balance.py
│   │   └── processing.py
│   ├── pipelines/
│   └── main.py
├── alembic/
├── tests/
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_accounts.py
│   ├── test_transactions.py
│   └── test_analytics.py
├── pytest.ini
├── requirements.txt
└── README.md
```

---

## Variáveis de Ambiente

Crie o arquivo `.env` na raiz de `backend/`:

```env
DATABASE_URL=postgresql://postgres:senha@localhost:5432/valore
SECRET_KEY=sua_chave_secreta_longa
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Produção
ENVIRONMENT=production
FRONTEND_URL=https://valore-finance.vercel.app
```

---

## Como Executar

```bash
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Linux/Mac
pip install -r requirements.txt
alembic upgrade head
uvicorn src.main:app --reload
```

Documentação interativa disponível em:

- Swagger: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc

---

## Endpoints

### Autenticação

| Método | Rota             | Descrição                    |
| ------ | ---------------- | ---------------------------- |
| POST   | `/auth/register` | Cria nova conta              |
| POST   | `/auth/login`    | Login — seta cookie httpOnly |
| POST   | `/auth/logout`   | Logout — apaga cookie        |
| GET    | `/auth/me`       | Retorna usuário autenticado  |
| PUT    | `/auth/me`       | Atualiza perfil e senha      |

### Contas

| Método | Rota             | Descrição                                     |
| ------ | ---------------- | --------------------------------------------- |
| GET    | `/accounts/`     | Lista contas com saldo calculado              |
| POST   | `/accounts/`     | Cria conta (débito ou crédito)                |
| PUT    | `/accounts/{id}` | Atualiza conta                                |
| DELETE | `/accounts/{id}` | Remove conta (`force`, `delete_transactions`) |

### Transações

| Método | Rota                        | Descrição                                           |
| ------ | --------------------------- | --------------------------------------------------- |
| GET    | `/transactions/`            | Lista com filtros (conta, categoria, tipo, período) |
| POST   | `/transactions/`            | Cria transação (simples ou parcelada)               |
| PUT    | `/transactions/{id}`        | Atualiza transação                                  |
| DELETE | `/transactions/{id}`        | Remove transação ou grupo                           |
| DELETE | `/transactions/{id}/single` | Remove só esta parcela                              |
| POST   | `/transactions/transfer`    | Cria transferência entre contas                     |

### Sugestões de Categoria (Hints)

| Método | Rota                      | Descrição                                       |
| ------ | ------------------------- | ----------------------------------------------- |
| GET    | `/hints/?description=...` | Retorna a categoria sugerida para uma descrição |
| POST   | `/hints/`                 | Salva/atualiza o par descrição → categoria      |

### Categorias

| Método | Rota               | Descrição                                |
| ------ | ------------------ | ---------------------------------------- |
| GET    | `/categories/`     | Lista categorias do sistema + do usuário |
| POST   | `/categories/`     | Cria categoria personalizada             |
| PUT    | `/categories/{id}` | Atualiza categoria do usuário            |
| DELETE | `/categories/{id}` | Remove categoria do usuário              |

### Analytics

| Método | Rota                            | Descrição                            |
| ------ | ------------------------------- | ------------------------------------ |
| GET    | `/analytics/summary`            | Resumo geral (regime de caixa)       |
| GET    | `/analytics/monthly`            | Receitas/despesas por mês            |
| GET    | `/analytics/by-category`        | Totais por categoria                 |
| GET    | `/analytics/trends`             | Comparativo mês atual vs anterior    |
| GET    | `/analytics/recurring-average`  | Média mensal de despesas recorrentes |
| GET    | `/analytics/compare-months`     | Compara dois meses específicos       |
| GET    | `/analytics/future-commitments` | Parcelas pendentes agrupadas         |

---

## Autenticação

JWT armazenado em cookie `httpOnly`. Em produção: `secure=True`, `samesite="none"` (necessário para frontend e backend em domínios distintos com proxy Vercel).

O hash de senhas usa **bcrypt** diretamente (sem passlib).

---

## Banco de Dados

PostgreSQL com SQLAlchemy 2.0 (ORM declarativo) e Alembic para migrações.

Principais tabelas: `users`, `accounts`, `transactions`, `categories`.

Saldo de conta calculado dinamicamente em `services/balance.py` considerando apenas transações com `is_paid=True`.

---

## Testes

```bash
pytest
```

68 testes organizados em 4 módulos:

| Arquivo                | Cobertura                                                                                                       |
| ---------------------- | --------------------------------------------------------------------------------------------------------------- |
| `test_auth.py`         | Registro, login, cookie httpOnly, perfil, troca de senha                                                        |
| `test_accounts.py`     | CRUD de contas, isolamento entre usuários, cálculo de saldo (`is_paid`), exclusão com/sem transações vinculadas |
| `test_transactions.py` | CRUD, parcelamento (cálculo de valores e datas), regras de conta de crédito, transferências, filtros            |
| `test_analytics.py`    | Resumo, evolução mensal, por categoria, compromissos futuros, comparação de meses, despesas recorrentes         |

Os testes rodam contra um banco PostgreSQL dedicado (`valore_test`), criado e limpo automaticamente a cada execução via fixtures no `conftest.py`, garantindo isolamento entre casos de teste.

**Resultado atual: 68/68 (100%) de aprovação.**
Only, perfil, troca de senha |
| `test_accounts.py` | CRUD de contas, isolamento entre usuários, cálculo de saldo (`is_paid`), exclusão com/sem transações vinculadas |
| `test_transactions.py` | CRUD, parcelamento (cálculo de valores e datas), regras de conta de crédito, transferências, filtros |
| `test_analytics.py` | Resumo, evolução mensal, por categoria, compromissos futuros, comparação de meses, despesas recorrentes |

Os testes rodam contra um banco PostgreSQL dedicado (`valore_test`), criado e limpo automaticamente a cada execução via fixtures no `conftest.py`, garantindo isolamento entre casos de teste.

**Resultado atual: 68/68 (100%) de aprovação.**
