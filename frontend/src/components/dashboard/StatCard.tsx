type Variant = "highlight" | "income" | "expense" | "balance";

interface StatCardProps {
  title: string;
  value: string;
  variant?: Variant;
}

const variantStyles: Record<
  Variant,
  { accent: string; value: string; glow: string }
> = {
  highlight: {
    accent: "#4C8A6A",
    value: "text-[#8FC4A6]",
    glow: "rgba(76,138,106,0.06)",
  },
  income: {
    accent: "#4C8A6A",
    value: "text-[#8FC4A6]",
    glow: "rgba(76,138,106,0.05)",
  },
  expense: {
    accent: "#C94A3F",
    value: "text-[#D98B7E]",
    glow: "rgba(201,74,63,0.04)",
  },
  balance: {
    accent: "#C7A35A",
    value: "text-[#D9B36A]",
    glow: "rgba(199,163,90,0.05)",
  },
};

export function StatCard({
  title,
  value,
  variant = "highlight",
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className="relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${styles.glow} 0%, transparent 70%), var(--surface-card)`,
        border: "1px solid var(--border-subtle)",
        borderLeft: `3px solid ${styles.accent}`,
        boxShadow: "0 4px 24px -8px rgba(0,0,0,0.25)",
      }}
    >
      <div className="p-4 md:p-5">
        <p
          className="text-xs font-medium mb-2 md:mb-3"
          style={{ color: "var(--text-muted)" }}
        >
          {title}
        </p>
        <p
          className={`text-lg md:text-2xl font-bold font-display ${styles.value}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
