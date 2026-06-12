import pytest
from fastapi.testclient import TestClient


def create_account(client, initial_balance=1000.0, is_credit=False):
    return client.post("/accounts/", json={
        "name": "Conta Teste",
        "icon": "wallet",
        "color": "#10b981",
        "initial_balance": initial_balance,
        "is_credit": is_credit,
    }).json()


def create_transaction(client, **kwargs):
    payload = {
        "description": "Transação",
        "amount": 100.0,
        "type": "expense",
        "date": "2026-01-10",
        "is_paid": True,
        "is_recurring": False,
        "installments": 1,
    }
    payload.update(kwargs)
    return client.post("/transactions/", json=payload).json()


class TestSummary:
    def test_summary_empty(self, auth_client: TestClient):
        response = auth_client.get("/analytics/summary")
        assert response.status_code == 200
        data = response.json()
        assert data["income"] == 0.0
        assert data["expense"] == 0.0
        assert data["balance"] == 0.0
        assert data["transaction_count"] == 0

    def test_summary_with_transactions(self, auth_client: TestClient):
        create_transaction(auth_client, type="income", amount=5000.0)
        create_transaction(auth_client, type="expense", amount=1500.0)
        response = auth_client.get("/analytics/summary")
        data = response.json()
        assert data["income"] == 5000.0
        assert data["expense"] == 1500.0
        assert data["balance"] == 3500.0
        assert data["transaction_count"] == 2

    def test_summary_ignores_unpaid(self, auth_client: TestClient):
        """Transações não pagas não entram no summary."""
        create_transaction(auth_client, type="expense",
                           amount=500.0, is_paid=True)
        create_transaction(auth_client, type="expense",
                           amount=300.0, is_paid=False)
        response = auth_client.get("/analytics/summary")
        data = response.json()
        assert data["expense"] == 500.0
        assert data["transaction_count"] == 1

    def test_summary_ignores_transfers(self, auth_client: TestClient):
        """Transferências não entram no income/expense do summary."""
        account_a = create_account(auth_client)
        account_b = create_account(auth_client)
        auth_client.post("/transactions/transfer", json={
            "from_account_id": account_a["id"],
            "to_account_id": account_b["id"],
            "amount": 500.0,
            "date": "2026-01-10",
        })
        response = auth_client.get("/analytics/summary")
        data = response.json()
        assert data["income"] == 0.0
        assert data["expense"] == 0.0
        assert data["transaction_count"] == 0

    def test_net_worth_reflects_account_balances(self, auth_client: TestClient):
        """net_worth = soma dos saldos atuais das contas."""
        create_account(auth_client, initial_balance=3000.0)
        create_account(auth_client, initial_balance=2000.0)
        response = auth_client.get("/analytics/summary")
        assert response.json()["net_worth"] == 5000.0

    def test_net_worth_only_paid_transactions(self, auth_client: TestClient):
        """net_worth considera apenas transações pagas no saldo das contas."""
        account = create_account(auth_client, initial_balance=1000.0)
        create_transaction(
            auth_client, account_id=account["id"], amount=200.0, is_paid=True)
        create_transaction(
            auth_client, account_id=account["id"], amount=300.0, is_paid=False)
        response = auth_client.get("/analytics/summary")
        assert response.json()["net_worth"] == 800.0


class TestMonthly:
    def test_monthly_empty(self, auth_client: TestClient):
        response = auth_client.get("/analytics/monthly")
        assert response.status_code == 200
        assert response.json() == []

    def test_monthly_groups_by_month(self, auth_client: TestClient):
        create_transaction(auth_client, type="income",
                           amount=5000.0, date="2026-01-05")
        create_transaction(auth_client, type="expense",
                           amount=1000.0, date="2026-01-15")
        create_transaction(auth_client, type="income",
                           amount=5000.0, date="2026-02-05")
        response = auth_client.get("/analytics/monthly")
        data = response.json()
        assert len(data) == 2
        jan = next(m for m in data if m["month"] == "2026-01")
        assert jan["income"] == 5000.0
        assert jan["expense"] == 1000.0
        assert jan["balance"] == 4000.0

    def test_monthly_ignores_unpaid(self, auth_client: TestClient):
        create_transaction(auth_client, amount=500.0,
                           date="2026-01-10", is_paid=True)
        create_transaction(auth_client, amount=300.0,
                           date="2026-01-20", is_paid=False)
        response = auth_client.get("/analytics/monthly")
        data = response.json()
        assert data[0]["expense"] == 500.0

    def test_monthly_filter_by_year(self, auth_client: TestClient):
        create_transaction(auth_client, date="2025-06-10")
        create_transaction(auth_client, date="2026-01-10")
        response = auth_client.get("/analytics/monthly?year=2026")
        data = response.json()
        assert len(data) == 1
        assert data[0]["month"] == "2026-01"


