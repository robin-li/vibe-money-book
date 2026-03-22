import prisma from '../config/database';
import { createI18nError } from '../middlewares/errorHandler';
import { CreateTransactionInput, ListTransactionsInput } from '../validators/transactionValidators';

export async function createTransaction(userId: string, input: CreateTransactionInput) {
  const transactionData: {
    userId: string;
    type: string;
    amount: number;
    category: string;
    merchant: string | undefined;
    rawText: string;
    note: string | undefined;
    transactionDate: Date;
    aiFeedback?: {
      create: {
        userId: string;
        feedbackText: string;
        emotionTag: string;
        personaUsed: string;
      };
    };
  } = {
    userId,
    type: input.type ?? 'expense',
    amount: input.amount,
    category: input.category,
    merchant: input.merchant || undefined,
    rawText: input.raw_text,
    note: input.note || undefined,
    transactionDate: new Date(input.transaction_date),
  };

  // If feedback is provided, create AIFeedback record alongside
  if (input.feedback) {
    transactionData.aiFeedback = {
      create: {
        userId,
        feedbackText: input.feedback.text,
        emotionTag: input.feedback.emotion_tag,
        personaUsed: input.feedback.persona_used,
      },
    };
  }

  const transaction = await prisma.transaction.create({
    data: transactionData,
    include: { aiFeedback: true },
  });

  return formatTransaction(transaction);
}

export async function listTransactions(userId: string, input: ListTransactionsInput) {
  const where: Record<string, unknown> = { userId };

  if (input.category) {
    where.category = input.category;
  }

  if (input.start_date || input.end_date) {
    const dateFilter: Record<string, Date> = {};
    if (input.start_date) dateFilter.gte = new Date(input.start_date);
    if (input.end_date) dateFilter.lte = new Date(input.end_date);
    where.transactionDate = dateFilter;
  }

  const [total, items] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      orderBy: { transactionDate: input.sort },
      skip: (input.page - 1) * input.limit,
      take: input.limit,
    }),
  ]);

  return {
    items: items.map(formatTransactionListItem),
    pagination: {
      total,
      page: input.page,
      limit: input.limit,
      pages: Math.ceil(total / input.limit),
    },
  };
}

export async function getTransaction(userId: string, id: string) {
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: { aiFeedback: true },
  });

  if (!transaction) {
    throw createI18nError('transaction_not_found', 404);
  }

  if (transaction.userId !== userId) {
    throw createI18nError('transaction_not_found', 404);
  }

  return formatTransactionDetail(transaction);
}

export async function updateTransaction(
  userId: string,
  id: string,
  input: { type?: string; amount?: number; category?: string; merchant?: string; transaction_date?: string; note?: string }
) {
  const transaction = await prisma.transaction.findUnique({ where: { id } });
  if (!transaction) throw createI18nError('transaction_not_found', 404);
  if (transaction.userId !== userId) throw createI18nError('transaction_not_found', 404);

  const data: Record<string, unknown> = {};
  if (input.type !== undefined) data.type = input.type;
  if (input.amount !== undefined) data.amount = input.amount;
  if (input.category !== undefined) data.category = input.category;
  if (input.merchant !== undefined) data.merchant = input.merchant;
  if (input.transaction_date !== undefined) data.transactionDate = new Date(input.transaction_date);
  if (input.note !== undefined) data.note = input.note;

  const updated = await prisma.transaction.update({
    where: { id },
    data,
    include: { aiFeedback: true },
  });

  return formatTransaction(updated);
}

export async function deleteTransaction(userId: string, id: string) {
  const transaction = await prisma.transaction.findUnique({
    where: { id },
  });

  if (!transaction) {
    throw createI18nError('transaction_not_found', 404);
  }

  if (transaction.userId !== userId) {
    throw createI18nError('transaction_not_found', 404);
  }

  await prisma.transaction.delete({ where: { id } });
}

// ─── Formatters ────────────────────────────────────────────────

function formatTransaction(t: {
  id: string;
  type: string;
  amount: unknown;
  category: string;
  merchant: string | null;
  rawText: string;
  note: string | null;
  transactionDate: Date;
  createdAt: Date;
  updatedAt: Date;
  aiFeedback?: {
    id: string;
    feedbackText: string;
    emotionTag: string | null;
    personaUsed: string;
    createdAt: Date;
  } | null;
}) {
  return {
    transaction: {
      id: t.id,
      type: t.type,
      amount: Number(t.amount),
      category: t.category,
      merchant: t.merchant,
      raw_text: t.rawText,
      note: t.note,
      transaction_date: t.transactionDate.toISOString().split('T')[0],
      created_at: t.createdAt.toISOString(),
      updated_at: t.updatedAt.toISOString(),
    },
    feedback: t.aiFeedback
      ? {
          id: t.aiFeedback.id,
          feedback_text: t.aiFeedback.feedbackText,
          emotion_tag: t.aiFeedback.emotionTag,
          persona_used: t.aiFeedback.personaUsed,
          created_at: t.aiFeedback.createdAt.toISOString(),
        }
      : null,
  };
}

function formatTransactionListItem(t: {
  id: string;
  type: string;
  amount: unknown;
  category: string;
  merchant: string | null;
  note: string | null;
  transactionDate: Date;
  createdAt: Date;
}) {
  return {
    id: t.id,
    type: t.type,
    amount: Number(t.amount),
    category: t.category,
    merchant: t.merchant,
    note: t.note,
    transaction_date: t.transactionDate.toISOString().split('T')[0],
    created_at: t.createdAt.toISOString(),
  };
}

function formatTransactionDetail(t: {
  id: string;
  type: string;
  amount: unknown;
  category: string;
  merchant: string | null;
  rawText: string;
  note: string | null;
  transactionDate: Date;
  createdAt: Date;
  aiFeedback?: {
    feedbackText: string;
    emotionTag: string | null;
    personaUsed: string;
  } | null;
}) {
  return {
    id: t.id,
    type: t.type,
    amount: Number(t.amount),
    category: t.category,
    merchant: t.merchant,
    raw_text: t.rawText,
    note: t.note,
    transaction_date: t.transactionDate.toISOString().split('T')[0],
    created_at: t.createdAt.toISOString(),
    feedback: t.aiFeedback
      ? {
          feedback_text: t.aiFeedback.feedbackText,
          emotion_tag: t.aiFeedback.emotionTag,
          persona_used: t.aiFeedback.personaUsed,
        }
      : null,
  };
}
