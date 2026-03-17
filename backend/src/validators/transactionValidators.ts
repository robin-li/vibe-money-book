import { z } from 'zod';

export const createTransactionSchema = z.object({
  amount: z
    .number({ error: '金額為必填' })
    .positive('金額必須為正數'),
  category: z
    .string({ error: '類別為必填' })
    .min(1, '類別不可為空'),
  merchant: z
    .string()
    .max(100, '商家名稱最多 100 個字元')
    .optional(),
  raw_text: z
    .string({ error: '原始文字為必填' })
    .min(1, '原始文字不可為空')
    .max(500, '原始文字不可超過 500 字元'),
  transaction_date: z
    .string({ error: '交易日期為必填' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式須為 YYYY-MM-DD'),
  note: z
    .string()
    .max(500, '備註不可超過 500 字元')
    .optional(),
  feedback: z
    .object({
      text: z.string(),
      emotion_tag: z.string(),
      persona_used: z.enum(['sarcastic', 'gentle', 'guilt_trip']),
    })
    .optional(),
});

export const listTransactionsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  category: z.string().optional(),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式須為 YYYY-MM-DD')
    .optional(),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式須為 YYYY-MM-DD')
    .optional(),
  sort: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type ListTransactionsInput = z.infer<typeof listTransactionsSchema>;
