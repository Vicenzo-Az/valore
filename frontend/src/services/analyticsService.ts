import api from "@/lib/api";
import type {
    AnalyticsSummary,
    CategoryData,
    MonthlyData,
    TrendsData,
} from "@/types";

export async function getSummary(): Promise<AnalyticsSummary> {
  const { data } = await api.get<AnalyticsSummary>("/analytics/summary");
  return data;
}

export async function getMonthly(year?: number): Promise<MonthlyData[]> {
  const { data } = await api.get<MonthlyData[]>("/analytics/monthly", {
    params: year ? { year } : undefined,
  });
  return data;
}

export async function getByCategory(
  type?: "income" | "expense",
): Promise<CategoryData[]> {
  const { data } = await api.get<CategoryData[]>("/analytics/by-category", {
    params: type ? { type } : undefined,
  });
  return data;
}

export async function getTrends(): Promise<TrendsData> {
  const { data } = await api.get<TrendsData>("/analytics/trends");
  return data;
}
