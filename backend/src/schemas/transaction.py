from pydantic import BaseModel
from typing import Literal


TransactionType = Literal["income", "expense"]


class TransactionBase(BaseModel):
    description: str
    amount: float
    type: TransactionType
    date: str  # ISO 8601: "2025-01-02"
    category_id: str | None = None
    account_id: str | None = None


class CreateTransactionInput(TransactionBase):
    pass


class UpdateTransactionInput(BaseModel):
    description: str | None = None
    amount: float | None = None
    type: TransactionType | None = None
    date: str | None = None
    category_id: str | None = None
    account_id: str | None = None


class Transaction(TransactionBase):
    id: str
    user_id: str

    model_config = {"from_attributes": True}
