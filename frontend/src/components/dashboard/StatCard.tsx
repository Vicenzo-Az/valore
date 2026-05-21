import { Card, CardContent } from "@/components/ui/card";

type Variant = "highlight" | "income" | "expense" | "balance";

interface StatCardProps {
  title: string;
  value: string;
  variant?: Variant;
}

const variantStyles: Record<Variant, { bar: string; value: string }> = {
  highlight: { bar: "bg-emerald-500/70 dark:bg-emerald-500/50", value: "" },
  income: {
    bar: "bg-emerald-400/60 dark:bg-emerald-400/40",
    value: "text-emerald-600 dark:text-emerald-400",
  },
  expense: {
    bar: "bg-red-400/60 dark:bg-red-400/40",
    value: "text-red-600 dark:text-red-400",
  },
  balance: {
    bar: "bg-blue-400/60 dark:bg-blue-400/40",
    value: "text-blue-600 dark:text-blue-400",
  },
};

export function StatCard({
  title,
  value,
  variant = "highlight",
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card className="relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/20 dark:hover:shadow-black/50">
      <div className={`absolute top-0 left-0 h-2.5 w-full ${styles.bar}`} />
      <CardContent className="p-6">
        <p className="text-sm text-muted-foreground">{title}</p>
        <h2 className={`text-2xl font-bold mt-2 ${styles.value}`}>{value}</h2>
      </CardContent>
    </Card>
  );
}
