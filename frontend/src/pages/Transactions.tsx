import { useTransactions } from "@/context";
import { getAccounts } from "@/services/accountService";
import { getCategories } from "@/services/categoryService";
import { getHint } from "@/services/hintService";
import { createTransfer } from "@/services/transactionService";
import type { Account, Category, Transaction } from "@/types";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeftRight,
  Calendar,
  Check,
  Pencil,
  RefreshCw,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

function formatDate(dateString: string): string {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatAmount(transaction: Transaction): string {
  if (transaction.type === "transfer") {
    const sign = transaction.transfer_direction === "out" ? "-" : "+";
    return `${sign}R$ ${transaction.amount.toFixed(2)}`;
  }
  const sign = transaction.type === "income" ? "+" : "-";
  return `${sign}R$ ${transaction.amount.toFixed(2)}`;
}

function amountClass(transaction: Transaction): string {
  if (transaction.type === "transfer") {
    return transaction.transfer_direction === "out"
      ? "text-right font-semibold text-blue-400"
      : "text-right font-semibold text-blue-500";
  }
  return `text-right font-semibold ${
    transaction.type === "income" ? "text-emerald-500" : "text-red-500"
  }`;
}

export default function Transactions() {
  const {
    transactions,
    addTransaction,
    addTransactions,
    removeTransaction,
    updateTransaction,
    removeTransactionGroup,
    removeSingleTransaction,
  } = useTransactions();

  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const todayISO = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Botão delete
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);

  // Filtros
  const [filterType, setFilterType] = useState<string>("all");
  const [filterAccount, setFilterAccount] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterDateFrom, setFilterDateFrom] = useState<string>("");
  const [filterDateTo, setFilterDateTo] = useState<string>("");

  // Formulário add
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [categoryId, setCategoryId] = useState<string>("");
  const [accountId, setAccountId] = useState<string>("");
  const [installments, setInstallments] = useState(1);
  const [date, setDate] = useState(todayISO);
  const [isRecurring, setIsRecurring] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [errors, setErrors] = useState({
    description: "",
    amount: "",
    date: "",
  });

  // Formulário edição
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editType, setEditType] = useState<"income" | "expense">("expense");
  const [editCategoryId, setEditCategoryId] = useState<string>("");
  const [editAccountId, setEditAccountId] = useState<string>("");
  const [editDate, setEditDate] = useState("");
  const [editIsRecurring, setEditIsRecurring] = useState(false);
  const [editIsPaid, setEditIsPaid] = useState(true);
  const [editApplyToAll, setEditApplyToAll] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [editErrors, setEditErrors] = useState({
    description: "",
    amount: "",
    date: "",
  });

  // Formulário transferência
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferFrom, setTransferFrom] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferDate, setTransferDate] = useState(todayISO);
  const [transferDescription, setTransferDescription] = useState(
    "Transferência entre contas",
  );
  const [transferError, setTransferError] = useState("");

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {});
    getAccounts()
      .then(setAccounts)
      .catch(() => {});
  }, []);

  const categoryWasManuallySet = useRef(false);

  // useEffect que dispara quando a descrição muda
  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (description.trim().length >= 3 && !categoryWasManuallySet.current) {
        const suggested = await getHint(description);
        if (suggested) setCategoryId(suggested);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [description]);

  // CORRETO — três blocos separados no nível do componente:

  const filteredTransactions = useMemo(() => {
    return [...transactions]
      .filter((t) => filterType === "all" || t.type === filterType)
      .filter((t) => filterAccount === "all" || t.account_id === filterAccount)
      .filter(
        (t) => filterCategory === "all" || t.category_id === filterCategory,
      )
      .filter((t) => !filterDateFrom || t.date >= filterDateFrom)
      .filter((t) => !filterDateTo || t.date <= filterDateTo)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [
    transactions,
    filterType,
    filterAccount,
    filterCategory,
    filterDateFrom,
    filterDateTo,
  ]);

  const selectedAccount = accounts.find((a) => a.id === accountId);
  const isSelectedAccountCredit = selectedAccount?.is_credit ?? false;

  const groupedByMonth = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    for (const t of filteredTransactions) {
      const [year, month] = t.date.split("-");
      const key = `${year}-${month}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    }
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredTransactions]);

  function formatMonthHeader(key: string): string {
    const [year, month] = key.split("-");
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  }

  function validate(desc: string, amt: string, dt: string) {
    const e = { description: "", amount: "", date: "" };
    if (!desc.trim() || desc.trim().length < 3)
      e.description = "Mínimo 3 caracteres";
    if (!amt || isNaN(Number(amt)) || Number(amt) <= 0)
      e.amount = "Valor inválido";
    if (!dt) e.date = "Data obrigatória";
    else if (new Date(dt) > new Date()) e.date = "Data não pode ser futura";
    return e;
  }

  function handleAdd() {
    const e = validate(description, amount, date);
    setErrors(e);
    if (Object.values(e).some((v) => v)) return;
    addTransaction({
      description: description.trim(),
      amount: Number(amount),
      type,
      date,
      category_id: categoryId || null,
      account_id: accountId || null,
      is_recurring: isRecurring,
      installments,
    });
    setDescription("");
    setAmount("");
    setCategoryId("");
    setAccountId("");
    setInstallments(1);
    setDate(todayISO);
    setAddOpen(false);
    setIsRecurring(false);

    categoryWasManuallySet.current = false;
  }

  function handleEditClick(t: Transaction) {
    if (t.type === "transfer") return;
    setEditingTransaction(t);
    setEditingId(t.id);
    setEditDescription(t.description);
    setEditAmount(t.amount.toString());
    setEditType(t.type as "income" | "expense");
    setEditCategoryId(t.category_id ?? "");
    setEditAccountId(t.account_id ?? "");
    setEditDate(t.date);
    setEditIsRecurring(t.is_recurring ?? false);
    setEditIsPaid(t.is_paid ?? true);
    setEditApplyToAll(false);
    setIsEditOpen(true);
  }

  async function handleSaveEdit() {
    if (!editingId) return;
    const e = validate(editDescription, editAmount, editDate);

    // Remove validação de data futura para parcelas
    if (editingTransaction?.installment_group_id) {
      e.date = "";
    }

    setEditErrors(e);
    if (Object.values(e).some((v) => v)) return;

    const payload = {
      description: editDescription.trim(),
      amount: Number(editAmount),
      type: editType,
      date: editDate,
      category_id: editCategoryId || null,
      account_id: editAccountId || null,
      is_recurring: editIsRecurring,
      is_paid: editIsPaid,
    };

    if (editApplyToAll && editingTransaction?.installment_group_id) {
      const remainingInstallments = transactions.filter(
        (t) =>
          t.installment_group_id === editingTransaction.installment_group_id &&
          !t.is_paid &&
          t.id !== editingId,
      );
      await Promise.all([
        updateTransaction(editingId, payload),
        ...remainingInstallments.map((t) =>
          updateTransaction(t.id, {
            amount: Number(editAmount),
            description: editDescription.trim(),
            category_id: editCategoryId || null,
            account_id: editAccountId || null,
          }),
        ),
      ]);
    } else {
      updateTransaction(editingId, payload);
    }

    setIsEditOpen(false);
    setEditingId(null);
    setEditingTransaction(null);
  }

  async function handleTransfer() {
    setTransferError("");
    if (!transferFrom || !transferTo || !transferAmount || !transferDate) {
      setTransferError("Preencha todos os campos");
      return;
    }
    if (transferFrom === transferTo) {
      setTransferError("Contas devem ser diferentes");
      return;
    }
    if (Number(transferAmount) <= 0) {
      setTransferError("Valor inválido");
      return;
    }
    try {
      const created = await createTransfer({
        from_account_id: transferFrom,
        to_account_id: transferTo,
        amount: Number(transferAmount),
        date: transferDate,
        description: transferDescription || "Transferência entre contas",
      });
      // Adiciona as duas transações geradas ao estado local
      addTransactions(created);
      setIsTransferOpen(false);
      setTransferFrom("");
      setTransferTo("");
      setTransferAmount("");
      setTransferDate(todayISO);
      setTransferDescription("Transferência entre contas");
    } catch {
      setTransferError("Erro ao realizar transferência");
    }
  }

  function getCategoryName(id: string | null) {
    if (!id) return "—";
    return categories.find((c) => c.id === id)?.name ?? "—";
  }

  function getAccountName(id: string | null) {
    if (!id) return "—";
    return accounts.find((a) => a.id === id)?.name ?? "—";
  }

  const filteredCategories = categories.filter(
    (c) => c.type === type || c.type === "both",
  );
  const editFilteredCategories = categories.filter(
    (c) => c.type === editType || c.type === "both",
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold tracking-tight">Transações</h1>
        <div className="flex gap-2">
          {/* Transferência */}
          <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <ArrowLeftRight size={16} />
                Transferir
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Transferência entre contas</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Conta de origem
                  </label>
                  <Select value={transferFrom} onValueChange={setTransferFrom}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar conta" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name} — R$ {a.current_balance.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Conta de destino
                  </label>
                  <Select value={transferTo} onValueChange={setTransferTo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar conta" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name} — R$ {a.current_balance.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Valor
                  </label>
                  <div className="flex items-center border border-input rounded-xl overflow-hidden">
                    <span className="px-3 py-2.5 text-sm font-medium text-muted-foreground border-r border-input bg-muted/40">
                      R$
                    </span>
                    <input
                      type="number"
                      placeholder="0,00"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Data
                  </label>
                  <div className="flex items-center border border-input rounded-xl overflow-hidden">
                    <Calendar
                      size={15}
                      className="ml-3 text-muted-foreground shrink-0"
                    />
                    <input
                      type="date"
                      value={transferDate}
                      onChange={(e) => setTransferDate(e.target.value)}
                      max={todayISO}
                      className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Descrição (opcional)
                  </label>
                  <Input
                    placeholder="Transferência entre contas"
                    value={transferDescription}
                    onChange={(e) => setTransferDescription(e.target.value)}
                  />
                </div>

                {transferError && (
                  <p className="text-sm text-red-500">{transferError}</p>
                )}

                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white gap-2"
                  onClick={handleTransfer}
                >
                  <ArrowLeftRight size={15} />
                  Confirmar transferência
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Adicionar */}
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Adicionar Transação</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Transação</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                {/* Toggle tipo */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setType("income");
                      setCategoryId("");
                      categoryWasManuallySet.current = false;
                    }}
                    className={`py-2.5 rounded-xl text-sm font-medium border-2 transition-all flex items-center justify-center gap-2 ${
                      type === "income"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-border text-muted-foreground hover:border-emerald-500/40"
                    }`}
                  >
                    <TrendingUp size={15} /> Receita
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setType("expense");
                      setCategoryId("");
                      categoryWasManuallySet.current = false;
                    }}
                    className={`py-2.5 rounded-xl text-sm font-medium border-2 transition-all flex items-center justify-center gap-2 ${
                      type === "expense"
                        ? "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400"
                        : "border-border text-muted-foreground hover:border-red-500/40"
                    }`}
                  >
                    <TrendingDown size={15} /> Despesa
                  </button>
                </div>

                {/* Descrição */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Descrição
                  </label>
                  <Input
                    placeholder="Ex: Supermercado, Salário..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={errors.description ? "border-red-500" : ""}
                  />
                  {errors.description && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Valor */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Valor
                  </label>
                  <div
                    className={`flex items-center border rounded-xl overflow-hidden ${errors.amount ? "border-red-500" : "border-input"}`}
                  >
                    <span className="px-3 py-2.5 text-sm font-medium text-muted-foreground border-r border-input bg-muted/40">
                      R$
                    </span>
                    <input
                      type="number"
                      placeholder="0,00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none"
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-xs text-red-500 mt-1">{errors.amount}</p>
                  )}
                </div>

                {/* Categoria + Conta */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Categoria
                    </label>
                    <Select
                      value={categoryId}
                      onValueChange={(v) => {
                        setCategoryId(v);
                        categoryWasManuallySet.current = true;
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Opcional" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredCategories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: c.color }}
                              />
                              {c.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Conta
                    </label>
                    <Select
                      value={accountId}
                      onValueChange={(v) => {
                        setAccountId(v);
                        setInstallments(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Opcional" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Parcelas — conta de crédito */}
                {isSelectedAccountCredit && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Parcelas
                    </label>
                    <div className="flex items-center gap-2 border border-input rounded-xl px-3 py-1">
                      <button
                        type="button"
                        onClick={() =>
                          setInstallments(Math.max(1, installments - 1))
                        }
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors font-medium"
                      >
                        -
                      </button>
                      <span className="flex-1 text-center text-sm font-medium">
                        {installments === 1
                          ? "À vista"
                          : `${installments}x de R$ ${(Number(amount) / installments).toFixed(2)}`}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setInstallments(Math.min(48, installments + 1))
                        }
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors font-medium"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {/* Data */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Data
                  </label>
                  <div
                    className={`flex items-center border rounded-xl overflow-hidden ${errors.date ? "border-red-500" : "border-input"}`}
                  >
                    <Calendar
                      size={15}
                      className="ml-3 text-muted-foreground shrink-0"
                    />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      max={todayISO}
                      className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none"
                    />
                  </div>
                  {errors.date && (
                    <p className="text-xs text-red-500 mt-1">{errors.date}</p>
                  )}
                </div>

                {/* Recorrente */}
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-input bg-muted/20">
                  <input
                    type="checkbox"
                    id="is_recurring"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  />
                  <label
                    htmlFor="is_recurring"
                    className="text-sm cursor-pointer select-none flex items-center gap-1.5"
                  >
                    <RefreshCw size={14} className="text-muted-foreground" />
                    Despesa recorrente
                  </label>
                </div>

                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white gap-2"
                  onClick={handleAdd}
                >
                  <Check size={15} />
                  Salvar transação
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros */}
      <div className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-36 md:w-40">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="income">Receitas</SelectItem>
              <SelectItem value="expense">Despesas</SelectItem>
              <SelectItem value="transfer">Transferências</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterAccount} onValueChange={setFilterAccount}>
            <SelectTrigger className="w-36 md:w-44">
              <SelectValue placeholder="Conta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as contas</SelectItem>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-36 md:w-44">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          <span className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
            <Calendar size={14} />
            <span className="hidden sm:inline">Período:</span>
          </span>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">De</label>
            <div className="flex items-center border border-border rounded-md px-2 md:px-3 h-9">
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                max={filterDateTo || todayISO}
                className="text-sm bg-transparent outline-none w-28 md:w-32"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Até</label>
            <div className="flex items-center border border-border rounded-md px-2 md:px-3 h-9">
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                min={filterDateFrom || undefined}
                max={todayISO}
                className="text-sm bg-transparent outline-none w-28 md:w-32"
              />
            </div>
          </div>
          {(filterDateFrom || filterDateTo) && (
            <button
              onClick={() => {
                setFilterDateFrom("");
                setFilterDateTo("");
              }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Dialog edição */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTransaction?.installment_group_id
                ? `Parcela ${editingTransaction.installment_number}/${editingTransaction.installment_total}`
                : "Editar Transação"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {/* Descrição */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Descrição
              </label>
              <Input
                placeholder="Descrição"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className={editErrors.description ? "border-red-500" : ""}
                autoFocus
              />
              {editErrors.description && (
                <p className="text-xs text-red-500 mt-1">
                  {editErrors.description}
                </p>
              )}
            </div>

            {/* Valor */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Valor
              </label>
              <div
                className={`flex items-center border rounded-xl overflow-hidden ${editErrors.amount ? "border-red-500" : "border-input"}`}
              >
                <span className="px-3 py-2.5 text-sm font-medium text-muted-foreground border-r border-input bg-muted/40">
                  R$
                </span>
                <input
                  type="number"
                  placeholder="0,00"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none"
                />
              </div>
              {editErrors.amount && (
                <p className="text-xs text-red-500 mt-1">{editErrors.amount}</p>
              )}
              {editingTransaction?.installment_group_id && (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="edit_apply_to_all"
                    checked={editApplyToAll}
                    onChange={(e) => setEditApplyToAll(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  />
                  <label
                    htmlFor="edit_apply_to_all"
                    className="text-xs text-muted-foreground cursor-pointer select-none"
                  >
                    Aplicar descrição, valor, categoria e conta a todas as
                    parcelas restantes
                  </label>
                </div>
              )}
            </div>

            {/* Tipo — só para transações normais */}
            {!editingTransaction?.installment_group_id && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Tipo
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditType("income");
                      setEditCategoryId("");
                    }}
                    className={`py-2.5 rounded-xl text-sm font-medium border-2 transition-all flex items-center justify-center gap-2 ${
                      editType === "income"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-border text-muted-foreground hover:border-emerald-500/40"
                    }`}
                  >
                    <TrendingUp size={15} /> Receita
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditType("expense");
                      setEditCategoryId("");
                    }}
                    className={`py-2.5 rounded-xl text-sm font-medium border-2 transition-all flex items-center justify-center gap-2 ${
                      editType === "expense"
                        ? "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400"
                        : "border-border text-muted-foreground hover:border-red-500/40"
                    }`}
                  >
                    <TrendingDown size={15} /> Despesa
                  </button>
                </div>
              </div>
            )}

            {/* Categoria + Conta */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Categoria
                </label>
                <Select
                  value={editCategoryId}
                  onValueChange={setEditCategoryId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Opcional" />
                  </SelectTrigger>
                  <SelectContent>
                    {editFilteredCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: c.color }}
                          />
                          {c.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Conta
                </label>
                <Select value={editAccountId} onValueChange={setEditAccountId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Opcional" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Data */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Data
              </label>
              <div
                className={`flex items-center border rounded-xl overflow-hidden ${editErrors.date ? "border-red-500" : "border-input"}`}
              >
                <Calendar
                  size={15}
                  className="ml-3 text-muted-foreground shrink-0"
                />
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  max={
                    editingTransaction?.installment_group_id
                      ? undefined
                      : todayISO
                  }
                  className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none"
                />
              </div>
              {editErrors.date && (
                <p className="text-xs text-red-500 mt-1">{editErrors.date}</p>
              )}
            </div>

            {/* is_paid — só parcelas */}
            {editingTransaction?.installment_group_id && (
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-input bg-muted/20">
                <input
                  type="checkbox"
                  id="edit_is_paid"
                  checked={editIsPaid}
                  onChange={(e) => setEditIsPaid(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
                <label
                  htmlFor="edit_is_paid"
                  className="text-sm cursor-pointer select-none"
                >
                  Parcela paga
                </label>
              </div>
            )}

            {/* Recorrente — só transações normais */}
            {!editingTransaction?.installment_group_id && (
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-input bg-muted/20">
                <input
                  type="checkbox"
                  id="edit_is_recurring"
                  checked={editIsRecurring}
                  onChange={(e) => setEditIsRecurring(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
                <label
                  htmlFor="edit_is_recurring"
                  className="text-sm cursor-pointer select-none flex items-center gap-1.5"
                >
                  <RefreshCw size={14} className="text-muted-foreground" />
                  Despesa recorrente
                </label>
              </div>
            )}

            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white gap-2"
              onClick={handleSaveEdit}
            >
              <Check size={15} />
              Salvar alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tabela */}
      {/* Tabela agrupada por mês */}
      <div className="space-y-6">
        {filteredTransactions.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
            Nenhuma transação encontrada
          </div>
        ) : (
          groupedByMonth.map(([monthKey, monthTransactions]) => (
            <div
              key={monthKey}
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              {/* Cabeçalho do mês */}
              <div className="px-6 py-3 bg-muted/40 border-b border-border flex items-center justify-between">
                <span className="text-sm font-semibold capitalize">
                  {formatMonthHeader(monthKey)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {monthTransactions.length} transação
                  {monthTransactions.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div
                key={monthKey}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                {/* Cabeçalho do mês */}
                <div className="px-4 md:px-6 py-3 bg-muted/40 border-b border-border flex items-center justify-between">
                  <span className="text-sm font-semibold capitalize">
                    {formatMonthHeader(monthKey)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {monthTransactions.length} transação
                    {monthTransactions.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Desktop — tabela */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Conta</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="text-center">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthTransactions.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell>{formatDate(t.date)}</TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {t.type === "transfer" && (
                                <ArrowLeftRight
                                  size={14}
                                  className="text-blue-400 shrink-0"
                                />
                              )}
                              {t.description}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getCategoryName(t.category_id)}
                          </TableCell>
                          <TableCell>{getAccountName(t.account_id)}</TableCell>
                          <TableCell className={amountClass(t)}>
                            {formatAmount(t)}
                          </TableCell>
                          <TableCell className="text-center">
                            {t.type !== "transfer" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditClick(t)}
                              >
                                Editar
                              </Button>
                            )}
                            <span className="mx-1" />
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeleteTarget(t)}
                            >
                              {t.type === "transfer" ? "Cancelar" : "Deletar"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile — cards */}
                <div className="md:hidden divide-y divide-border">
                  {monthTransactions.map((t) => (
                    <div
                      key={t.id}
                      className="px-4 py-3 flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {t.type === "transfer" && (
                            <ArrowLeftRight
                              size={12}
                              className="text-blue-400 shrink-0"
                            />
                          )}
                          <p className="text-sm font-medium truncate">
                            {t.description}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(t.date)}
                          {getCategoryName(t.category_id) !== "—" &&
                            ` · ${getCategoryName(t.category_id)}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-sm font-semibold ${
                            t.type === "transfer"
                              ? t.transfer_direction === "out"
                                ? "text-blue-400"
                                : "text-blue-500"
                              : t.type === "income"
                                ? "text-emerald-500"
                                : "text-red-500"
                          }`}
                        >
                          {formatAmount(t)}
                        </span>
                        <div className="flex gap-1">
                          {t.type !== "transfer" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleEditClick(t)}
                            >
                              <Pencil size={13} />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500"
                            onClick={() => setDeleteTarget(t)}
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dialog de confirmação de deleção */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {deleteTarget?.installment_group_id
                ? "Deletar parcela"
                : deleteTarget?.type === "transfer"
                  ? "Cancelar transferência"
                  : "Deletar transação"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              {deleteTarget?.installment_group_id
                ? `Parcela ${deleteTarget.installment_number}/${deleteTarget.installment_total} — R$ ${deleteTarget.amount.toFixed(2)}`
                : deleteTarget?.type === "transfer"
                  ? "Isso cancelará os dois lados da transferência."
                  : `"${deleteTarget?.description}" — R$ ${deleteTarget?.amount.toFixed(2)}`}
            </p>

            {deleteTarget?.installment_group_id && (
              <div className="flex flex-col gap-2">
                <Button
                  variant="destructive"
                  onClick={async () => {
                    if (deleteTarget) {
                      await removeSingleTransaction(deleteTarget.id);
                      setDeleteTarget(null);
                    }
                  }}
                >
                  Deletar só esta parcela
                </Button>
                <Button
                  variant="outline"
                  className="border-red-500/40 text-red-500 hover:bg-red-500/10"
                  onClick={async () => {
                    if (deleteTarget?.installment_group_id) {
                      await removeTransactionGroup(
                        deleteTarget.installment_group_id,
                      );
                      setDeleteTarget(null);
                    }
                  }}
                >
                  Deletar todas as parcelas
                </Button>
                <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
                  Cancelar
                </Button>
              </div>
            )}

            {!deleteTarget?.installment_group_id && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setDeleteTarget(null)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    if (deleteTarget) {
                      removeTransaction(deleteTarget.id);
                      setDeleteTarget(null);
                    }
                  }}
                >
                  Confirmar
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
