import { useUser } from "@/context/user/useUser";
import {
  createTransaction as apiCreate,
  deleteTransaction as apiDelete,
  getTransactions as apiGetAll,
  updateTransaction as apiUpdate,
} from "@/services/transactionService";
import type {
  CreateTransactionInput,
  Transaction,
  UpdateTransactionInput,
} from "@/types";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { TransactionContext } from "./transactionInstance";

interface TransactionProviderProps {
  children: ReactNode;
}

export function TransactionProvider({ children }: TransactionProviderProps) {
  const { user } = useUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiGetAll();
      setTransactions(data);
    } catch {
      setError("Não foi possível carregar as transações.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    } else {
      setTransactions([]);
      setIsLoading(false);
    }
  }, [user, fetchTransactions]);

  const addTransaction = async (input: CreateTransactionInput) => {
    try {
      setError(null);
      const created = await apiCreate(input);
      // createTransaction agora retorna array (simples ou parcelado)
      setTransactions((prev) => [...created, ...prev]);
    } catch {
      setError("Erro ao adicionar transação.");
    }
  };

  const removeTransaction = async (id: string) => {
    try {
      setError(null);
      await apiDelete(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError("Erro ao remover transação.");
    }
  };

  const updateTransaction = async (
    id: string,
    updatedData: UpdateTransactionInput,
  ) => {
    try {
      setError(null);
      const updated = await apiUpdate(id, updatedData);
      setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch {
      setError("Erro ao atualizar transação.");
    }
  };

  const clearTransactions = () => setTransactions([]);

  const removeTransactionGroup = async (groupId: string) => {
    try {
      setError(null);
      // Pega o id de qualquer transação do grupo para chamar o endpoint
      const anyTransaction = transactions.find(
        (t) => t.installment_group_id === groupId,
      );
      if (!anyTransaction) return;
      await apiDelete(anyTransaction.id);
      // Remove todas do grupo do estado local
      setTransactions((prev) =>
        prev.filter((t) => t.installment_group_id !== groupId),
      );
    } catch {
      setError("Erro ao remover parcelas.");
    }
  };

  const removeSingleFromState = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        isLoading,
        error,
        addTransaction,
        removeTransaction,
        updateTransaction,
        clearTransactions,
        removeSingleFromState,
        removeTransactionGroup,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}
