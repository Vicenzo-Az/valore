import { useTheme } from "next-themes";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  income: number;
  expenses: number;
};

// ------------------------------------------------------
interface CustomCursorProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: Array<{ payload: { name: string } }>;
}

// Custom cursor that changes color based on the bar being hovered
const CustomCursor = (props: CustomCursorProps) => {
  const { x, y, width, height, payload } = props;

  if (!payload || !payload[0]) return null;

  // Get color based on the data name
  const isIncome = payload[0].payload.name === "Receita";
  const fillColor = isIncome
    ? "rgba(16, 185, 129, 0.1)"
    : "rgba(175, 37, 37, 0.1)";

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={fillColor}
      stroke="none"
    />
  );
};
// ------------------------------------------------------

export function IncomeExpenseChart({ income, expenses }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const data = [
    { name: "Receita", value: income, fill: "#10b981" },
    { name: "Despesas", value: expenses, fill: "#af2525" },
  ];

  return (
    <div className="h-80 w-full rounded-xl border border-border bg-card p-6">
      <h3 className="text-lg font-medium mb-6">Receita vs Despesas</h3>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ left: 10, right: 10, top: 5, bottom: 5 }}
        >
          {" "}
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            cursor={<CustomCursor />}
            contentStyle={{
              backgroundColor: isDark ? "#1f2937" : "#ffffff",
              border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
              borderRadius: "8px",
            }}
            itemStyle={{
              color: isDark ? "#f3f4f6" : "#1f2937",
            }}
            labelStyle={{
              color: isDark ? "#f3f4f6" : "#1f2937",
              fontWeight: "bold",
            }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
