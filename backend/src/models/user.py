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

    transactions = relationship("Transaction", back_populates="user")
    accounts = relationship("Account", back_populates="user")
    categories = relationship("Category", back_populates="user")
