import prisma from '../config/database';
import { getProvider } from './llm/llmFactory';
import { buildDataExtractorPrompt } from '../prompts/dataExtractorPrompt';
import { buildPersonaFeedbackPrompt, getPersonaSystemPrompt } from '../prompts/personaFeedbackPrompt';
import { buildIntentDetectorPrompt, INTENT_DETECTOR_SYSTEM_PROMPT } from '../prompts/intentDetectorPrompt';
import { buildChatReplyPrompt, getChatPersonaSystemPrompt } from '../prompts/chatReplyPrompt';
import {
  TIME_RANGE_SYSTEM_PROMPT,
  buildTimeRangePrompt,
  buildTransactionMatchSystemPrompt,
  buildTransactionMatchUserPrompt,
} from '../prompts/queryPrompt';
import {
  AIEngine,
  Persona,
  Intent,
  ParsedTransaction,
  AIFeedbackContent,
  BudgetContext,
  FinancialContext,
  PersonaFeedbackInput,
  QueryTimeRange,
  TransactionSummaryForQuery,
  QueryMatchResult,
  AIQueryResult,
} from '../types/llm';
import { AppError, createI18nError } from '../middlewares/errorHandler';

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
    throw createI18nError('user_not_found', 404);
  }

  const engine = user.aiEngine as AIEngine;
  const persona = user.persona as Persona;
  const provider = getProvider(engine);
  const userModel = (user as Record<string, unknown>).aiModel as string | undefined;

  const targetLanguage = user.language || 'zh-TW';

  // 0. Intent detection
  const intent = await detectIntent(rawText, apiKey, provider, userModel);


  // 1. If chat intent → generate chat reply and return
  if (intent === 'chat') {
    const financialContext = await getFinancialContext(userId, user.monthlyBudget);
    let chatReply: AIFeedbackContent;
    try {
      chatReply = await generateChatReply(persona, rawText, financialContext, apiKey, provider, user.aiInstructions, targetLanguage, userModel);
    } catch (err) {
      console.warn('[Chat Fallback] generateChatReply 失敗，使用預設回饋', err);
      chatReply = { text: '已記錄！', emotion_tag: 'neutral' };
    }
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
  const now = new Date();
  const taipeiDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Taipei' }));
  const year = taipeiDate.getFullYear();
  const month = taipeiDate.getMonth() + 1;
  const day = taipeiDate.getDate();
  const dayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const weekday = dayNames[taipeiDate.getDay()];
  const hh = String(taipeiDate.getHours()).padStart(2, '0');
  const mm = String(taipeiDate.getMinutes()).padStart(2, '0');
  const ss = String(taipeiDate.getSeconds()).padStart(2, '0');
  const currentDateTime = `${year}年${month}月${day}日 ${weekday} ${hh}:${mm}:${ss} (GMT+8)`;

  // 2a. Data extraction
  const extractorPrompt = buildDataExtractorPrompt({
    rawText,
    categories,
    categoriesWithType,
    currentDateTime,
    aiInstructions: user.aiInstructions,
    targetLanguage,
  });


  const parsed = await provider.extractData(extractorPrompt, apiKey, userModel);



  // 2b. Get budget context
  const monthlyBudget = Number(user.monthlyBudget);
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

  const personaSystemPrompt = getPersonaSystemPrompt(persona, targetLanguage);
  const feedbackUserPrompt = buildPersonaFeedbackPrompt(feedbackInput, user.aiInstructions);
  const aiInstructionsBlock = user.aiInstructions
    ? `\n\n【重要】使用者自訂指示（你必須優先遵從以下指示來調整回覆風格與內容）：\n${user.aiInstructions}`
    : '';
  const combinedPrompt = `${personaSystemPrompt}${aiInstructionsBlock}\n---SYSTEM---\n${feedbackUserPrompt}`;

  let feedback: AIFeedbackContent;
  try {
    feedback = await provider.generateFeedback(combinedPrompt, apiKey, userModel);
  } catch (err) {
    console.warn('[Feedback Fallback] generateFeedback 失敗，使用預設回饋', err);
    feedback = { text: '已記錄！', emotion_tag: 'neutral' };
  }

  return { intent: 'transaction', parsed, feedback, budget_context: budgetContext };
}

async function detectIntent(
  rawText: string,
  apiKey: string,
  provider: ReturnType<typeof getProvider>,
  model?: string
): Promise<Intent> {
  try {
    const userPrompt = buildIntentDetectorPrompt(rawText);
    const text = await provider.generateText(INTENT_DETECTOR_SYSTEM_PROMPT, userPrompt, apiKey, model);

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

  // Query current month transactions (for budget calc) and recent 1 month transactions (for context)
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
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
      where: {
        userId,
        transactionDate: { gte: oneMonthAgo },
      },
      orderBy: { transactionDate: 'desc' },
      select: {
        transactionDate: true,
        category: true,
        type: true,
        amount: true,
        merchant: true,
        note: true,
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
      note: t.note || undefined,
    })),
  };
}

