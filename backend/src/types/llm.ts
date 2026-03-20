export type AIEngine = 'gemini' | 'openai';
export type Persona = 'sarcastic' | 'gentle' | 'guilt_trip';
export type Intent = 'transaction' | 'chat';

export type TransactionType = 'income' | 'expense';

export interface ParsedTransaction {
  type: TransactionType;
  amount: number | null;
  category: string | null;
  merchant: string;
  date: string;
  confidence: number;
  is_new_category: boolean;
  suggested_category: string | null;
  note: string | null;
}

export interface AIFeedbackContent {
  text: string;
  emotion_tag: string;
}

export interface BudgetContext {
  monthly_budget: number;
  spent_this_month: number;
  remaining: number;
  used_ratio: number;
  category_spent: number;
  category_limit: number;
}

export interface CategoryWithType {
  category: string;
  type: 'income' | 'expense';
}

export interface DataExtractorInput {
  rawText: string;
  categories: string[];
  categoriesWithType?: CategoryWithType[];
  currentDate: string;
  currentDayOfWeek: string;
  aiInstructions?: string | null;
}

export interface RecentTransaction {
  date: string;
  category: string;
  type: 'income' | 'expense';
  amount: number;
  merchant: string | null;
}

export interface FinancialContext {
  monthly_budget: number;
  spent_this_month: number;
  remaining: number;
  used_ratio: number;
  total_income: number;
  total_expense: number;
  net_assets: number;
  recent_transactions: RecentTransaction[];
}

export interface PersonaFeedbackInput {
  persona: Persona;
  amount: number;
  category: string;
  merchant: string;
  budgetUsedRatio: number;
  categoryBudgetUsedRatio: number;
  monthlyBudget: number;
  remainingBudget: number;
}
