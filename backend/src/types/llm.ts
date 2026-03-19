export type AIEngine = 'gemini' | 'openai';
export type Persona = 'sarcastic' | 'gentle' | 'guilt_trip';

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

export interface DataExtractorInput {
  rawText: string;
  categories: string[];
  currentDate: string;
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