class TestByCategory:
    def test_by_category_empty(self, auth_client: TestClient):
        response = auth_client.get("/analytics/by-category")
        assert response.status_code == 200
        assert response.json() == []

    def test_by_category_groups_correctly(self, auth_client: TestClient):
        categories = auth_client.get("/categories/").json()
        alimentacao = next(
            (c for c in categories if c["name"] == "Alimentação"), None)
        if not alimentacao:
            return

        create_transaction(
            auth_client, category_id=alimentacao["id"], amount=200.0)
        create_transaction(
            auth_client, category_id=alimentacao["id"], amount=300.0)
        response = auth_client.get("/analytics/by-category?type=expense")
        data = response.json()
        cat = next(
            (c for c in data if c["category_id"] == alimentacao["id"]), None)
        assert cat is not None
        assert cat["total"] == 500.0

    def test_by_category_ignores_transfers(self, auth_client: TestClient):
        account_a = create_account(auth_client)
        account_b = create_account(auth_client)
        auth_client.post("/transactions/transfer", json={
            "from_account_id": account_a["id"],
            "to_account_id": account_b["id"],
            "amount": 500.0,
            "date": "2026-01-10",
        })
        response = auth_client.get("/analytics/by-category")
        assert response.json() == []


class TestFutureCommitments:
    def test_future_commitments_empty(self, auth_client: TestClient):
        response = auth_client.get("/analytics/future-commitments")
        assert response.status_code == 200
        data = response.json()
        assert data["total_pending"] == 0.0
        assert data["by_group"] == []

    def test_future_commitments_with_installments(self, auth_client: TestClient):
        account = create_account(auth_client, is_credit=True)
        auth_client.post("/transactions/", json={
            "description": "Notebook",
            "amount": 3000.0,
            "type": "expense",
            "date": "2026-01-10",
            "account_id": account["id"],
            "is_paid": True,
            "is_recurring": False,
            "installments": 6,
        })
        response = auth_client.get("/analytics/future-commitments")
        data = response.json()
        assert data["total_pending"] == 2500.0  # 5 parcelas restantes de 500
        assert len(data["by_group"]) == 1
        assert data["by_group"][0]["remaining_installments"] == 5
        assert data["by_group"][0]["installment_total"] == 6

    def test_future_commitments_isolated(self, auth_client: TestClient, auth_client2: TestClient):
        account = create_account(auth_client, is_credit=True)
        auth_client.post("/transactions/", json={
            "description": "TV",
            "amount": 2400.0,
            "type": "expense",
            "date": "2026-01-10",
            "account_id": account["id"],
            "is_paid": True,
            "is_recurring": False,
            "installments": 4,
        })
        response = auth_client2.get("/analytics/future-commitments")
        assert response.json()["total_pending"] == 0.0


class TestCompareMonths:
    def test_compare_months(self, auth_client: TestClient):
        create_transaction(auth_client, type="income",
                           amount=5000.0, date="2026-01-05")
        create_transaction(auth_client, type="expense",
                           amount=1000.0, date="2026-01-15")
        create_transaction(auth_client, type="income",
                           amount=4000.0, date="2026-02-05")
        create_transaction(auth_client, type="expense",
                           amount=2000.0, date="2026-02-15")

        response = auth_client.get(
            "/analytics/compare-months?month_a=2026-02&month_b=2026-01")
        assert response.status_code == 200
        data = response.json()
        assert data["month_a"]["income"] == 4000.0
        assert data["month_b"]["income"] == 5000.0
        assert data["variation"]["income"] == -20.0

    def test_compare_months_empty(self, auth_client: TestClient):
        response = auth_client.get(
            "/analytics/compare-months?month_a=2026-01&month_b=2026-02")
        assert response.status_code == 200
        data = response.json()
        assert data["month_a"]["income"] == 0.0
        assert data["month_b"]["income"] == 0.0


class TestRecurringAverage:
    def test_recurring_average_empty(self, auth_client: TestClient):
        response = auth_client.get("/analytics/recurring-average")
        assert response.status_code == 200
        data = response.json()
        assert data["average_monthly"] == 0.0
        assert data["by_category"] == []

    def test_recurring_average_calculation(self, auth_client: TestClient):
        create_transaction(auth_client, amount=100.0,
                           date="2026-01-10", is_recurring=True)
        create_transaction(auth_client, amount=100.0,
                           date="2026-02-10", is_recurring=True)
        response = auth_client.get("/analytics/recurring-average")
        data = response.json()
        assert data["total_recurring"] == 200.0
        assert data["n_months"] == 2
        assert data["average_monthly"] == 100.0
