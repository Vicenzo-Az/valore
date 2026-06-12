import pytest
from fastapi.testclient import TestClient


def create_account(client, is_credit=False):
    return client.post("/accounts/", json={
        "name": "Conta Teste",
        "icon": "wallet",
        "color": "#10b981",
        "initial_balance": 1000.0,
        "is_credit": is_credit,
    }).json()


def create_transaction(client, account_id=None, **kwargs):
    payload = {
        "description": "Supermercado",
        "amount": 200.0,
        "type": "expense",
        "date": "2026-01-10",
        "is_paid": True,
        "is_recurring": False,
        "installments": 1,
    }
    if account_id:
        payload["account_id"] = account_id
    payload.update(kwargs)
    return client.post("/transactions/", json=payload)


class TestCreateTransaction:
    def test_create_simple_transaction(self, auth_client: TestClient):
        response = create_transaction(auth_client)
        assert response.status_code == 201
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 1
        assert data[0]["description"] == "Supermercado"
        assert data[0]["amount"] == 200.0

    def test_create_income_transaction(self, auth_client: TestClient):
        response = create_transaction(
            auth_client, type="income", amount=5000.0, description="Salário")
        assert response.status_code == 201
        assert response.json()[0]["type"] == "income"

    def test_create_requires_auth(self, client: TestClient):
        client.cookies.clear()
        response = create_transaction(client)
        assert response.status_code == 401


class TestInstallments:
    def test_create_installment_on_credit_account(self, auth_client: TestClient):
        account = create_account(auth_client, is_credit=True)
        response = create_transaction(
            auth_client,
            account_id=account["id"],
            amount=1200.0,
            description="iPhone",
            installments=12,
        )
        assert response.status_code == 201
        data = response.json()
        assert len(data) == 12
        assert all(t["installment_group_id"] == data[0]
                   ["installment_group_id"] for t in data)
        assert data[0]["installment_number"] == 1
        assert data[11]["installment_number"] == 12
        assert data[0]["amount"] == 100.0

    def test_installment_dates_increment_monthly(self, auth_client: TestClient):
        account = create_account(auth_client, is_credit=True)
        response = create_transaction(
            auth_client,
            account_id=account["id"],
            amount=300.0,
            date="2026-01-15",
            installments=3,
        )
        data = response.json()
        assert data[0]["date"] == "2026-01-15"
        assert data[1]["date"] == "2026-02-15"
        assert data[2]["date"] == "2026-03-15"

    def test_only_first_installment_is_paid(self, auth_client: TestClient):
        account = create_account(auth_client, is_credit=True)
        response = create_transaction(
            auth_client,
            account_id=account["id"],
            amount=300.0,
            installments=3,
        )
        data = response.json()
        assert data[0]["is_paid"] is True
        assert data[1]["is_paid"] is False
        assert data[2]["is_paid"] is False

    def test_installment_requires_credit_account(self, auth_client: TestClient):
        account = create_account(auth_client, is_credit=False)
        response = create_transaction(
            auth_client,
            account_id=account["id"],
            amount=300.0,
            installments=3,
        )
        assert response.status_code == 400

    def test_income_cannot_be_installment(self, auth_client: TestClient):
        account = create_account(auth_client, is_credit=True)
        response = create_transaction(
            auth_client,
            account_id=account["id"],
            type="income",
            amount=300.0,
            installments=3,
        )
        assert response.status_code == 400


