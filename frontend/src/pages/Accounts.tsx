import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useTransactions } from "@/context/transaction/useTransactions";
import {
  createAccount,
  deleteAccount,
  getAccounts,
  updateAccount,
} from "@/services/accountService";
import type { Account, CreateAccountInput } from "@/types";
import { Loader2, Pencil, Plus, Trash2, Wallet } from "lucide-react";
import { useEffect, useState } from "react";

const COLOR_OPTIONS = [
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#06b6d4",
  "#64748b",
];

function AccountCard({
  account,
  onEdit,
  onDelete,
}: {
  account: Account;
  onEdit: (a: Account) => void;
  onDelete: (id: string) => void;
}) {
  const isPositive = account.current_balance >= 0;

  return (
    <Card className="relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div
        className="absolute top-0 left-0 h-1.5 w-full"
        style={{ backgroundColor: account.color }}
      />
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${account.color}20` }}
            >
              <Wallet size={20} style={{ color: account.color }} />
            </div>
            <div>
              <p className="font-semibold">{account.name}</p>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                    account.is_credit
                      ? "bg-blue-500/10 text-blue-500"
                      : "bg-emerald-500/10 text-emerald-500"
                  }`}
                >
                  {account.is_credit ? "Crédito" : "Débito"}
                </span>
                <p className="text-xs text-muted-foreground">
                  Inicial: R$ {account.initial_balance.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(account)}
            >
              <Pencil size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-600"
              onClick={() => onDelete(account.id)}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Saldo atual</p>
          <p
            className={`text-2xl font-bold ${isPositive ? "text-emerald-500" : "text-red-500"}`}
          >
            R$ {account.current_balance.toFixed(2)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function AccountForm({
  initial,
  onSave,
  onCancel,
  isLoading,
}: {
  initial?: Partial<CreateAccountInput>;
  onSave: (input: CreateAccountInput) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [initialBalance, setInitialBalance] = useState(
    initial?.initial_balance?.toString() ?? "0",
  );
  const [color, setColor] = useState(initial?.color ?? "#10b981");
  const [isCredit, setIsCredit] = useState(initial?.is_credit ?? false);
  const [error, setError] = useState("");

  function handleSave() {
    if (!name.trim()) {
      setError("Nome obrigatório");
      return;
    }
    if (isNaN(Number(initialBalance))) {
      setError("Saldo inválido");
      return;
    }
    onSave({
      name: name.trim(),
      initial_balance: Number(initialBalance),
      color,
      icon: "wallet",
      is_credit: isCredit,
    });
  }

  return (
    <div className="space-y-4 mt-4">
      <div>
        <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
          Nome da conta
        </label>
        <Input
          placeholder="Ex: Conta corrente, crédito, etc..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
          Saldo inicial
        </label>
        <Input
          type="number"
          placeholder="0.00"
          value={initialBalance}
          onChange={(e) => setInitialBalance(e.target.value)}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Quanto você já tem nessa conta antes de registrar transações.
        </p>
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
          Cor
        </label>
        <div className="flex gap-2 flex-wrap">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                color === c
                  ? "border-foreground scale-110"
                  : "border-transparent"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
          Tipo de conta
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsCredit(false)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
              !isCredit
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-border text-muted-foreground hover:border-emerald-500/40"
            }`}
          >
            Débito
          </button>
          <button
            type="button"
            onClick={() => setIsCredit(true)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
              isCredit
                ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                : "border-border text-muted-foreground hover:border-blue-500/40"
            }`}
          >
            Crédito
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-2 pt-2">
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white"
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading && <Loader2 size={14} className="animate-spin mr-2" />}
          Salvar
        </Button>
      </div>
    </div>
  );
}

