export type TransactionType = "income" | "expense" | "transfer";

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
  user_id: string;
  category_id: string | null;
  account_id: string | null;
  transfer_id: string | null;
  transfer_direction: "in" | "out" | null;
  is_recurring: boolean;
}

export type CreateTransactionInput = {
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
  category_id?: string | null;
  account_id?: string | null;
  is_recurring?: boolean;
  installments?: number;
};

export type UpdateTransactionInput = Partial<CreateTransactionInput>;

export interface TransferInput {
  from_account_id: string;
  to_account_id: string;
  amount: number;
  date: string;
  description?: string;
}