async function generateChatReply(
  persona: Persona,
  rawText: string,
  financialContext: FinancialContext,
  apiKey: string,
  provider: ReturnType<typeof getProvider>,
  aiInstructions?: string | null,
  targetLanguage?: string,
  model?: string
): Promise<AIFeedbackContent> {
  const systemPrompt = getChatPersonaSystemPrompt(persona, targetLanguage);
  const userPrompt = buildChatReplyPrompt({ persona, rawText, financialContext, aiInstructions });
  const aiInstructionsBlock = aiInstructions
    ? `\n\n【重要】使用者自訂指示（你必須優先遵從以下指示來調整回覆風格與內容）：\n${aiInstructions}`
    : '';
  const combinedPrompt = `${systemPrompt}${aiInstructionsBlock}\n---SYSTEM---\n${userPrompt}`;


  return provider.generateFeedback(combinedPrompt, apiKey, model);
}

// ─── AI 語義查詢 (PRD-F-014) ───

export async function queryTransactions(
  userId: string,
  queryText: string,
  apiKey: string
): Promise<AIQueryResult> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw createI18nError('user_not_found', 404);
  }

  const engine = user.aiEngine as AIEngine;
  const persona = user.persona as Persona;
  const provider = getProvider(engine);
  const queryModel = (user as Record<string, unknown>).aiModel as string | undefined;
  const userLanguage = user.language || 'zh-TW';

  // 當前時間（台北時區）
  const now = new Date();
  const taipeiDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Taipei' }));
  const year = taipeiDate.getFullYear();
  const month = taipeiDate.getMonth() + 1;
  const day = taipeiDate.getDate();
  const dayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const weekday = dayNames[taipeiDate.getDay()];
  const hh = String(taipeiDate.getHours()).padStart(2, '0');
  const mm = String(taipeiDate.getMinutes()).padStart(2, '0');
  const ss = String(taipeiDate.getSeconds()).padStart(2, '0');
  const currentDateTime = `${year}年${month}月${day}日 ${weekday} ${hh}:${mm}:${ss} (GMT+8)`;

  // 階段 1：時間範圍解析
  const timeRange = await parseTimeRange(queryText, currentDateTime, apiKey, provider, taipeiDate, queryModel);

  // 階段 1.5：檢查查詢範圍是否超過 180 天（6 個月）
  const rangeStartDate = new Date(timeRange.start_date);
  const rangeEndDate = new Date(timeRange.end_date);
  const rangeDays = Math.ceil((rangeEndDate.getTime() - rangeStartDate.getTime()) / (1000 * 60 * 60 * 24));

  if (rangeDays > 180) {
    const personaMessage = getQueryRangeTooLargeMessage(persona, userLanguage);
    return {
      summary: {
        text: personaMessage,
        emotion_tag: 'neutral',
        total_amount: 0,
        match_count: 0,
      },
      matched_transaction_ids: [],
      time_range: timeRange,
    };
  }

  // 階段 2a：查詢 DB 取得交易記錄
  const startDate = new Date(timeRange.start_date);
  const endDate = new Date(timeRange.end_date);
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      transactionDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { transactionDate: 'desc' },
    take: 200, // SRD §4.1.3: 最多 200 筆
    select: {
      id: true,
      amount: true,
      type: true,
      category: true,
      merchant: true,
      note: true,
      transactionDate: true,
    },
  });

  const txnSummaries: TransactionSummaryForQuery[] = transactions.map((t) => ({
    id: t.id,
    amount: Number(t.amount),
    type: t.type,
    category: t.category,
    merchant: t.merchant,
    note: t.note,
    transaction_date: t.transactionDate.toISOString().split('T')[0],
  }));

  // 階段 2b：LLM 匹配分析
  const matchResult = await matchTransactions(queryText, txnSummaries, persona, apiKey, provider, userLanguage, queryModel);

  return {
    summary: {
      text: matchResult.summary_text,
      emotion_tag: matchResult.emotion_tag,
      total_amount: matchResult.total_amount,
      match_count: matchResult.matched_ids.length,
    },
    matched_transaction_ids: matchResult.matched_ids,
    time_range: timeRange,
  };
}

// ─── 查詢範圍過大時的人設回應 ───

const QUERY_RANGE_TOO_LARGE_MESSAGES: Record<string, Record<Persona, string>> = {
  'zh-TW': {
    sarcastic: '半年的帳？你是要我加班到死嗎？把範圍縮小一點再來，我又不是超級電腦。',
    gentle: '這段時間的數據好多呢～可以試試查詢某個月份嗎？這樣我能給你更精確的分析喔 💕',
    guilt_trip: '你要我一次看這麼多數據...是不是不在乎我的感受？拜託一次查一個月好不好嘛 🥺',
  },
  en: {
    sarcastic: "Six months of expenses? Am I your personal accountant? Narrow it down, I'm not a supercomputer.",
    gentle: "That's a lot of data to go through~ Could you try a shorter time period? I can give you much better insights that way 💕",
    guilt_trip: 'You want me to look through all that data at once... Do you even care about me? Please try one month at a time 🥺',
  },
  'zh-CN': {
    sarcastic: '半年的账？你是要我加班到死吗？把范围缩小一点再来，我又不是超级电脑。',
    gentle: '这段时间的数据好多呢～可以试试查询某个月份吗？这样我能给你更精确的分析哦 💕',
    guilt_trip: '你要我一次看这么多数据...是不是不在乎我的感受？拜托一次查一个月好不好嘛 🥺',
  },
  vi: {
    sarcastic: 'Nửa năm chi tiêu? Tôi là kế toán riêng của bạn à? Thu hẹp phạm vi lại đi, tôi không phải siêu máy tính đâu.',
    gentle: 'Dữ liệu nhiều quá đi~ Bạn thử hỏi theo từng tháng được không? Như vậy mình phân tích chính xác hơn nè 💕',
    guilt_trip: 'Bạn muốn mình xem nhiều dữ liệu vậy sao... Bạn có quan tâm mình không? Hỏi từng tháng thôi mà 🥺',
  },
};