class TestTransfer:
    def test_create_transfer(self, auth_client: TestClient):
        account_a = create_account(auth_client)
        account_b = create_account(auth_client)
        response = auth_client.post("/transactions/transfer", json={
            "from_account_id": account_a["id"],
            "to_account_id": account_b["id"],
            "amount": 300.0,
            "date": "2026-01-10",
            "description": "Transferência teste",
        })
        assert response.status_code == 201
        data = response.json()
        assert len(data) == 2
        assert data[0]["transfer_id"] == data[1]["transfer_id"]
        directions = {t["transfer_direction"] for t in data}
        assert directions == {"in", "out"}

    def test_transfer_updates_balances(self, auth_client: TestClient):
        account_a = create_account(auth_client)
        account_b = create_account(auth_client)
        auth_client.post("/transactions/transfer", json={
            "from_account_id": account_a["id"],
            "to_account_id": account_b["id"],
            "amount": 300.0,
            "date": "2026-01-10",
        })
        accounts = auth_client.get("/accounts/").json()
        a = next(acc for acc in accounts if acc["id"] == account_a["id"])
        b = next(acc for acc in accounts if acc["id"] == account_b["id"])
        assert a["current_balance"] == 700.0
        assert b["current_balance"] == 1300.0

    def test_transfer_same_account_rejected(self, auth_client: TestClient):
        account = create_account(auth_client)
        response = auth_client.post("/transactions/transfer", json={
            "from_account_id": account["id"],
            "to_account_id": account["id"],
            "amount": 100.0,
            "date": "2026-01-10",
        })
        assert response.status_code == 400


class TestUpdateTransaction:
    def test_update_transaction(self, auth_client: TestClient):
        t = create_transaction(auth_client).json()[0]
        response = auth_client.put(f"/transactions/{t['id']}", json={
            "description": "Farmácia",
            "amount": 50.0,
        })
        assert response.status_code == 200
        assert response.json()["description"] == "Farmácia"
        assert response.json()["amount"] == 50.0

    def test_cannot_update_other_user_transaction(self, auth_client: TestClient, auth_client2: TestClient):
        t = create_transaction(auth_client).json()[0]
        response = auth_client2.put(
            f"/transactions/{t['id']}", json={"description": "Invasão"})
        assert response.status_code == 404


class TestDeleteTransaction:
    def test_delete_single_transaction(self, auth_client: TestClient):
        t = create_transaction(auth_client).json()[0]
        response = auth_client.delete(f"/transactions/{t['id']}/single")
        assert response.status_code == 204
        assert len(auth_client.get("/transactions/").json()) == 0

    def test_delete_installment_group(self, auth_client: TestClient):
        account = create_account(auth_client, is_credit=True)
        data = create_transaction(
            auth_client,
            account_id=account["id"],
            amount=300.0,
            installments=3,
        ).json()
        auth_client.delete(f"/transactions/{data[0]['id']}")
        assert len(auth_client.get("/transactions/").json()) == 0

    def test_delete_transfer_removes_both_sides(self, auth_client: TestClient):
        account_a = create_account(auth_client)
        account_b = create_account(auth_client)
        data = auth_client.post("/transactions/transfer", json={
            "from_account_id": account_a["id"],
            "to_account_id": account_b["id"],
            "amount": 100.0,
            "date": "2026-01-10",
        }).json()
        auth_client.delete(f"/transactions/{data[0]['id']}")
        assert len(auth_client.get("/transactions/").json()) == 0


class TestFilterTransactions:
    def test_filter_by_type(self, auth_client: TestClient):
        create_transaction(auth_client, type="income", amount=1000.0)
        create_transaction(auth_client, type="expense", amount=200.0)
        response = auth_client.get("/transactions/?type=income")
        data = response.json()
        assert all(t["type"] == "income" for t in data)

    def test_filter_by_date_range(self, auth_client: TestClient):
        create_transaction(auth_client, date="2026-01-10")
        create_transaction(auth_client, date="2026-03-15")
        response = auth_client.get(
            "/transactions/?date_from=2026-02-01&date_to=2026-12-31")
        data = response.json()
        assert len(data) == 1
        assert data[0]["date"] == "2026-03-15"

    def test_transactions_isolated_between_users(self, auth_client: TestClient, auth_client2: TestClient):
        create_transaction(auth_client)
        response = auth_client2.get("/transactions/")
        assert len(response.json()) == 0
