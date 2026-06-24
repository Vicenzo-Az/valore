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
  "#4C8A6A",
  "#C7A35A",
  "#3B9B95",
  "#C94A3F",
  "#8b5cf6",
  "#3b82f6",
  "#ec4899",
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
    <div
      className="relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: "#121814",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 4px 24px -8px rgba(0,0,0,0.4)",
      }}
    >
      {/* Acento colorido da conta */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
        style={{ backgroundColor: account.color }}
      />

      <div className="p-5">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${account.color}18` }}
            >
              <Wallet size={18} style={{ color: account.color }} />
            </div>
            <div>
              <p
                className="font-semibold text-sm"
                style={{ color: "rgba(255,255,255,0.85)" }}
              >
                {account.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                  style={
                    account.is_credit
                      ? {
                          background: "rgba(199,163,90,0.12)",
                          color: "#D9B36A",
                        }
                      : {
                          background: "rgba(76,138,106,0.12)",
                          color: "#7DB99A",
                        }
                  }
                >
                  {account.is_credit ? "Crédito" : "Débito"}
                </span>
                <p
                  className="text-xs"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  Inicial: R$ {account.initial_balance.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5"
              style={{ color: "rgba(255,255,255,0.35)" }}
              onClick={() => onEdit(account)}
            >
              <Pencil size={13} />
            </button>
            <button
              className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors hover:bg-red-500/10"
              style={{ color: "rgba(201,74,63,0.7)" }}
              onClick={() => onDelete(account.id)}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
        <div>
          <p
            className="text-xs mb-1"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            Saldo atual
          </p>
          <p
            className="text-2xl font-bold font-display"
            style={{ color: isPositive ? "#8FC4A6" : "#D98B7E" }}
          >
            R$ {account.current_balance.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
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
  const [color, setColor] = useState(initial?.color ?? "#4C8A6A");
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

  const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.85)",
  };

  return (
    <div className="space-y-4 mt-4">
      <div>
        <label
          className="text-xs mb-1.5 block font-medium"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          Nome da conta
        </label>
        <Input
          placeholder="Ex: Conta corrente, crédito..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />
      </div>
      <div>
        <label
          className="text-xs mb-1.5 block font-medium"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          Saldo inicial
        </label>
        <Input
          type="number"
          placeholder="0.00"
          value={initialBalance}
          onChange={(e) => setInitialBalance(e.target.value)}
          style={inputStyle}
        />
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>
          Quanto você já tem nessa conta antes de registrar transações.
        </p>
      </div>
      <div>
        <label
          className="text-xs mb-1.5 block font-medium"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          Cor
        </label>
        <div className="flex gap-2 flex-wrap">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full transition-all ${color === c ? "scale-110 ring-2 ring-white/40" : ""}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
      <div>
        <label
          className="text-xs mb-1.5 block font-medium"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          Tipo de conta
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCredit(false)}
            className="flex-1 py-2 rounded-xl text-sm font-medium border transition-all"
            style={
              !isCredit
                ? {
                    border: "1px solid rgba(76,138,106,0.5)",
                    background: "rgba(76,138,106,0.1)",
                    color: "#8FC4A6",
                  }
                : {
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.4)",
                  }
            }
          >
            Débito
          </button>
          <button
            type="button"
            onClick={() => setIsCredit(true)}
            className="flex-1 py-2 rounded-xl text-sm font-medium border transition-all"
            style={
              isCredit
                ? {
                    border: "1px solid rgba(199,163,90,0.5)",
                    background: "rgba(199,163,90,0.1)",
                    color: "#D9B36A",
                  }
                : {
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.4)",
                  }
            }
          >
            Crédito
          </button>
        </div>
      </div>
      {error && (
        <p className="text-sm" style={{ color: "#D98B7E" }}>
          {error}
        </p>
      )}
      <div className="flex gap-2 pt-2">
        <button
          className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.5)",
          }}
          onClick={onCancel}
        >
          Cancelar
        </button>
        <button
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
          style={{
            background: "#4C8A6A",
            color: "#090B0A",
            opacity: isLoading ? 0.6 : 1,
          }}
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading && <Loader2 size={14} className="animate-spin" />}
          Salvar
        </button>
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
      if (deleteTransactions)
        clearTransactionsByAccount(deleteAccountTarget.id);
      setDeleteAccountTarget(null);
      setDeleteAccountError("");
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail;
      if (detail?.includes("transação")) setDeleteAccountError(detail);
      else setDeleteAccountError("Erro ao deletar conta.");
    }
  }

  const totalNetWorth = accounts.reduce((acc, a) => acc + a.current_balance, 0);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2
          className="w-6 h-6 animate-spin"
          style={{ color: "#7DB99A" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-display font-semibold tracking-tight"
            style={{ color: "rgba(255,255,255,0.9)" }}
          >
            Contas
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Patrimônio total:{" "}
            <span
              className="font-semibold"
              style={{ color: totalNetWorth >= 0 ? "#8FC4A6" : "#D98B7E" }}
            >
              R$ {totalNetWorth.toFixed(2)}
            </span>
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: "#4C8A6A", color: "#090B0A" }}
            >
              <Plus size={16} /> Nova Conta
            </button>
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
        <div
          className="p-12 text-center rounded-2xl"
          style={{
            background: "#121814",
            border: "1px dashed rgba(255,255,255,0.08)",
          }}
        >
          <div className="max-w-sm mx-auto space-y-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
              style={{ background: "rgba(76,138,106,0.1)" }}
            >
              <Wallet size={26} style={{ color: "#7DB99A" }} />
            </div>
            <div className="space-y-1">
              <h3
                className="font-semibold text-lg"
                style={{ color: "rgba(255,255,255,0.8)" }}
              >
                Nenhuma conta criada
              </h3>
              <p
                className="text-sm"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Crie sua primeira conta para começar a organizar suas finanças.
              </p>
            </div>
            <button
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: "#4C8A6A", color: "#090B0A" }}
            >
              <Plus size={16} /> Criar primeira conta
            </button>
          </div>
        </div>
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

      {/* Dialog editar */}
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

      {/* Dialog deletar */}
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
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              Tem certeza que deseja deletar a conta{" "}
              <span
                className="font-semibold"
                style={{ color: "rgba(255,255,255,0.8)" }}
              >
                {deleteAccountTarget?.name}
              </span>
              ?
            </p>
            {deleteAccountError && (
              <div
                className="rounded-xl p-4 space-y-3"
                style={{
                  background: "rgba(199,163,90,0.06)",
                  border: "1px solid rgba(199,163,90,0.2)",
                }}
              >
                <p className="text-sm" style={{ color: "#D9B36A" }}>
                  {deleteAccountError}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Escolha como deseja proceder:
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    className="py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: "rgba(201,74,63,0.15)",
                      border: "1px solid rgba(201,74,63,0.3)",
                      color: "#D98B7E",
                    }}
                    onClick={() => handleDelete(false, true)}
                  >
                    Deletar conta e todas as transações vinculadas
                  </button>
                  <button
                    className="py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: "rgba(199,163,90,0.08)",
                      border: "1px solid rgba(199,163,90,0.25)",
                      color: "#D9B36A",
                    }}
                    onClick={() => handleDelete(true, false)}
                  >
                    Deletar só a conta (transações perdem o vínculo)
                  </button>
                  <button
                    className="py-2.5 rounded-xl text-sm transition-all"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                    onClick={() => {
                      setDeleteAccountTarget(null);
                      setDeleteAccountError("");
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
            {!deleteAccountError && (
              <div className="flex gap-2">
                <button
                  className="flex-1 py-2.5 rounded-xl text-sm transition-all"
                  style={{
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.4)",
                  }}
                  onClick={() => setDeleteAccountTarget(null)}
                >
                  Cancelar
                </button>
                <button
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: "rgba(201,74,63,0.15)",
                    border: "1px solid rgba(201,74,63,0.3)",
                    color: "#D98B7E",
                  }}
                  onClick={() => handleDelete(false)}
                >
                  Deletar
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
