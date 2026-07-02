import pytest
from fastapi.testclient import TestClient


REGISTER_PAYLOAD = {
    "name": "Vicenzo",
    "email": "vicenzo@valore.com",
    "password": "senha123456",
}


class TestRegister:
    def test_register_success(self, client: TestClient):
        response = client.post("/auth/register", json=REGISTER_PAYLOAD)
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == REGISTER_PAYLOAD["email"]
        assert data["name"] == REGISTER_PAYLOAD["name"]
        assert "id" in data
        assert "hashed_password" not in data

    def test_register_sets_cookie(self, client: TestClient):
        response = client.post("/auth/register", json=REGISTER_PAYLOAD)
        assert response.status_code == 201
        assert "access_token" in client.cookies

    def test_register_duplicate_email(self, client: TestClient):
        client.post("/auth/register", json=REGISTER_PAYLOAD)
        response = client.post("/auth/register", json=REGISTER_PAYLOAD)
        assert response.status_code == 409

    def test_register_invalid_email(self, client: TestClient):
        payload = {**REGISTER_PAYLOAD, "email": "nao-é-um-email"}
        response = client.post("/auth/register", json=payload)
        assert response.status_code == 422


class TestLogin:
    def test_login_success(self, client: TestClient):
        client.post("/auth/register", json=REGISTER_PAYLOAD)
        response = client.post("/auth/login", json={
            "email": REGISTER_PAYLOAD["email"],
            "password": REGISTER_PAYLOAD["password"],
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == REGISTER_PAYLOAD["email"]

    def test_login_wrong_password(self, client: TestClient):
        client.post("/auth/register", json=REGISTER_PAYLOAD)
        response = client.post("/auth/login", json={
            "email": REGISTER_PAYLOAD["email"],
            "password": "senhaerrada",
        })
        assert response.status_code == 401

    def test_login_nonexistent_email(self, client: TestClient):
        response = client.post("/auth/login", json={
            "email": "naoexiste@valore.com",
            "password": "senha123456",
        })
        assert response.status_code == 401

    def test_login_sets_cookie(self, client: TestClient):
        client.post("/auth/register", json=REGISTER_PAYLOAD)
        client.post("/auth/login", json={
            "email": REGISTER_PAYLOAD["email"],
            "password": REGISTER_PAYLOAD["password"],
        })
        assert "access_token" in client.cookies


class TestMe:
    def test_me_authenticated(self, auth_client: TestClient):
        response = auth_client.get("/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert "email" in data
        assert "id" in data

    def test_me_unauthenticated(self, client: TestClient):
        client.cookies.clear()
        response = client.get("/auth/me")
        assert response.status_code == 401


class TestLogout:
    def test_logout_success(self, auth_client: TestClient):
        response = auth_client.post("/auth/logout")
        assert response.status_code == 200

    def test_me_after_logout(self, auth_client: TestClient):
        auth_client.post("/auth/logout")
        auth_client.cookies.clear()
        response = auth_client.get("/auth/me")
        assert response.status_code == 401


class TestUpdateProfile:
    def test_update_name(self, auth_client: TestClient):
        response = auth_client.put("/auth/me", json={"name": "Novo Nome"})
        assert response.status_code == 200
        assert response.json()["name"] == "Novo Nome"

    def test_update_password_success(self, auth_client: TestClient):
        response = auth_client.put("/auth/me", json={
            "current_password": "senha123456",
            "new_password": "novasenha123",
        })
        assert response.status_code == 200

    def test_update_password_wrong_current(self, auth_client: TestClient):
        response = auth_client.put("/auth/me", json={
            "current_password": "senhaerrada",
            "new_password": "novasenha123",
        })
        assert response.status_code == 400


class TestDeleteAccount:
    def test_delete_account_success(self, auth_client: TestClient):
        response = auth_client.delete("/auth/me")
        assert response.status_code == 204

    def test_delete_account_unauthenticated(self, client: TestClient):
        response = client.delete("/auth/me")
        assert response.status_code == 401

    def test_me_after_delete(self, auth_client: TestClient):
        auth_client.delete("/auth/me")
        auth_client.cookies.clear()
        response = auth_client.get("/auth/me")
        assert response.status_code == 401