export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deleteAccountTarget, setDeleteAccountTarget] =
    useState<Account | null>(null);
  const [deleteAccountError, setDeleteAccountError] = useState("");
  const { clearTransactionsByAccount } = useTransactions();

  async function load() {
    try {
      const data = await getAccounts();
      setAccounts(data);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(input: CreateAccountInput) {
    setIsSaving(true);
    try {
      const created = await createAccount(input);
      setAccounts((prev) => [...prev, created]);
      setAddOpen(false);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpdate(input: CreateAccountInput) {
    if (!editingAccount) return;
    setIsSaving(true);
    try {
      const updated = await updateAccount(editingAccount.id, input);
      setAccounts((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a)),
      );
      setEditingAccount(null);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(force = false, deleteTransactions = false) {
    if (!deleteAccountTarget) return;
    try {
      await deleteAccount(deleteAccountTarget.id, force, deleteTransactions);
      setAccounts((prev) =>
        prev.filter((a) => a.id !== deleteAccountTarget.id),
      );
      if (deleteTransactions) {
        // Remove do contexto de transações todas vinculadas a essa conta
        clearTransactionsByAccount(deleteAccountTarget.id);
      }
      setDeleteAccountTarget(null);
      setDeleteAccountError("");
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail;
      if (detail?.includes("transação")) {
        setDeleteAccountError(detail);
      } else {
        setDeleteAccountError("Erro ao deletar conta.");
      }
    }
  }

  const totalNetWorth = accounts.reduce((acc, a) => acc + a.current_balance, 0);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Patrimônio total:{" "}
            <span
              className={`font-semibold ${totalNetWorth >= 0 ? "text-emerald-500" : "text-red-500"}`}
            >
              R$ {totalNetWorth.toFixed(2)}
            </span>
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white">
              <Plus size={16} />
              Nova Conta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Conta</DialogTitle>
            </DialogHeader>
            <AccountForm
              onSave={handleCreate}
              onCancel={() => setAddOpen(false)}
              isLoading={isSaving}
            />
          </DialogContent>
        </Dialog>
      </div>

      {accounts.length === 0 ? (
        <Card className="p-12 text-center border-2 border-dashed">
          <div className="max-w-sm mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto">
              <Wallet size={28} className="text-emerald-500" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">Nenhuma conta criada</h3>
              <p className="text-sm text-muted-foreground">
                Crie sua primeira conta para começar a organizar suas finanças.
              </p>
            </div>
            <Button
              className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white"
              onClick={() => setAddOpen(true)}
            >
              <Plus size={16} />
              Criar primeira conta
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={setEditingAccount}
              onDelete={(id) =>
                setDeleteAccountTarget(
                  accounts.find((a) => a.id === id) ?? null,
                )
              }
            />
          ))}
        </div>
      )}

      <Dialog
        open={!!editingAccount}
        onOpenChange={(open) => !open && setEditingAccount(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Conta</DialogTitle>
          </DialogHeader>
          {editingAccount && (
            <AccountForm
              initial={editingAccount}
              onSave={handleUpdate}
              onCancel={() => setEditingAccount(null)}
              isLoading={isSaving}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteAccountTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteAccountTarget(null);
            setDeleteAccountError("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deletar conta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              Tem certeza que deseja deletar a conta{" "}
              <span className="font-semibold">{deleteAccountTarget?.name}</span>
              ?
            </p>
            {deleteAccountError && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 space-y-3">
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  {deleteAccountError}
                </p>
                <p className="text-xs text-muted-foreground">
                  Escolha como deseja proceder:
                </p>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(false, true)}
                  >
                    Deletar conta e todas as transações vinculadas
                  </Button>
                  <Button
                    variant="outline"
                    className="border-amber-500/40 text-amber-600 hover:bg-amber-500/10"
                    onClick={() => handleDelete(true, false)}
                  >
                    Deletar só a conta (transações perdem o vínculo)
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setDeleteAccountTarget(null);
                      setDeleteAccountError("");
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
            {!deleteAccountError && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setDeleteAccountTarget(null)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleDelete(false)}
                >
                  Deletar
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
