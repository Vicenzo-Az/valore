from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import uuid4

from src.core.database import get_db
from src.core.dependencies import get_current_user
from src.models.account import Account as AccountModel
from src.models.user import User
from src.models.transaction import Transaction as TransactionModel
from src.services.balance import get_account_balance
from src.schemas.account import (
    Account,
    AccountWithBalance,
    CreateAccountInput,
    UpdateAccountInput,
)

router = APIRouter(prefix="/accounts", tags=["accounts"])


@router.get("/", response_model=list[AccountWithBalance])
def list_accounts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    accounts = (
        db.query(AccountModel)
        .filter(AccountModel.user_id == current_user.id)
        .all()
    )
    return [
        AccountWithBalance(
            **Account.model_validate(a).model_dump(),
            current_balance=get_account_balance(a, db),
        )
        for a in accounts
    ]


@router.post("/", response_model=AccountWithBalance, status_code=201)
def create_account(
    input: CreateAccountInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    account = AccountModel(
        id=str(uuid4()),
        user_id=current_user.id,
        **input.model_dump(),
    )
    db.add(account)
    db.commit()
    db.refresh(account)
    return AccountWithBalance(
        **Account.model_validate(account).model_dump(),
        current_balance=account.initial_balance,
    )


@router.put("/{account_id}", response_model=AccountWithBalance)
def update_account(
    account_id: str,
    input: UpdateAccountInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    account = db.query(AccountModel).filter(
        AccountModel.id == account_id,
        AccountModel.user_id == current_user.id,
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="Conta não encontrada")

    for field, value in input.model_dump(exclude_none=True).items():
        setattr(account, field, value)

    db.commit()
    db.refresh(account)
    return AccountWithBalance(
        **Account.model_validate(account).model_dump(),
        current_balance=get_account_balance(account, db),
    )


@router.delete("/{account_id}", status_code=204)
def delete_account(
    account_id: str,
    force: bool = Query(default=False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    account = db.query(AccountModel).filter(
        AccountModel.id == account_id,
        AccountModel.user_id == current_user.id,
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="Conta não encontrada")

    # Verifica se há transações vinculadas
    transaction_count = db.query(TransactionModel).filter(
        TransactionModel.account_id == account_id
    ).count()

    if transaction_count > 0 and not force:
        raise HTTPException(
            status_code=409,
            detail=f"Esta conta possui {transaction_count} transação(ões) vinculada(s). Use force=true para deletar mesmo assim."
        )

    db.delete(account)
    db.commit()
