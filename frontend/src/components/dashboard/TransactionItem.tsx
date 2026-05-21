import type { Transaction } from "@/types";
import { ArrowLeftRight } from "lucide-react";

interface TransactionItemProps {
  transaction: Transaction;
}

function formatAmount(transaction: Transaction): string {
  if (transaction.type === "transfer") {
    const sign = transaction.transfer_direction === "out" ? "-" : "+";
    return `${sign}R$ ${transaction.amount.toFixed(2)}`;
  }
  return `${transaction.type === "income" ? "+" : "-"}R$ ${transaction.amount.toFixed(2)}`;
}

function amountClass(transaction: Transaction): string {
  if (transaction.type === "transfer") {
    return transaction.transfer_direction === "out"
      ? "text-blue-400"
      : "text-blue-500";
  }
  return transaction.type === "income" ? "text-emerald-500" : "text-red-500";
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
      <div className="flex items-center gap-3">
        {transaction.type === "transfer" && (
          <ArrowLeftRight size={16} className="text-blue-400 shrink-0" />
        )}
        <div>
          <p className="font-medium">{transaction.description}</p>
          <p className="text-sm text-muted-foreground">{transaction.date}</p>
        </div>
      </div>

      <p className={`font-semibold ${amountClass(transaction)}`}>
        {formatAmount(transaction)}
      </p>
    </div>
  );
}
