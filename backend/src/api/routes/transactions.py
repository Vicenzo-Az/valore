from datetime import datetime
from dateutil.relativedelta import relativedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from uuid import uuid4

from src.core.database import get_db
from src.core.dependencies import get_current_user
from src.models.transaction import Transaction as TransactionModel
from src.models.account import Account as AccountModel
from src.models.user import User
from src.schemas.transaction import (
    Transaction,
    CreateTransactionInput,
    UpdateTransactionInput,
    TransferInput,
)

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("/", response_model=list[Transaction])
def list_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    account_id: Optional[str] = Query(default=None),
    category_id: Optional[str] = Query(default=None),
    type: Optional[str] = Query(default=None),
    date_from: Optional[str] = Query(default=None),
    date_to: Optional[str] = Query(default=None),
):
    query = db.query(TransactionModel).filter(
        TransactionModel.user_id == current_user.id
    )
    if account_id:
        query = query.filter(TransactionModel.account_id == account_id)
    if category_id:
        query = query.filter(TransactionModel.category_id == category_id)
    if type:
        query = query.filter(TransactionModel.type == type)
    if date_from:
        query = query.filter(TransactionModel.date >= date_from)
    if date_to:
        query = query.filter(TransactionModel.date <= date_to)
    return query.order_by(TransactionModel.date.desc()).all()


@router.get("/{transaction_id}", response_model=Transaction)
def get_transaction(
    transaction_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transaction = db.query(TransactionModel).filter(
        TransactionModel.id == transaction_id,
        TransactionModel.user_id == current_user.id,
    ).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    return transaction


@router.post("/", response_model=list[Transaction], status_code=201)
def create_transaction(
    input: CreateTransactionInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Busca a conta selecionada
    account = None
    if input.account_id:
        account = db.query(AccountModel).filter(
            AccountModel.id == input.account_id,
            AccountModel.user_id == current_user.id,
        ).first()

    # Parcelamento só em conta de crédito
    if input.installments > 1:
        if not account or not account.is_credit:
            raise HTTPException(
                status_code=400,
                detail="Parcelamento só é permitido em contas de crédito"
            )
        if input.type == "income":
            raise HTTPException(
                status_code=400,
                detail="Receitas não podem ser parceladas"
            )

    # Transação simples
    if input.installments <= 1:
        transaction = TransactionModel(
            id=str(uuid4()),
            user_id=current_user.id,
            description=input.description,
            amount=input.amount,
            type=input.type,
            date=input.date,
            category_id=input.category_id,
            account_id=input.account_id,
            is_recurring=input.is_recurring,
            is_paid=input.is_paid,
        )
        db.add(transaction)
        db.commit()
        db.refresh(transaction)
        return [transaction]

    # Transação parcelada
    installment_group_id = str(uuid4())
    base_date = datetime.strptime(input.date, "%Y-%m-%d")
    installment_amount = round(input.amount / input.installments, 2)
    transactions = []

    for i in range(input.installments):
        installment_date = base_date + relativedelta(months=i)
        t = TransactionModel(
            id=str(uuid4()),
            user_id=current_user.id,
            description=input.description,
            amount=installment_amount,
            type=input.type,
            date=installment_date.strftime("%Y-%m-%d"),
            category_id=input.category_id,
            account_id=input.account_id,
            is_recurring=False,
            is_paid=i == 0,
            installment_group_id=installment_group_id,
            installment_number=i + 1,
            installment_total=input.installments,
        )
        db.add(t)
        transactions.append(t)

    db.commit()
    for t in transactions:
        db.refresh(t)

    return transactions


@router.post("/transfer", response_model=list[Transaction], status_code=201)
def create_transfer(
    input: TransferInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from_account = db.query(AccountModel).filter(
        AccountModel.id == input.from_account_id,
        AccountModel.user_id == current_user.id,
    ).first()
    to_account = db.query(AccountModel).filter(
        AccountModel.id == input.to_account_id,
        AccountModel.user_id == current_user.id,
    ).first()

    if not from_account:
        raise HTTPException(
            status_code=404, detail="Conta de origem não encontrada")
    if not to_account:
        raise HTTPException(
            status_code=404, detail="Conta de destino não encontrada")
    if from_account.id == to_account.id:
        raise HTTPException(
            status_code=400, detail="Contas devem ser diferentes")

    transfer_id = str(uuid4())

    out = TransactionModel(
        id=str(uuid4()),
        user_id=current_user.id,
        description=input.description,
        amount=input.amount,
        type="transfer",
        date=input.date,
        account_id=input.from_account_id,
        transfer_id=transfer_id,
        transfer_direction="out",  # saída explícita
    )

    into = TransactionModel(
        id=str(uuid4()),
        user_id=current_user.id,
        description=input.description,
        amount=input.amount,
        type="transfer",
        date=input.date,
        account_id=input.to_account_id,
        transfer_id=transfer_id,
        transfer_direction="in",  # entrada explícita
    )

    db.add(out)
    db.add(into)
    db.commit()
    db.refresh(out)
    db.refresh(into)
    return [out, into]


@router.put("/{transaction_id}", response_model=Transaction)
def update_transaction(
    transaction_id: str,
    input: UpdateTransactionInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transaction = db.query(TransactionModel).filter(
        TransactionModel.id == transaction_id,
        TransactionModel.user_id == current_user.id,
    ).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transação não encontrada")

    for field, value in input.model_dump(exclude_none=True).items():
        setattr(transaction, field, value)

    db.commit()
    db.refresh(transaction)
    return transaction


@router.delete("/{transaction_id}", status_code=204)
def delete_transaction(
    transaction_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transaction = db.query(TransactionModel).filter(
        TransactionModel.id == transaction_id,
        TransactionModel.user_id == current_user.id,
    ).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transação não encontrada")

    if transaction.transfer_id:
        db.query(TransactionModel).filter(
            TransactionModel.transfer_id == transaction.transfer_id
        ).delete()
    elif transaction.installment_group_id:
        db.query(TransactionModel).filter(
            TransactionModel.installment_group_id == transaction.installment_group_id,
            TransactionModel.user_id == current_user.id,
        ).delete()
    else:
        db.delete(transaction)

    db.commit()


@router.delete("/{transaction_id}/single", status_code=204)
def delete_single_transaction(
    transaction_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Deleta só esta parcela, mantendo as demais do grupo."""
    transaction = db.query(TransactionModel).filter(
        TransactionModel.id == transaction_id,
        TransactionModel.user_id == current_user.id,
    ).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    db.delete(transaction)
    db.commit()
