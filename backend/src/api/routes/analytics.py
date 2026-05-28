from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
import pandas as pd

from src.core.database import get_db
from src.core.dependencies import get_current_user
from src.models.transaction import Transaction as TransactionModel
from src.models.account import Account as AccountModel
from src.models.category import Category as CategoryModel
from src.models.user import User
from src.services.balance import get_account_balance

router = APIRouter(prefix="/analytics", tags=["analytics"])


def _transactions_to_df(transactions: list) -> pd.DataFrame:
    if not transactions:
        return pd.DataFrame(
            columns=["id", "description", "amount", "type", "date",
                     "category_id", "account_id", "transfer_id", "transfer_direction"]
        )
    data = [
        {
            "id": t.id,
            "description": t.description,
            "amount": t.amount,
            "type": t.type,
            "date": pd.to_datetime(t.date),
            "category_id": t.category_id,
            "account_id": t.account_id,
            "transfer_id": t.transfer_id,
            "transfer_direction": t.transfer_direction,
        }
        for t in transactions
    ]
    return pd.DataFrame(data)


@router.get("/summary")
def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transactions = (
        db.query(TransactionModel)
        .filter(
            TransactionModel.user_id == current_user.id,
            TransactionModel.is_paid == True,  # noqa: E712
        )
        .all()
    )
    df = _transactions_to_df(transactions)

    real = df[df["type"] != "transfer"] if not df.empty else df

    income = round(float(real[real["type"] == "income"]
                         ["amount"].sum()), 2) if not real.empty else 0.0
    expense = round(float(real[real["type"] == "expense"]
                          ["amount"].sum()), 2) if not real.empty else 0.0

    accounts = (
        db.query(AccountModel)
        .filter(AccountModel.user_id == current_user.id)
        .all()
    )
    net_worth = round(sum(get_account_balance(a, db) for a in accounts), 2)

    return {
        "income": income,
        "expense": expense,
        "balance": round(income - expense, 2),
        "net_worth": net_worth,
        "transaction_count": len(real),
    }


@router.get("/monthly")
def get_monthly(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    year: Optional[int] = Query(default=None),
):
    transactions = (
        db.query(TransactionModel)
        .filter(
            TransactionModel.user_id == current_user.id,
            TransactionModel.type != "transfer",
            TransactionModel.is_paid == True,  # noqa: E712
        )
        .all()
    )
    df = _transactions_to_df(transactions)

    if df.empty:
        return []

    if year:
        df = df[df["date"].dt.year == year]

    df["month"] = df["date"].dt.to_period("M").astype(str)
    monthly = df.groupby(["month", "type"])["amount"].sum().reset_index()

    result: dict = {}
    for _, row in monthly.iterrows():
        month = row["month"]
        if month not in result:
            result[month] = {"month": month, "income": 0.0, "expense": 0.0}
        result[month][row["type"]] = round(float(row["amount"]), 2)

    for month in result:
        result[month]["balance"] = round(
            result[month]["income"] - result[month]["expense"], 2
        )

    return sorted(result.values(), key=lambda x: x["month"])


@router.get("/by-category")
def get_by_category(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    type: Optional[str] = Query(default=None),
):
    transactions = (
        db.query(TransactionModel)
        .filter(
            TransactionModel.user_id == current_user.id,
            TransactionModel.type != "transfer",
            TransactionModel.is_paid == True,  # noqa: E712
        )
        .all()
    )
    df = _transactions_to_df(transactions)

    if df.empty:
        return []

    if type:
        df = df[df["type"] == type]

    category_ids = df["category_id"].dropna().unique().tolist()
    categories = (
        db.query(CategoryModel)
        .filter(CategoryModel.id.in_(category_ids))
        .all()
    ) if category_ids else []
    cat_map = {
        c.id: {"name": c.name, "color": c.color, "icon": c.icon}
        for c in categories
    }

    by_cat = df.groupby("category_id")["amount"].sum().reset_index()

    result = []
    for _, row in by_cat.iterrows():
        cat_id = row["category_id"]
        cat_info = cat_map.get(
            cat_id, {"name": "Sem categoria",
                     "color": "#94a3b8", "icon": "tag"}
        )
        result.append({
            "category_id": cat_id,
            "category_name": cat_info["name"],
            "category_color": cat_info["color"],
            "category_icon": cat_info["icon"],
            "total": round(float(row["amount"]), 2),
        })

    return sorted(result, key=lambda x: x["total"], reverse=True)