export function getQueryRangeTooLargeMessage(persona: Persona, language: string): string {
  const langMap: Record<string, string> = { 'zh-TW': 'zh-TW', 'zh-CN': 'zh-CN', en: 'en', vi: 'vi' };
  const lang = langMap[language] || (language.startsWith('en') ? 'en' : language.startsWith('zh') ? 'zh-TW' : 'zh-TW');
  const messages = QUERY_RANGE_TOO_LARGE_MESSAGES[lang] || QUERY_RANGE_TOO_LARGE_MESSAGES['zh-TW'];
  return messages[persona] || messages['sarcastic'];
}

async function parseTimeRange(
  queryText: string,
  currentDateTime: string,
  apiKey: string,
  provider: ReturnType<typeof getProvider>,
  taipeiDate: Date,
  model?: string
): Promise<QueryTimeRange> {
  // 預設當月
  const defaultStart = `${taipeiDate.getFullYear()}-${String(taipeiDate.getMonth() + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(taipeiDate.getFullYear(), taipeiDate.getMonth() + 1, 0).getDate();
  const defaultEnd = `${taipeiDate.getFullYear()}-${String(taipeiDate.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  try {
    const userPrompt = buildTimeRangePrompt(queryText, currentDateTime);
    const text = await provider.generateText(TIME_RANGE_SYSTEM_PROMPT, userPrompt, apiKey, model);

    let cleaned = text.trim();
    const codeBlockMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
    if (codeBlockMatch) {
      cleaned = codeBlockMatch[1].trim();
    }

    const result = JSON.parse(cleaned) as QueryTimeRange;
    if (result.start_date && result.end_date) {
      return result;
    }
  } catch {
    // fallback to current month
  }

  return { start_date: defaultStart, end_date: defaultEnd };
}

async function matchTransactions(
  queryText: string,
  transactions: TransactionSummaryForQuery[],
  persona: Persona,
  apiKey: string,
  provider: ReturnType<typeof getProvider>,
  targetLanguage?: string,
  model?: string
): Promise<QueryMatchResult> {
  const systemPrompt = buildTransactionMatchSystemPrompt(persona, targetLanguage);
  const userPrompt = buildTransactionMatchUserPrompt(queryText, transactions);

  try {
    const text = await provider.generateText(systemPrompt, userPrompt, apiKey, model);

    let cleaned = text.trim();
    const codeBlockMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
    if (codeBlockMatch) {
      cleaned = codeBlockMatch[1].trim();
    }

    const result = JSON.parse(cleaned) as QueryMatchResult;

    // 驗證 matched_ids 皆為有效的交易 ID
    const validIds = new Set(transactions.map((t) => t.id));
    result.matched_ids = result.matched_ids.filter((id) => validIds.has(id));

    return {
      matched_ids: result.matched_ids,
      total_amount: result.total_amount || 0,
      summary_text: result.summary_text || '查詢完成。',
      emotion_tag: result.emotion_tag || 'neutral',
    };
  } catch (err) {
    console.error('[matchTransactions] Error:', err instanceof Error ? err.message : err);
    return {
      matched_ids: [],
      total_amount: 0,
      summary_text: '查詢處理時發生問題，請稍後再試。',
      emotion_tag: 'neutral',
    };
  }
}

export async function validateApiKey(
  userId: string,
  apiKey: string,
  overrideEngine?: AIEngine,
  model?: string
): Promise<{ valid: boolean; engine: AIEngine; model?: string; errorType?: string }> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw createI18nError('user_not_found', 404);
  }

  const engine = overrideEngine || (user.aiEngine as AIEngine);
  const provider = getProvider(engine);

  try {
    const result = await provider.validateKey(apiKey, model);
    if (!result.valid) {
      if (result.errorType === 'invalid_model') {
        throw createI18nError('llm_model_invalid', 400);
      }
      throw createI18nError('llm_api_key_invalid', 403);
    }
    return { valid: true, engine, model };
  } catch (err) {
    console.error('[validateApiKey] Raw error:', err);
    if (err instanceof AppError) {
      throw err;
    }
    throw createI18nError('llm_api_key_invalid', 403);
  }
}
