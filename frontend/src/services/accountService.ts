import api from "@/lib/api";
import type { Account, CreateAccountInput, UpdateAccountInput } from "@/types";

export async function getAccounts(): Promise<Account[]> {
  const { data } = await api.get<Account[]>("/accounts/");
  return data;
}

export async function createAccount(
  input: CreateAccountInput,
): Promise<Account> {
  const { data } = await api.post<Account>("/accounts/", input);
  return data;
}

export async function updateAccount(
  id: string,
  input: UpdateAccountInput,
): Promise<Account> {
  const { data } = await api.put<Account>(`/accounts/${id}`, input);
  return data;
}

export async function deleteAccount(id: string, force = false): Promise<void> {
  await api.delete(`/accounts/${id}`, { params: { force } });
}
