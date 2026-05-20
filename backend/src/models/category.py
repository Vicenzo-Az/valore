from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.orm import Mapped, relationship

from src.core.database import Base


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[str] = Column(String, primary_key=True)
    name: Mapped[str] = Column(String, nullable=False)
    icon: Mapped[str] = Column(String, nullable=False, default="tag")
    color: Mapped[str] = Column(String, nullable=False, default="#10b981")
    # "income" | "expense" | "both"
    type: Mapped[str] = Column(String, nullable=False)
    user_id: Mapped[str | None] = Column(
        String, ForeignKey("users.id"), nullable=True
    )  # null = categoria do sistema, preenchido = categoria do usuário

    # Hierarquia futura — null por enquanto (flat)
    parent_id: Mapped[str | None] = Column(
        String, ForeignKey("categories.id"), nullable=True
    )

    user = relationship("User", back_populates="categories")
    transactions = relationship("Transaction", back_populates="category")
    subcategories = relationship("Category", back_populates="parent")
    parent = relationship(
        "Category", back_populates="subcategories", remote_side="Category.id")
