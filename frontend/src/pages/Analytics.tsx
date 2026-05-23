import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { MonthlyChart } from "@/components/dashboard/MonthlyChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { TrendsCard } from "@/components/dashboard/TrendsCard";
import {
  getByCategory,
  getMonthly,
  getSummary,
  getTrends,
} from "@/services/analyticsService";
import type {
  AnalyticsSummary,
  CategoryData,
  MonthlyData,
  TrendsData,
} from "@/types";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => currentYear - i);

function CategoryRanking({
  data,
  title,
  total,
}: {
  data: CategoryData[];
  title: string;
  total: number;
}) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-medium mb-4">{title}</h3>
        <p className="text-sm text-muted-foreground">Nenhum dado disponível.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-lg font-medium mb-6">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => {
          const pct = total > 0 ? (item.total / total) * 100 : 0;
          return (
            <div key={item.category_id ?? index}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.category_color }}
                  />
                  <span className="text-sm font-medium">
                    {item.category_name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {pct.toFixed(1)}%
                  </span>
                  <span className="text-sm font-semibold">
                    R$ {item.total.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: item.category_color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Analytics() {
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [monthly, setMonthly] = useState<MonthlyData[]>([]);
  const [expenseByCategory, setExpenseByCategory] = useState<CategoryData[]>(
    [],
  );
  const [incomeByCategory, setIncomeByCategory] = useState<CategoryData[]>([]);
  const [trends, setTrends] = useState<TrendsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const [s, m, exp, inc, t] = await Promise.all([
          getSummary(),
          getMonthly(selectedYear),
          getByCategory("expense"),
          getByCategory("income"),
          getTrends(),
        ]);
        setSummary(s);
        setMonthly(m);
        setExpenseByCategory(exp);
        setIncomeByCategory(inc);
        setTrends(t);
      } catch {
        // silencia erros
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [selectedYear]);

  const totalExpenses = expenseByCategory.reduce((acc, c) => acc + c.total, 0);
  const totalIncome = incomeByCategory.reduce((acc, c) => acc + c.total, 0);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header com seletor de ano */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Análises</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visão detalhada das suas finanças
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Ano:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="text-sm border border-border rounded-md px-3 py-1.5 bg-background outline-none focus:border-emerald-500 transition-colors"
          >
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Seção 1 — Resumo geral */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-muted-foreground uppercase tracking-wider">
          Resumo geral
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Patrimônio Total"
            value={`R$ ${(summary?.net_worth ?? 0).toFixed(2)}`}
            variant="highlight"
          />
          <StatCard
            title="Receitas"
            value={`R$ ${(summary?.income ?? 0).toFixed(2)}`}
            variant="income"
          />
          <StatCard
            title="Despesas"
            value={`R$ ${(summary?.expense ?? 0).toFixed(2)}`}
            variant="expense"
          />
          <StatCard
            title="Saldo"
            value={`R$ ${(summary?.balance ?? 0).toFixed(2)}`}
            variant="balance"
          />
        </div>
      </section>

      {/* Seção 2 — Evolução mensal */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-muted-foreground uppercase tracking-wider">
          Evolução mensal — {selectedYear}
        </h2>
        {monthly.length > 0 ? (
          <MonthlyChart data={monthly} />
        ) : (
          <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground text-sm">
            Nenhuma transação em {selectedYear}.
          </div>
        )}
      </section>

      {/* Seção 3 — Despesas por categoria */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-muted-foreground uppercase tracking-wider">
          Despesas por categoria
        </h2>
        {expenseByCategory.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CategoryChart data={expenseByCategory} />
            <CategoryRanking
              data={expenseByCategory}
              title="Ranking de despesas"
              total={totalExpenses}
            />
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground text-sm">
            Nenhuma despesa categorizada.
          </div>
        )}
      </section>

      {/* Seção 4 — Comparativo mensal */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-muted-foreground uppercase tracking-wider">
          Comparativo mensal
        </h2>
        {trends ? (
          <TrendsCard trends={trends} />
        ) : (
          <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground text-sm">
            Dados insuficientes para comparativo.
          </div>
        )}
      </section>

      {/* Seção 5 — Receitas por categoria */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-muted-foreground uppercase tracking-wider">
          Receitas por categoria
        </h2>
        {incomeByCategory.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CategoryChart data={incomeByCategory} />
            <CategoryRanking
              data={incomeByCategory}
              title="Ranking de receitas"
              total={totalIncome}
            />
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground text-sm">
            Nenhuma receita categorizada.
          </div>
        )}
      </section>
    </div>
  );
}
