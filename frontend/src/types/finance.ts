// ─── Resumo financeiro ────────────────────────────────────────────────────────

export interface Summary {
  income: number;
  expense: number;
}

export interface UploadResponse {
  summary: Summary;
  balance: number;
}

// ─── Erros da API ─────────────────────────────────────────────────────────────

export interface ApiError {
  detail: string;
}

// ─── Usuário ──────────────────────────────────────────────────────────────────

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
}

// ─── Categoria ────────────────────────────────────────────────────────────────

export type CategoryType = "income" | "expense" | "both";

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
  user_id: string | null;
  parent_id: string | null;
}

export type CreateCategoryInput = Omit<
  Category,
  "id" | "user_id" | "parent_id"
>;
export type UpdateCategoryInput = Partial<CreateCategoryInput>;

// ─── Conta financeira ─────────────────────────────────────────────────────────

export interface Account {
  id: string;
  name: string;
  icon: string;
  color: string;
  initial_balance: number;
  is_credit: boolean;
  user_id: string;
  current_balance: number;
}

export type CreateAccountInput = Omit<
  Account,
  "id" | "user_id" | "current_balance"
>;
export type UpdateAccountInput = Partial<CreateAccountInput>;

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface AnalyticsSummary {
  income: number;
  expense: number;
  balance: number;
  net_worth: number;
  transaction_count: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export interface CategoryData {
  category_id: string;
  category_name: string;
  category_color: string;
  category_icon: string;
  total: number;
}

export interface TrendsData {
  current_month: { income: number; expense: number; balance: number };
  previous_month: { income: number; expense: number; balance: number };
  variation: {
    income: number | null;
    expense: number | null;
    balance: number | null;
  };
}
