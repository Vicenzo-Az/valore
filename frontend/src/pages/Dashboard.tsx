import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { IncomeExpenseChart } from "@/components/dashboard/IncomeExpenseChart";
import { MonthlyChart } from "@/components/dashboard/MonthlyChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { TransactionItem } from "@/components/dashboard/TransactionItem";
import { TrendsCard } from "@/components/dashboard/TrendsCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTransactions } from "@/context";
import { getAccounts } from "@/services/accountService";
import {
  getByCategory,
  getMonthly,
  getSummary,
  getTrends,
} from "@/services/analyticsService";
import type {
  Account, AnalyticsSummary,
  CategoryData,
  MonthlyData,
  TrendsData
} from "@/types";
import { Loader2, PlusCircle, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { transactions } = useTransactions();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [monthly, setMonthly] = useState<MonthlyData[]>([]);
  const [byCategory, setByCategory] = useState<CategoryData[]>([]);
  const [trends, setTrends] = useState<TrendsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    getAccounts()
      .then(setAccounts)
      .catch(() => {});
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const [s, m, c, t] = await Promise.all([
          getSummary(),
          getMonthly(),
          getByCategory("expense"),
          getTrends(),
        ]);
        setSummary(s);
        setMonthly(m);
        setByCategory(c);
        setTrends(t);
      } catch {
        // silencia erros de carregamento — dados ficam null
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [transactions]); // recarrega quando transações mudam

  const recentTransactions = [...transactions]
    .filter((t) => t.type !== "transfer")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const hasNoAccounts = accounts.length === 0;
  const isEmpty =
    transactions.filter((t) => t.type !== "transfer").length === 0;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Título */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight leading-none mb-6">
          Visão Geral
        </h1>

        {/* Cards de resumo */}
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
      </div>

      {/* Banner onboarding — aparece quando não há contas */}
      {hasNoAccounts && (
        <Card className="border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Wallet size={20} className="text-amber-500 shrink-0" />
              <p className="text-sm">
                <span className="font-medium">Crie uma conta financeira</span>{" "}
                para vincular transações e ver seu patrimônio real.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate("/accounts")}
              className="shrink-0 border-amber-500/40 text-amber-600 hover:bg-amber-500/10"
            >
              Criar conta
            </Button>
          </div>
        </Card>
      )}

      {isEmpty ? (
        <Card className="p-12 text-center border-2 border-dashed">
          <div className="max-w-md mx-auto space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Nenhuma transação ainda</h3>
              <p className="text-muted-foreground text-sm">
                Comece adicionando sua primeira receita ou despesa.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/transactions")}
              className="gap-2"
            >
              <PlusCircle size={18} />
              Adicionar Transação
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Trends */}
          {trends && <TrendsCard trends={trends} />}

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <IncomeExpenseChart
              income={summary?.income ?? 0}
              expenses={summary?.expense ?? 0}
            />
            {byCategory.length > 0 && <CategoryChart data={byCategory} />}
          </div>

          {/* Gráfico mensal */}
          {monthly.length > 0 && <MonthlyChart data={monthly} />}

          {/* Transações recentes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Transações Recentes</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/transactions")}
              >
                Ver todas
              </Button>
            </div>
            <div className="space-y-3">
              {recentTransactions.map((t) => (
                <TransactionItem key={t.id} transaction={t} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
