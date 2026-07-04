import hashlib
import secrets
from datetime import datetime, timedelta
from uuid import uuid4

import resend
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from src.core.config import settings
from src.core.database import get_db
from src.models.password_reset_token import PasswordResetToken
from src.models.user import User
from src.core.security import get_password_hash

router = APIRouter(prefix="/auth", tags=["password-reset"])

resend.api_key = settings.resend_api_key

GENERIC_RESPONSE = {
    "message": "Se o e-mail estiver cadastrado, você receberá um link de recuperação em breve."
}


class ForgotPasswordInput(BaseModel):
    email: EmailStr


class ResetPasswordInput(BaseModel):
    token: str
    new_password: str


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


@router.post("/forgot-password")
def forgot_password(
    input: ForgotPasswordInput,
    db: Session = Depends(get_db),
):
    # Sempre responde igual — evita user enumeration
    user = db.query(User).filter(User.email == input.email).first()
    if not user:
        return GENERIC_RESPONSE

    # Invalida tokens anteriores do mesmo usuário
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.id
    ).delete()

    # Gera token criptograficamente seguro
    raw_token = secrets.token_urlsafe(32)
    token_hash = _hash_token(raw_token)
    expires_at = datetime.utcnow() + timedelta(hours=1)

    db.add(PasswordResetToken(
        id=str(uuid4()),
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at,
    ))
    db.commit()

    reset_link = f"{settings.frontend_url}/reset-password?token={raw_token}"

    # Envia e-mail via Resend
    try:
        resend.Emails.send({
            "from": "Valore <onboarding@resend.dev>",
            "to": [user.email],
            "subject": "Recuperação de senha — Valore",
            "html": f"""
            <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
              <h2 style="color: #2D6A4F; margin-bottom: 8px;">Recuperação de senha</h2>
              <p style="color: #4A5750; margin-bottom: 24px;">
                Recebemos uma solicitação para redefinir a senha da conta associada a este e-mail.
                Clique no botão abaixo para criar uma nova senha.
              </p>
              <a href="{reset_link}"
                style="display: inline-block; background: #4C8A6A; color: white;
                       padding: 12px 24px; border-radius: 10px; text-decoration: none;
                       font-weight: 600; margin-bottom: 24px;">
                Redefinir senha
              </a>
              <p style="color: #8A928B; font-size: 13px;">
                Este link expira em <strong>1 hora</strong>.<br/>
                Se você não solicitou a recuperação, ignore este e-mail — sua senha permanece a mesma.
              </p>
              <hr style="border: none; border-top: 1px solid #E5E8E1; margin: 24px 0;" />
              <p style="color: #8A928B; font-size: 12px;">Valore · CSTSI / IFSul</p>
            </div>
            """,
        })
    except Exception:
        # Não expõe erro de envio ao usuário
        pass

    return GENERIC_RESPONSE


@router.post("/reset-password")
def reset_password(
    input: ResetPasswordInput,
    db: Session = Depends(get_db),
):
    if len(input.new_password) < 8:
        raise HTTPException(
            status_code=400, detail="A senha deve ter pelo menos 8 caracteres.")

    token_hash = _hash_token(input.token)

    token_record = db.query(PasswordResetToken).filter(
        PasswordResetToken.token_hash == token_hash,
    ).first()

    # Token inválido ou expirado — mesma mensagem para ambos os casos
    if not token_record or token_record.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=400,
            detail="Link inválido ou expirado. Solicite um novo link de recuperação."
        )

    # Atualiza a senha
    user = db.query(User).filter(User.id == token_record.user_id).first()
    user.hashed_password = get_password_hash(input.new_password)

    # Deleta o token — uso único
    db.delete(token_record)
    db.commit()

    return {"message": "Senha redefinida com sucesso."}
