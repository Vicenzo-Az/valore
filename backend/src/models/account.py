from sqlalchemy import Column, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, relationship

from src.core.database import Base


class Account(Base):
    __tablename__ = "accounts"

    id: Mapped[str] = Column(String, primary_key=True)
    name: Mapped[str] = Column(String, nullable=False)
    icon: Mapped[str] = Column(String, nullable=False, default="wallet")
    color: Mapped[str] = Column(String, nullable=False, default="#10b981")
    initial_balance: Mapped[float] = Column(Float, nullable=False, default=0.0)
    user_id: Mapped[str] = Column(
        String, ForeignKey("users.id"), nullable=False)

    user = relationship("User", back_populates="accounts")
    transactions = relationship("Transaction", back_populates="account")
