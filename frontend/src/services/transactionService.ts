import api from "@/lib/api";
import type {
  CreateTransactionInput,
  Transaction,
  TransferInput,
  UpdateTransactionInput,
} from "@/types";

export async function getTransactions(params?: {
  account_id?: string;
  category_id?: string;
  type?: string;
  date_from?: string;
  date_to?: string;
}): Promise<Transaction[]> {
  const { data } = await api.get<Transaction[]>("/transactions/", { params });
  return data;
}

export async function getTransaction(id: string): Promise<Transaction> {
  const { data } = await api.get<Transaction>(`/transactions/${id}`);
  return data;
}

export async function createTransaction(
  input: CreateTransactionInput,
): Promise<Transaction> {
  const { data } = await api.post<Transaction>("/transactions/", input);
  return data;
}

export async function updateTransaction(
  id: string,
  input: UpdateTransactionInput,
): Promise<Transaction> {
  const { data } = await api.put<Transaction>(`/transactions/${id}`, input);
  return data;
}

export async function deleteTransaction(id: string): Promise<void> {
  await api.delete(`/transactions/${id}`);
}

export async function createTransfer(
  input: TransferInput,
): Promise<Transaction[]> {
  const { data } = await api.post<Transaction[]>(
    "/transactions/transfer",
    input,
  );
  return data;
}
