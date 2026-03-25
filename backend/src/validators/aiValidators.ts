import { z } from 'zod';

export const aiParseSchema = z.object({
  raw_text: z
    .string({ error: '請提供輸入文字' })
    .min(1, '輸入文字不可為空')
    .max(500, '輸入文字不可超過 500 字元'),
});

export type AIParseInput = z.infer<typeof aiParseSchema>;

export const aiQuerySchema = z.object({
  query_text: z
    .string({ error: '請提供查詢文字' })
    .min(1, '查詢文字不可為空')
    .max(500, '查詢文字不可超過 500 字元'),
});

export type AIQueryInput = z.infer<typeof aiQuerySchema>;

export const aiValidateKeySchema = z.object({
  engine: z
    .enum(['gemini', 'openai', 'anthropic', 'xai'], {
      error: 'AI 引擎必須為 gemini、openai、anthropic 或 xai',
    })
    .optional(),
  model: z
    .string()
    .max(100, 'AI 模型名稱最多 100 個字元')
    .optional(),
}).optional().default({});

export type AIValidateKeyInput = z.infer<typeof aiValidateKeySchema>;
