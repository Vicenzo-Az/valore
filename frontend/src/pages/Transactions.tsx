import { useTransactions } from "@/context";
import { getAccounts } from "@/services/accountService";
import { getCategories } from "@/services/categoryService";
import { createTransfer } from "@/services/transactionService";
import type { Account, Category, Transaction } from "@/types";
import { useEffect, useMemo, useState } from "react";

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
import { ArrowLeftRight } from "lucide-react";

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
  const { transactions, addTransaction, removeTransaction, updateTransaction } =
    useTransactions();

  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  // Filtros
  const [filterType, setFilterType] = useState<string>("all");
  const [filterAccount, setFilterAccount] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Formulário add
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [categoryId, setCategoryId] = useState<string>("");
  const [accountId, setAccountId] = useState<string>("");
  const [date, setDate] = useState("");
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
  const [transferDate, setTransferDate] = useState("");
  const [transferDescription, setTransferDescription] = useState(
    "Transferência entre contas",
  );
  const [transferError, setTransferError] = useState("");

  const todayISO = useMemo(() => new Date().toISOString().split("T")[0], []);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {});
    getAccounts()
      .then(setAccounts)
      .catch(() => {});
  }, []);

  const filteredTransactions = useMemo(() => {
    return [...transactions]
      .filter((t) => filterType === "all" || t.type === filterType)
      .filter((t) => filterAccount === "all" || t.account_id === filterAccount)
      .filter(
        (t) => filterCategory === "all" || t.category_id === filterCategory,
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filterType, filterAccount, filterCategory]);

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
    });
    setDescription("");
    setAmount("");
    setCategoryId("");
    setAccountId("");
    setDate("");
    setAddOpen(false);
  }

  function handleEditClick(t: Transaction) {
    if (t.type === "transfer") return; // transferências não são editáveis individualmente
    setEditingId(t.id);
    setEditDescription(t.description);
    setEditAmount(t.amount.toString());
    setEditType(t.type as "income" | "expense");
    setEditCategoryId(t.category_id ?? "");
    setEditAccountId(t.account_id ?? "");
    setEditDate(t.date);
    setIsEditOpen(true);
  }

  function handleSaveEdit() {
    if (!editingId) return;
    const e = validate(editDescription, editAmount, editDate);
    setEditErrors(e);
    if (Object.values(e).some((v) => v)) return;
    updateTransaction(editingId, {
      description: editDescription.trim(),
      amount: Number(editAmount),
      type: editType,
      date: editDate,
      category_id: editCategoryId || null,
      account_id: editAccountId || null,
    });
    setIsEditOpen(false);
    setEditingId(null);
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
      await createTransfer({
        from_account_id: transferFrom,
        to_account_id: transferTo,
        amount: Number(transferAmount),
        date: transferDate,
        description: transferDescription || "Transferência entre contas",
      });
      // Recarrega as transações
      window.location.reload();
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
              <div className="space-y-4 mt-4">
                <Select value={transferFrom} onValueChange={setTransferFrom}>
                  <SelectTrigger>
                    <SelectValue placeholder="Conta de origem" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name} (R$ {a.current_balance.toFixed(2)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={transferTo} onValueChange={setTransferTo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Conta de destino" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name} (R$ {a.current_balance.toFixed(2)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Valor"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                />
                <Input
                  type="date"
                  value={transferDate}
                  onChange={(e) => setTransferDate(e.target.value)}
                  max={todayISO}
                />
                <Input
                  placeholder="Descrição (opcional)"
                  value={transferDescription}
                  onChange={(e) => setTransferDescription(e.target.value)}
                />
                {transferError && (
                  <p className="text-sm text-red-500">{transferError}</p>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleTransfer}
                >
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
              <div className="space-y-4 mt-4">
                <div>
                  <Input
                    placeholder="Descrição"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={errors.description ? "border-red-500" : ""}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.description}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="Valor"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={errors.amount ? "border-red-500" : ""}
                  />
                  {errors.amount && (
                    <p className="text-sm text-red-500 mt-1">{errors.amount}</p>
                  )}
                </div>
                <Select
                  value={type}
                  onValueChange={(v) => {
                    setType(v as "income" | "expense");
                    setCategoryId("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Receita</SelectItem>
                    <SelectItem value="expense">Despesa</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={accountId} onValueChange={setAccountId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Conta (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    max={todayISO}
                    className={errors.date ? "border-red-500" : ""}
                  />
                  {errors.date && (
                    <p className="text-sm text-red-500 mt-1">{errors.date}</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleAdd}
                >
                  Salvar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
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
          <SelectTrigger className="w-44">
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
          <SelectTrigger className="w-44">
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

      {/* Dialog edição */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Transação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Input
                placeholder="Descrição"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className={editErrors.description ? "border-red-500" : ""}
                autoFocus
              />
              {editErrors.description && (
                <p className="text-sm text-red-500 mt-1">
                  {editErrors.description}
                </p>
              )}
            </div>
            <div>
              <Input
                type="number"
                placeholder="Valor"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                className={editErrors.amount ? "border-red-500" : ""}
              />
              {editErrors.amount && (
                <p className="text-sm text-red-500 mt-1">{editErrors.amount}</p>
              )}
            </div>
            <Select
              value={editType}
              onValueChange={(v) => {
                setEditType(v as "income" | "expense");
                setEditCategoryId("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Receita</SelectItem>
                <SelectItem value="expense">Despesa</SelectItem>
              </SelectContent>
            </Select>
            <Select value={editCategoryId} onValueChange={setEditCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {editFilteredCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={editAccountId} onValueChange={setEditAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Conta (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div>
              <Input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                max={todayISO}
                className={editErrors.date ? "border-red-500" : ""}
              />
              {editErrors.date && (
                <p className="text-sm text-red-500 mt-1">{editErrors.date}</p>
              )}
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleSaveEdit}
            >
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tabela */}
      <div className="rounded-xl border border-border bg-card p-6">
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
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-8"
                >
                  Nenhuma transação encontrada
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((t) => (
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
                  <TableCell>{getCategoryName(t.category_id)}</TableCell>
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
                      onClick={() => removeTransaction(t.id)}
                    >
                      {t.type === "transfer" ? "Cancelar" : "Deletar"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
