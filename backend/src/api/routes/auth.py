import os

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from uuid import uuid4

from src.core.config import settings
from src.core.database import get_db
from src.core.dependencies import get_current_user
from src.core.security import hash_password, verify_password, create_access_token
from src.models.user import User
from src.schemas.user import RegisterInput, LoginInput, UserResponse, UpdateUserInput

router = APIRouter(prefix="/auth", tags=["auth"])


def _set_auth_cookie(response: Response, token: str) -> None:
    is_production = os.getenv("ENVIRONMENT") == "production"
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=is_production,        # True em produção (HTTPS)
        samesite="none" if is_production else "lax",
        max_age=settings.access_token_expire_minutes * 60,
    )


@router.post("/register", response_model=UserResponse, status_code=201)
def register(input: RegisterInput, response: Response, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == input.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="E-mail já cadastrado",
        )

    user = User(
        id=str(uuid4()),
        email=input.email,
        hashed_password=hash_password(input.password),
        name=input.name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": user.id})
    _set_auth_cookie(response, token)

    return user


@router.post("/login", response_model=UserResponse)
def login(input: LoginInput, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == input.email).first()

    if not user or not verify_password(input.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos",
        )

    token = create_access_token(data={"sub": user.id})
    _set_auth_cookie(response, token)

    return user


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"message": "Logout realizado com sucesso"}


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserResponse)
def update_me(
    input: UpdateUserInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if input.name:
        current_user.name = input.name

    if input.email:
        existing = db.query(User).filter(
            User.email == input.email,
            User.id != current_user.id,
        ).first()
        if existing:
            raise HTTPException(status_code=409, detail="E-mail já cadastrado")
        current_user.email = input.email

    if input.new_password:
        if not input.current_password:
            raise HTTPException(
                status_code=400, detail="Senha atual obrigatória")
        if not verify_password(input.current_password, current_user.hashed_password):
            raise HTTPException(
                status_code=400, detail="Senha atual incorreta")
        current_user.hashed_password = hash_password(input.new_password)

    if input.avatar_url is not None:
        current_user.avatar_url = input.avatar_url

    db.commit()
    db.refresh(current_user)
    return current_user
