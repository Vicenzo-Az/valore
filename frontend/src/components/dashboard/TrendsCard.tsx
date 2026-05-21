import type { TrendsData } from "@/types";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";

interface Props {
  trends: TrendsData;
}

function VariationBadge({ value }: { value: number | null }) {
  if (value === null)
    return <span className="text-xs text-muted-foreground">—</span>;

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

export function TrendsCard({ trends }: Props) {
  const { current_month, previous_month, variation } = trends;

  const items = [
    {
      label: "Receitas",
      current: current_month.income,
      previous: previous_month.income,
      variation: variation.income,
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Despesas",
      current: current_month.expense,
      previous: previous_month.expense,
      variation: variation.expense,
      color: "text-red-600 dark:text-red-400",
    },
    {
      label: "Saldo",
      current: current_month.balance,
      previous: previous_month.balance,
      variation: variation.balance,
      color: "text-blue-600 dark:text-blue-400",
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Comparativo Mensal</h3>
        <span className="text-xs text-muted-foreground">vs. mês anterior</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.label} className="space-y-1">
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className={`text-xl font-bold ${item.color}`}>
              R$ {item.current.toFixed(2)}
            </p>
            <div className="flex items-center gap-2">
              <VariationBadge value={item.variation} />
              <span className="text-xs text-muted-foreground">
                R$ {item.previous.toFixed(2)} antes
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
