import prisma from '../config/database';
import { getProvider } from './llm/llmFactory';
import { buildDataExtractorPrompt } from '../prompts/dataExtractorPrompt';
import { buildPersonaFeedbackPrompt, getPersonaSystemPrompt } from '../prompts/personaFeedbackPrompt';
import {
  AIEngine,
  Persona,
  ParsedTransaction,
  AIFeedbackContent,
  BudgetContext,
  PersonaFeedbackInput,
} from '../types/llm';
import { AppError } from '../middlewares/errorHandler';

export async function parseTransaction(
  userId: string,
  rawText: string,
  apiKey: string
): Promise<{ parsed: ParsedTransaction; feedback: AIFeedbackContent; budget_context: BudgetContext }> {
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

  // Build category list for prompt (with type info for correct income/expense mapping)
  const categories = user.categoryBudgets.map((cb) => cb.category);
  const categoriesWithType = user.categoryBudgets.map((cb) => ({
    category: cb.category,
    type: (cb.type || 'expense') as 'income' | 'expense',
  }));
  const currentDate = new Date().toISOString().split('T')[0];

  // 1. Data extraction
  const extractorPrompt = buildDataExtractorPrompt({
    rawText,
    categories,
    categoriesWithType,
    currentDate,
  });

  const parsed = await provider.extractData(extractorPrompt, apiKey);

  // 2. Get budget context
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

  const monthlyBudget = Number(user.monthlyBudget);
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

  // 3. Generate persona feedback
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

  return { parsed, feedback, budget_context: budgetContext };
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
