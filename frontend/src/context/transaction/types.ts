import type {
  CreateTransactionInput,
  Transaction,
  UpdateTransactionInput,
} from "@/types";

export interface TransactionContextType {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  addTransaction: (transaction: CreateTransactionInput) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  updateTransaction: (
    id: string,
    transaction: UpdateTransactionInput,
  ) => Promise<void>;
  clearTransactions: () => void;
  removeSingleFromState: (id: string) => void;
  removeTransactionGroup: (groupId: string) => Promise<void>;
  removeSingleTransaction: (id: string) => Promise<void>;
}
