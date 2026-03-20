import prisma from '../config/database';
import { getProvider } from './llm/llmFactory';
import { buildDataExtractorPrompt } from '../prompts/dataExtractorPrompt';
import { buildPersonaFeedbackPrompt, getPersonaSystemPrompt } from '../prompts/personaFeedbackPrompt';
import { buildIntentDetectorPrompt, INTENT_DETECTOR_SYSTEM_PROMPT } from '../prompts/intentDetectorPrompt';
import { buildChatReplyPrompt, getChatPersonaSystemPrompt } from '../prompts/chatReplyPrompt';
import {
  AIEngine,
  Persona,
  Intent,
  ParsedTransaction,
  AIFeedbackContent,
  BudgetContext,
  FinancialContext,
  PersonaFeedbackInput,
} from '../types/llm';
import { AppError } from '../middlewares/errorHandler';

/** 記帳意圖回應 */
export interface TransactionResult {
  intent: 'transaction';
  parsed: ParsedTransaction;
  feedback: AIFeedbackContent;
  budget_context: BudgetContext;
}

/** 對話意圖回應 */
export interface ChatResult {
  intent: 'chat';
  reply: AIFeedbackContent;
  feedback: null;
}

export type ParseResult = TransactionResult | ChatResult;

export async function parseTransaction(
  userId: string,
  rawText: string,
  apiKey: string
): Promise<ParseResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { categoryBudgets: true },
  });

  if (!user) {
    throw new AppError('使用者不存在', 404);
  }

  const engine = user.aiEngine as AIEngine;
  const persona = user.persona as Persona;
  const provider = getProvider(engine);

  // 0. Intent detection
  const intent = await detectIntent(rawText, apiKey, provider);

  // 1. If chat intent → generate chat reply and return
  if (intent === 'chat') {
    const financialContext = await getFinancialContext(userId, user.monthlyBudget);
    const chatReply = await generateChatReply(persona, rawText, financialContext, apiKey, provider);
    return {
      intent: 'chat',
      reply: chatReply,
      feedback: null,
    };
  }

  // 2. Transaction intent → existing flow
  const categories = user.categoryBudgets.map((cb) => cb.category);
  const categoriesWithType = user.categoryBudgets.map((cb) => ({
    category: cb.category,
    type: (cb.type || 'expense') as 'income' | 'expense',
  }));
  const currentDate = new Date().toISOString().split('T')[0];

  // 2a. Data extraction
  const extractorPrompt = buildDataExtractorPrompt({
    rawText,
    categories,
    categoriesWithType,
    currentDate,
  });

  const parsed = await provider.extractData(extractorPrompt, apiKey);

  // 2b. Get budget context
  const monthlyBudget = Number(user.monthlyBudget);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      transactionDate: {
        gte: monthStart,
        lte: monthEnd,
      },
    },
  });

  const spentThisMonth = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const remaining = monthlyBudget - spentThisMonth;
  const usedRatio = monthlyBudget > 0 ? spentThisMonth / monthlyBudget : 0;

  const resolvedCategory = parsed.category || 'other';
  const categoryBudget = user.categoryBudgets.find((cb) => cb.category === resolvedCategory);
  const categoryLimit = categoryBudget ? Number(categoryBudget.budgetLimit) : 0;
  const categorySpent = transactions
    .filter((t) => t.category === resolvedCategory)
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const categoryBudgetUsedRatio = categoryLimit > 0 ? categorySpent / categoryLimit : 0;

  const budgetContext: BudgetContext = {
    monthly_budget: monthlyBudget,
    spent_this_month: spentThisMonth,
    remaining,
    used_ratio: Math.round(usedRatio * 100) / 100,
    category_spent: categorySpent,
    category_limit: categoryLimit,
  };

  // 2c. Generate persona feedback
  const feedbackInput: PersonaFeedbackInput = {
    persona,
    amount: parsed.amount || 0,
    category: resolvedCategory,
    merchant: parsed.merchant || '',
    budgetUsedRatio: usedRatio,
    categoryBudgetUsedRatio,
    monthlyBudget,
    remainingBudget: remaining,
  };

  const personaSystemPrompt = getPersonaSystemPrompt(persona);
  const feedbackUserPrompt = buildPersonaFeedbackPrompt(feedbackInput);
  const combinedPrompt = `${personaSystemPrompt}\n---SYSTEM---\n${feedbackUserPrompt}`;

  const feedback = await provider.generateFeedback(combinedPrompt, apiKey);

  return { intent: 'transaction', parsed, feedback, budget_context: budgetContext };
}

