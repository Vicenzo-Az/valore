from pydantic import BaseModel


class AccountBase(BaseModel):
    name: str
    icon: str = "wallet"
    color: str = "#10b981"
    initial_balance: float = 0.0


class CreateAccountInput(AccountBase):
    pass


class UpdateAccountInput(BaseModel):
    name: str | None = None
    icon: str | None = None
    color: str | None = None
    initial_balance: float | None = None


class Account(AccountBase):
    id: str
    user_id: str

    model_config = {"from_attributes": True}


class AccountWithBalance(Account):
    """Account com saldo calculado a partir das transações."""
    current_balance: float
