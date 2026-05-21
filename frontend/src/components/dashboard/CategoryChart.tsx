import type { CategoryData } from "@/types";
import { useTheme } from "next-themes";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface Props {
  data: CategoryData[];
}

export function CategoryChart({ data }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const tooltipStyle = {
    backgroundColor: isDark ? "#1f2937" : "#ffffff",
    border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
    borderRadius: "8px",
  };

  return (
    <div className="w-full rounded-xl border border-border bg-card p-6">
      <h3 className="text-lg font-medium mb-6">Despesas por Categoria</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="category_name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={45}
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.category_color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyle}
              itemStyle={{ color: isDark ? "#f3f4f6" : "#1f2937" }}
              formatter={(value: number | undefined) =>
                value != null ? `R$ ${value.toFixed(2)}` : "—"
              }
            />
            <Legend
              formatter={(value) => (
                <span
                  style={{
                    color: isDark ? "#f3f4f6" : "#1f2937",
                    fontSize: 12,
                  }}
                >
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