async function detectIntent(
  rawText: string,
  apiKey: string,
  provider: ReturnType<typeof getProvider>
): Promise<Intent> {
  try {
    const userPrompt = buildIntentDetectorPrompt(rawText);
    const text = await provider.generateText(INTENT_DETECTOR_SYSTEM_PROMPT, userPrompt, apiKey);

    // Parse intent from JSON response
    let cleaned = text.trim();
    // Strip markdown code blocks
    const codeBlockMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
    if (codeBlockMatch) {
      cleaned = codeBlockMatch[1].trim();
    }

    const result = JSON.parse(cleaned) as { intent: string };
    if (result.intent === 'chat') return 'chat';
    return 'transaction';
  } catch {
    // If intent detection fails, default to transaction (safe fallback)
    return 'transaction';
  }
}

async function getFinancialContext(userId: string, userMonthlyBudget: unknown): Promise<FinancialContext> {
  const monthlyBudget = Number(userMonthlyBudget);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Query current month transactions and recent 10 transactions in parallel
  const [monthTransactions, recentTransactions] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId,
        transactionDate: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    }),
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { transactionDate: 'desc' },
      take: 10,
      select: {
        transactionDate: true,
        category: true,
        type: true,
        amount: true,
        merchant: true,
      },
    }),
  ]);

  const totalIncome = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const spentThisMonth = totalExpense;
  const remaining = monthlyBudget - spentThisMonth;
  const usedRatio = monthlyBudget > 0 ? spentThisMonth / monthlyBudget : 0;
  const netAssets = totalIncome - totalExpense;

  return {
    monthly_budget: monthlyBudget,
    spent_this_month: spentThisMonth,
    remaining,
    used_ratio: Math.round(usedRatio * 100) / 100,
    total_income: totalIncome,
    total_expense: totalExpense,
    net_assets: netAssets,
    recent_transactions: recentTransactions.map((t) => ({
      date: t.transactionDate.toISOString().split('T')[0],
      category: t.category,
      type: t.type as 'income' | 'expense',
      amount: Number(t.amount),
      merchant: t.merchant,
    })),
  };
}

async function generateChatReply(
  persona: Persona,
  rawText: string,
  financialContext: FinancialContext,
  apiKey: string,
  provider: ReturnType<typeof getProvider>
): Promise<AIFeedbackContent> {
  const systemPrompt = getChatPersonaSystemPrompt(persona);
  const userPrompt = buildChatReplyPrompt({ persona, rawText, financialContext });
  const combinedPrompt = `${systemPrompt}\n---SYSTEM---\n${userPrompt}`;

  return provider.generateFeedback(combinedPrompt, apiKey);
}

export async function validateApiKey(userId: string, apiKey: string): Promise<{ valid: boolean; engine: AIEngine }> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('使用者不存在', 404);
  }

  const engine = user.aiEngine as AIEngine;
  const provider = getProvider(engine);

  // Minimal test: try extracting from a simple input
  try {
    await provider.extractData(
      '測試：午餐 100 元',
      apiKey
    );
    return { valid: true, engine };
  } catch (err) {
    if (err instanceof AppError && err.statusCode === 403) {
      throw err;
    }
    throw new AppError('API Key 驗證失敗，請確認 Key 是否正確', 403);
  }
}