@router.get("/trends")
def get_trends(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transactions = (
        db.query(TransactionModel)
        .filter(
            TransactionModel.user_id == current_user.id,
            TransactionModel.type != "transfer",
            TransactionModel.is_paid == True,  # noqa: E712
        )
        .all()
    )
    df = _transactions_to_df(transactions)

    if df.empty:
        return {"current_month": {}, "previous_month": {}, "variation": {}}

    now = pd.Timestamp.now()
    current_month = df[
        (df["date"].dt.year == now.year) & (df["date"].dt.month == now.month)
    ]
    prev = now - pd.DateOffset(months=1)
    previous_month = df[
        (df["date"].dt.year == prev.year) & (df["date"].dt.month == prev.month)
    ]

    def summarize(frame: pd.DataFrame) -> dict:
        if frame.empty:
            return {"income": 0.0, "expense": 0.0, "balance": 0.0}
        income = round(
            float(frame[frame["type"] == "income"]["amount"].sum()), 2)
        expense = round(
            float(frame[frame["type"] == "expense"]["amount"].sum()), 2)
        return {"income": income, "expense": expense, "balance": round(income - expense, 2)}

    def variation(curr: float, prev: float) -> float | None:
        if prev == 0:
            return None
        return round(((curr - prev) / prev) * 100, 1)

    current = summarize(current_month)
    previous = summarize(previous_month)

    return {
        "current_month": current,
        "previous_month": previous,
        "variation": {
            "income": variation(current["income"], previous["income"]),
            "expense": variation(current["expense"], previous["expense"]),
            "balance": variation(current["balance"], previous["balance"]),
        },
    }


@router.get("/recurring-average")
def get_recurring_average(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Média mensal das despesas recorrentes por categoria."""
    transactions = (
        db.query(TransactionModel)
        .filter(
            TransactionModel.user_id == current_user.id,
            TransactionModel.type == "expense",
            TransactionModel.is_recurring == True,  # noqa: E712
            TransactionModel.is_paid == True,  # noqa: E712
        )
        .all()
    )
    df = _transactions_to_df(transactions)

    if df.empty:
        return {"average_monthly": 0.0, "by_category": [], "total_recurring": 0.0}

    # Adiciona coluna de mês
    df["month"] = df["date"].dt.to_period("M").astype(str)

    # Total de meses distintos com despesas recorrentes
    n_months = df["month"].nunique()

    # Média mensal global
    total = float(df["amount"].sum())
    average_monthly = round(total / n_months, 2) if n_months > 0 else 0.0

    # Por categoria
    category_ids = df["category_id"].dropna().unique().tolist()
    categories = (
        db.query(CategoryModel)
        .filter(CategoryModel.id.in_(category_ids))
        .all()
    ) if category_ids else []
    cat_map = {
        c.id: {"name": c.name, "color": c.color, "icon": c.icon}
        for c in categories
    }

    by_cat = df.groupby("category_id")["amount"].sum().reset_index()
    by_category = []
    for _, row in by_cat.iterrows():
        cat_id = row["category_id"]
        cat_info = cat_map.get(
            cat_id, {"name": "Sem categoria",
                     "color": "#94a3b8", "icon": "tag"}
        )
        total_cat = float(row["amount"])
        by_category.append({
            "category_id": cat_id,
            "category_name": cat_info["name"],
            "category_color": cat_info["color"],
            "category_icon": cat_info["icon"],
            "total": round(total_cat, 2),
            "monthly_average": round(total_cat / n_months, 2),
        })

    return {
        "average_monthly": average_monthly,
        "total_recurring": round(total, 2),
        "n_months": n_months,
        "by_category": sorted(by_category, key=lambda x: x["total"], reverse=True),
    }


@router.get("/compare-months")
def compare_months(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    month_a: str = Query(description="Mês A no formato YYYY-MM"),
    month_b: str = Query(description="Mês B no formato YYYY-MM"),
):
    """Compara receitas e despesas entre dois meses específicos."""
    transactions = (
        db.query(TransactionModel)
        .filter(
            TransactionModel.user_id == current_user.id,
            TransactionModel.type != "transfer",
            TransactionModel.is_paid == True,  # noqa: E712
        )
        .all()
    )
    df = _transactions_to_df(transactions)

    if df.empty:
        return {"month_a": {}, "month_b": {}}

    df["month"] = df["date"].dt.to_period("M").astype(str)

    def summarize_month(month: str) -> dict:
        frame = df[df["month"] == month]
        if frame.empty:
            return {"month": month, "income": 0.0, "expense": 0.0, "balance": 0.0, "transaction_count": 0}
        income = round(
            float(frame[frame["type"] == "income"]["amount"].sum()), 2)
        expense = round(
            float(frame[frame["type"] == "expense"]["amount"].sum()), 2)
        return {
            "month": month,
            "income": income,
            "expense": expense,
            "balance": round(income - expense, 2),
            "transaction_count": len(frame),
        }

    def variation(a: float, b: float) -> float | None:
        if b == 0:
            return None
        return round(((a - b) / b) * 100, 1)

    summary_a = summarize_month(month_a)
    summary_b = summarize_month(month_b)

    return {
        "month_a": summary_a,
        "month_b": summary_b,
        "variation": {
            "income": variation(summary_a["income"], summary_b["income"]),
            "expense": variation(summary_a["expense"], summary_b["expense"]),
            "balance": variation(summary_a["balance"], summary_b["balance"]),
        },
    }


@router.get("/future-commitments")
def get_future_commitments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Parcelas pendentes agrupadas por mês."""
    transactions = (
        db.query(TransactionModel)
        .filter(
            TransactionModel.user_id == current_user.id,
            TransactionModel.is_paid == False,  # noqa: E712
            TransactionModel.type == "expense",
            TransactionModel.installment_group_id != None,  # noqa: E711
        )
        .all()
    )

    if not transactions:
        return {"total_pending": 0.0, "by_month": [], "by_group": []}

    df = _transactions_to_df(transactions)
    df["month"] = df["date"].dt.to_period("M").astype(str)

    total_pending = round(float(df["amount"].sum()), 2)

    # Por mês
    by_month = (
        df.groupby("month")["amount"]
        .sum()
        .reset_index()
        .rename(columns={"amount": "total"})
    )
    by_month["total"] = by_month["total"].round(2)
    by_month_list = sorted(
        by_month.to_dict(orient="records"),
        key=lambda x: x["month"]
    )

    # Por grupo de parcelamento
    by_group = []
    groups = df.groupby(
        "transfer_id" if "transfer_id" in df.columns else "installment_group_id")

    # Agrupa por installment_group_id
    for group_id, group_df in df.groupby("installment_group_id"):
        by_group.append({
            "installment_group_id": group_id,
            "description": group_df.iloc[0]["description"],
            "installment_total": int(group_df["installment_total"].iloc[0]) if "installment_total" in group_df.columns else 0,
            "remaining_installments": len(group_df),
            "remaining_total": round(float(group_df["amount"].sum()), 2),
            "installment_amount": round(float(group_df["amount"].iloc[0]), 2),
            "next_due": group_df["date"].min().strftime("%Y-%m-%d"),
        })

    return {
        "total_pending": total_pending,
        "by_month": by_month_list,
        "by_group": sorted(by_group, key=lambda x: x["next_due"]),
    }
