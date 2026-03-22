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
  catalogtype_confidence: number;
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
  currentDateTime: string;
  aiInstructions?: string | null;
  targetLanguage?: string;
}

export interface RecentTransaction {
  date: string;
  category: string;
  type: 'income' | 'expense';
  amount: number;
  merchant: string | null;
  note?: string;
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

/** AI 語義查詢：時間範圍 */
export interface QueryTimeRange {
  start_date: string;
  end_date: string;
}

/** AI 語義查詢：交易記錄摘要（送入 LLM 的精簡格式） */
export interface TransactionSummaryForQuery {
  id: string;
  amount: number;
  type: string;
  category: string;
  merchant: string | null;
  note: string | null;
  transaction_date: string;
}

/** AI 語義查詢：LLM 匹配分析結果 */
export interface QueryMatchResult {
  matched_ids: string[];
  total_amount: number;
  summary_text: string;
  emotion_tag: string;
}

/** AI 語義查詢：最終回應 */
export interface AIQueryResult {
  summary: {
    text: string;
    emotion_tag: string;
    total_amount: number;
    match_count: number;
  };
  matched_transaction_ids: string[];
  time_range: QueryTimeRange;
}
