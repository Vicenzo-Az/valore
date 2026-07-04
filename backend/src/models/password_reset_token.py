from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, relationship
from src.core.database import Base


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id: Mapped[str] = Column(String, primary_key=True)
    user_id: Mapped[str] = Column(
        String, ForeignKey("users.id"), nullable=False)
    token_hash: Mapped[str] = Column(String, nullable=False, unique=True)
    expires_at: Mapped[datetime] = Column(DateTime, nullable=False)
    created_at: Mapped[datetime] = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
