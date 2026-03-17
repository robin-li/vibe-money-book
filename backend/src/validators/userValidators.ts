import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, '名稱至少 2 個字元')
    .max(50, '名稱最多 50 個字元')
    .optional(),
  persona: z
    .enum(['sarcastic', 'gentle', 'guilt_trip'], {
      error: '人設必須為 sarcastic、gentle 或 guilt_trip',
    })
    .optional(),
  ai_engine: z
    .enum(['gemini', 'openai'], {
      error: 'AI 引擎必須為 gemini 或 openai',
    })
    .optional(),
  monthly_budget: z
    .number()
    .min(0, '月預算不可為負數')
    .max(10000000, '月預算不可超過 10,000,000')
    .optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: '至少需提供一個欄位進行更新' }
);

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
