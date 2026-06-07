import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { MonthlyChart } from "@/components/dashboard/MonthlyChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  compareMonths,
  getByCategory,
  getFutureCommitments,
  getMonthly,
  getRecurringAverage,
  getSummary,
  type CompareMonthsData,
  type FutureCommitmentsData,
  type RecurringAverageData,
} from "@/services/analyticsService";
import type { AnalyticsSummary, CategoryData, MonthlyData } from "@/types";
import {
  Loader2,
  Minus,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

function formatMonth(value: string): string {
  const [year, month] = value.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function VariationBadge({ value }: { value: number | null }) {
  if (value === null)
    return <span className="text-xs text-muted-foreground font-medium">—</span>;
  const isPositive = value > 0;
  const isZero = value === 0;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
        isZero
          ? "bg-muted text-muted-foreground"
          : isPositive
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : "bg-red-500/10 text-red-600 dark:text-red-400"
      }`}
    >
      {isZero ? (
        <Minus size={12} />
      ) : isPositive ? (
        <TrendingUp size={12} />
      ) : (
        <TrendingDown size={12} />
      )}
      {Math.abs(value)}%
    </span>
  );
}

export default function Analytics() {
  const currentYear = new Date().getFullYear();
  const currentMonth = `${currentYear}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const prevMonth = new Date(new Date().setMonth(new Date().getMonth() - 1));
  const prevMonthStr = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`;

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [compareA, setCompareA] = useState(currentMonth);
  const [compareB, setCompareB] = useState(prevMonthStr);
  const [compareData, setCompareData] = useState<CompareMonthsData | null>(
    null,
  );
  const [isLoadingCompare, setIsLoadingCompare] = useState(false);

  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [monthly, setMonthly] = useState<MonthlyData[]>([]);
  const [expenseByCategory, setExpenseByCategory] = useState<CategoryData[]>(
    [],
  );
  const [incomeByCategory, setIncomeByCategory] = useState<CategoryData[]>([]);
  const [recurring, setRecurring] = useState<RecurringAverageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [futureCommitments, setFutureCommitments] =
    useState<FutureCommitmentsData | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const [s, m, ec, ic, r, fc] = await Promise.all([
          getSummary(),
          getMonthly(selectedYear),
          getByCategory("expense"),
          getByCategory("income"),
          getRecurringAverage(),
          getFutureCommitments(),
        ]);
        setSummary(s);
        setMonthly(m);
        setExpenseByCategory(ec);
        setIncomeByCategory(ic);
        setRecurring(r);
        setFutureCommitments(fc);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [selectedYear]);

  async function handleCompare() {
    if (!compareA || !compareB) return;
    setIsLoadingCompare(true);
    try {
      const data = await compareMonths(compareA, compareB);
      setCompareData(data);
    } finally {
      setIsLoadingCompare(false);
    }
  }

  const years = Array.from(
    { length: currentYear - 2023 + 1 },
    (_, i) => currentYear - i,
  );

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Análises</h1>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="text-sm border border-border rounded-md px-3 h-9 bg-background outline-none"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Resumo geral */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Patrimônio Total",
            value: summary?.net_worth ?? 0,
            color: "text-emerald-500",
          },
          {
            label: "Total Receitas",
            value: summary?.income ?? 0,
            color: "text-emerald-400",
          },
          {
            label: "Total Despesas",
            value: summary?.expense ?? 0,
            color: "text-red-400",
          },
          {
            label: "Saldo Líquido",
            value: summary?.balance ?? 0,
            color:
              (summary?.balance ?? 0) >= 0 ? "text-blue-400" : "text-red-400",
          },
        ].map((item) => (
          <Card key={item.label} className="relative overflow-hidden">
            <div className="absolute top-0 left-0 h-1 w-full bg-emerald-500/40" />
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
              <p className={`text-xl font-bold ${item.color}`}>
                R$ {item.value.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Evolução mensal */}
      {monthly.length > 0 ? (
        <MonthlyChart data={monthly} />
      ) : (
        <Card className="p-8 text-center text-muted-foreground text-sm">
          Sem dados mensais para {selectedYear}
        </Card>
      )}

      {/* Distribuição por categoria */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Distribuição por Categoria
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {expenseByCategory.length > 0 ? (
            <CategoryChart
              data={expenseByCategory}
              title="Despesas por Categoria"
            />
          ) : (
            <Card className="p-8 text-center text-muted-foreground text-sm">
              Sem despesas registradas
            </Card>
          )}
          {incomeByCategory.length > 0 ? (
            <CategoryChart
              data={incomeByCategory}
              title="Receitas por Categoria"
            />
          ) : (
            <Card className="p-8 text-center text-muted-foreground text-sm">
              Sem receitas registradas
            </Card>
          )}
        </div>
      </div>

      {/* Ranking de despesas */}
      {expenseByCategory.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Ranking de Despesas</h2>
          <Card>
            <CardContent className="p-0">
              {/* Desktop */}
              <table className="w-full text-sm hidden md:table">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-3 text-muted-foreground font-medium">
                      #
                    </th>
                    <th className="text-left px-6 py-3 text-muted-foreground font-medium">
                      Categoria
                    </th>
                    <th className="text-right px-6 py-3 text-muted-foreground font-medium">
                      Total
                    </th>
                    <th className="text-right px-6 py-3 text-muted-foreground font-medium">
                      % do total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {expenseByCategory.map((cat, index) => {
                    const totalExpense = expenseByCategory.reduce(
                      (acc, c) => acc + c.total,
                      0,
                    );
                    const pct =
                      totalExpense > 0
                        ? ((cat.total / totalExpense) * 100).toFixed(1)
                        : "0";
                    return (
                      <tr
                        key={cat.category_id}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-6 py-3 text-muted-foreground">
                          {index + 1}
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: cat.category_color }}
                            />
                            {cat.category_name}
                          </div>
                        </td>
                        <td className="px-6 py-3 text-right font-medium text-red-400">
                          R$ {cat.total.toFixed(2)}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-red-400"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-muted-foreground w-10 text-right">
                              {pct}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Mobile */}
              <div className="md:hidden divide-y divide-border">
                {expenseByCategory.map((cat, index) => {
                  const totalExpense = expenseByCategory.reduce(
                    (acc, c) => acc + c.total,
                    0,
                  );
                  const pct =
                    totalExpense > 0
                      ? ((cat.total / totalExpense) * 100).toFixed(1)
                      : "0";
                  return (
                    <div
                      key={cat.category_id}
                      className="px-4 py-3 flex items-center gap-3"
                    >
                      <span className="text-xs text-muted-foreground w-4">
                        {index + 1}
                      </span>
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: cat.category_color }}
                      />
                      <span className="flex-1 text-sm">
                        {cat.category_name}
                      </span>
                      <div className="text-right">
                        <p className="text-sm font-medium text-red-400">
                          R$ {cat.total.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">{pct}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Despesas recorrentes */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Despesas Recorrentes</h2>
        {!recurring || recurring.by_category.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground text-sm">
            Nenhuma despesa marcada como recorrente ainda.
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  label: "Média mensal total",
                  value: `R$ ${recurring.average_monthly.toFixed(2)}`,
                  color: "text-red-400",
                },
                {
                  label: "Total registrado",
                  value: `R$ ${recurring.total_recurring.toFixed(2)}`,
                  color: "",
                },
                {
                  label: "Meses com recorrentes",
                  value: String(recurring.n_months),
                  color: "",
                },
              ].map((item) => (
                <Card key={item.label}>
                  <CardContent className="p-5">
                    <p className="text-xs text-muted-foreground mb-1">
                      {item.label}
                    </p>
                    <p className={`text-xl font-bold ${item.color}`}>
                      {item.value}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-6 py-3 text-muted-foreground font-medium">
                        Categoria
                      </th>
                      <th className="text-right px-6 py-3 text-muted-foreground font-medium">
                        Total
                      </th>
                      <th className="text-right px-6 py-3 text-muted-foreground font-medium">
                        Média/mês
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recurring.by_category.map((cat) => (
                      <tr
                        key={cat.category_id}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: cat.category_color }}
                            />
                            {cat.category_name}
                          </div>
                        </td>
                        <td className="px-6 py-3 text-right font-medium text-red-400">
                          R$ {cat.total.toFixed(2)}
                        </td>
                        <td className="px-6 py-3 text-right text-muted-foreground">
                          R$ {cat.monthly_average.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Compromissos futuros */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Compromissos Futuros</h2>
        {!futureCommitments || futureCommitments.total_pending === 0 ? (
          <Card className="p-8 text-center text-muted-foreground text-sm">
            Nenhuma parcela pendente.
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-5">
                  <p className="text-xs text-muted-foreground mb-1">
                    Total pendente
                  </p>
                  <p className="text-xl font-bold text-red-400">
                    R$ {futureCommitments.total_pending.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <p className="text-xs text-muted-foreground mb-1">
                    Compras parceladas ativas
                  </p>
                  <p className="text-xl font-bold">
                    {futureCommitments.by_group.length}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Por compra */}
            <Card>
              <CardContent className="p-0">
                {/* Desktop */}
                <table className="w-full text-sm hidden md:table">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-6 py-3 text-muted-foreground font-medium">
                        Descrição
                      </th>
                      <th className="text-right px-6 py-3 text-muted-foreground font-medium">
                        Parcelas restantes
                      </th>
                      <th className="text-right px-6 py-3 text-muted-foreground font-medium">
                        Valor/parcela
                      </th>
                      <th className="text-right px-6 py-3 text-muted-foreground font-medium">
                        Total restante
                      </th>
                      <th className="text-right px-6 py-3 text-muted-foreground font-medium">
                        Próximo venc.
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {futureCommitments.by_group.map((group) => (
                      <tr
                        key={group.installment_group_id}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-6 py-3 font-medium">
                          {group.description}
                        </td>
                        <td className="px-6 py-3 text-right text-muted-foreground">
                          {group.remaining_installments}/
                          {group.installment_total}
                        </td>
                        <td className="px-6 py-3 text-right">
                          R$ {group.installment_amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-3 text-right font-medium text-red-400">
                          R$ {group.remaining_total.toFixed(2)}
                        </td>
                        <td className="px-6 py-3 text-right text-muted-foreground">
                          {new Date(
                            group.next_due + "T00:00:00",
                          ).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Mobile */}
                <div className="md:hidden divide-y divide-border">
                  {futureCommitments.by_group.map((group) => (
                    <div
                      key={group.installment_group_id}
                      className="px-4 py-3 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          {group.description}
                        </p>
                        <p className="text-sm font-medium text-red-400">
                          R$ {group.remaining_total.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {group.remaining_installments}/
                          {group.installment_total} parcelas · R${" "}
                          {group.installment_amount.toFixed(2)}/mês
                        </span>
                        <span>
                          Venc.{" "}
                          {new Date(
                            group.next_due + "T00:00:00",
                          ).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Comparativo entre meses */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Comparar Meses</h2>
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-end gap-3 flex-wrap">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">
                  Mês A
                </label>
                <input
                  type="month"
                  value={compareA}
                  onChange={(e) => setCompareA(e.target.value)}
                  className="text-sm border border-border rounded-md px-3 h-9 bg-background outline-none block"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">
                  Mês B
                </label>
                <input
                  type="month"
                  value={compareB}
                  onChange={(e) => setCompareB(e.target.value)}
                  className="text-sm border border-border rounded-md px-3 h-9 bg-background outline-none block"
                />
              </div>
              <Button
                variant="outline"
                className="gap-2 h-9"
                onClick={handleCompare}
                disabled={isLoadingCompare}
              >
                {isLoadingCompare ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <RefreshCw size={14} />
                )}
                Comparar
              </Button>
            </div>

            {compareData && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  {
                    label: "Receitas",
                    key: "income" as const,
                    color: "text-emerald-500",
                  },
                  {
                    label: "Despesas",
                    key: "expense" as const,
                    color: "text-red-400",
                  },
                  {
                    label: "Saldo",
                    key: "balance" as const,
                    color: "text-blue-400",
                  },
                ].map(({ label, key, color }) => (
                  <div key={key} className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">
                      {label}
                    </p>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5 capitalize">
                          {formatMonth(compareA)}
                        </p>
                        <p className={`text-lg font-bold ${color}`}>
                          R$ {compareData.month_a[key].toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-0.5 capitalize">
                          {formatMonth(compareB)}
                        </p>
                        <p className={`text-lg font-bold ${color}`}>
                          R$ {compareData.month_b[key].toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <VariationBadge value={compareData.variation[key]} />
                      <span className="text-xs text-muted-foreground">
                        vs mês B
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
