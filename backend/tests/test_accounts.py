import pytest
from fastapi.testclient import TestClient


ACCOUNT_PAYLOAD = {
    "name": "Conta Corrente",
    "icon": "wallet",
    "color": "#10b981",
    "initial_balance": 1000.0,
    "is_credit": False,
}

CREDIT_ACCOUNT_PAYLOAD = {
    "name": "Cartão de Crédito",
    "icon": "credit-card",
    "color": "#3b82f6",
    "initial_balance": 0.0,
    "is_credit": True,
}


def create_account(client, payload=None):
    return client.post("/accounts/", json=payload or ACCOUNT_PAYLOAD)


class TestCreateAccount:
    def test_create_debit_account(self, auth_client: TestClient):
        response = create_account(auth_client)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == ACCOUNT_PAYLOAD["name"]
        assert data["initial_balance"] == ACCOUNT_PAYLOAD["initial_balance"]
        assert data["is_credit"] is False
        assert data["current_balance"] == ACCOUNT_PAYLOAD["initial_balance"]

    def test_create_credit_account(self, auth_client: TestClient):
        response = create_account(auth_client, CREDIT_ACCOUNT_PAYLOAD)
        assert response.status_code == 201
        data = response.json()
        assert data["is_credit"] is True

    def test_create_requires_auth(self, client: TestClient):
        client.cookies.clear()
        response = create_account(client)
        assert response.status_code == 401


class TestListAccounts:
    def test_list_accounts(self, auth_client: TestClient):
        create_account(auth_client)
        create_account(auth_client, {**ACCOUNT_PAYLOAD, "name": "Poupança"})
        response = auth_client.get("/accounts/")
        assert response.status_code == 200
        assert len(response.json()) == 2

    def test_list_accounts_isolated(self, auth_client: TestClient, auth_client2: TestClient):
        """Cada usuário só vê suas próprias contas."""
        create_account(auth_client)
        response = auth_client2.get("/accounts/")
        assert response.status_code == 200
        assert len(response.json()) == 0


class TestAccountBalance:
    def test_initial_balance_reflects_in_current(self, auth_client: TestClient):
        response = create_account(
            auth_client, {**ACCOUNT_PAYLOAD, "initial_balance": 5000.0})
        assert response.json()["current_balance"] == 5000.0

    def test_balance_updates_after_expense(self, auth_client: TestClient):
        account = create_account(auth_client).json()
        auth_client.post("/transactions/", json={
            "description": "Supermercado",
            "amount": 200.0,
            "type": "expense",
            "date": "2026-01-10",
            "account_id": account["id"],
            "is_paid": True,
        })
        response = auth_client.get("/accounts/")
        account_updated = next(a for a in response.json()
                               if a["id"] == account["id"])
        assert account_updated["current_balance"] == 800.0

    def test_balance_ignores_unpaid_transactions(self, auth_client: TestClient):
        """Transações não pagas não devem afetar o saldo."""
        account = create_account(auth_client).json()
        auth_client.post("/transactions/", json={
            "description": "Parcela futura",
            "amount": 300.0,
            "type": "expense",
            "date": "2026-06-10",
            "account_id": account["id"],
            "is_paid": False,
        })
        response = auth_client.get("/accounts/")
        account_updated = next(a for a in response.json()
                               if a["id"] == account["id"])
        assert account_updated["current_balance"] == 1000.0


class TestUpdateAccount:
    def test_update_account(self, auth_client: TestClient):
        account = create_account(auth_client).json()
        response = auth_client.put(
            f"/accounts/{account['id']}", json={"name": "Nova Conta"})
        assert response.status_code == 200
        assert response.json()["name"] == "Nova Conta"

    def test_cannot_update_other_user_account(self, auth_client: TestClient, auth_client2: TestClient):
        account = create_account(auth_client).json()
        response = auth_client2.put(
            f"/accounts/{account['id']}", json={"name": "Invasão"})
        assert response.status_code == 404


class TestDeleteAccount:
    def test_delete_account_no_transactions(self, auth_client: TestClient):
        account = create_account(auth_client).json()
        response = auth_client.delete(f"/accounts/{account['id']}")
        assert response.status_code == 204

    def test_delete_account_with_transactions_blocked(self, auth_client: TestClient):
        account = create_account(auth_client).json()
        auth_client.post("/transactions/", json={
            "description": "Teste",
            "amount": 100.0,
            "type": "expense",
            "date": "2026-01-10",
            "account_id": account["id"],
            "is_paid": True,
        })
        response = auth_client.delete(f"/accounts/{account['id']}")
        assert response.status_code == 409

    def test_delete_account_force(self, auth_client: TestClient):
        account = create_account(auth_client).json()
        auth_client.post("/transactions/", json={
            "description": "Teste",
            "amount": 100.0,
            "type": "expense",
            "date": "2026-01-10",
            "account_id": account["id"],
            "is_paid": True,
        })
        response = auth_client.delete(f"/accounts/{account['id']}?force=true")
        assert response.status_code == 204

    def test_delete_account_with_transactions_deleted(self, auth_client: TestClient):
        account = create_account(auth_client).json()
        auth_client.post("/transactions/", json={
            "description": "Teste",
            "amount": 100.0,
            "type": "expense",
            "date": "2026-01-10",
            "account_id": account["id"],
            "is_paid": True,
        })
        auth_client.delete(
            f"/accounts/{account['id']}?delete_transactions=true")
        response = auth_client.get("/transactions/")
        assert len(response.json()) == 0
