from sqlalchemy import Column, String
from sqlalchemy.orm import Mapped, relationship

from src.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = Column(String, primary_key=True)
    email: Mapped[str] = Column(
        String, unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = Column(String, nullable=False)
    name: Mapped[str] = Column(String, nullable=False)
    avatar_url: Mapped[str | None] = Column(String, nullable=True)

    transactions = relationship(
        "Transaction", back_populates="user", cascade="all, delete-orphan"
    )
    accounts = relationship(
        "Account", back_populates="user", cascade="all, delete-orphan"
    )
    categories = relationship(
        "Category", back_populates="user", cascade="all, delete-orphan"
    )
    description_hints = relationship(
        "DescriptionHint", back_populates="user", cascade="all, delete-orphan"
    )
    password_reset_tokens = relationship(
        "PasswordResetToken", back_populates="user", cascade="all, delete-orphan"
    )
