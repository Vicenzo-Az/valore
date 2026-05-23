from sqlalchemy import Boolean, Column, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, relationship

from src.core.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[str] = Column(String, primary_key=True)
    description: Mapped[str] = Column(String, nullable=False)
    amount: Mapped[float] = Column(Float, nullable=False)
    # "income" | "expense" | "transfer"
    type: Mapped[str] = Column(String, nullable=False)
    date: Mapped[str] = Column(String, nullable=False)
    user_id: Mapped[str] = Column(
        String, ForeignKey("users.id"), nullable=False)
    category_id: Mapped[str | None] = Column(
        String, ForeignKey("categories.id"), nullable=True)
    account_id: Mapped[str | None] = Column(
        String, ForeignKey("accounts.id"), nullable=True)
    transfer_id: Mapped[str | None] = Column(String, nullable=True)
    transfer_direction: Mapped[str | None] = Column(
        String, nullable=True)  # "out" | "in"
    is_recurring: Mapped[bool] = Column(Boolean, nullable=False, default=False)

    user = relationship("User", back_populates="transactions")
    category = relationship("Category", back_populates="transactions")
    account = relationship("Account", back_populates="transactions")
