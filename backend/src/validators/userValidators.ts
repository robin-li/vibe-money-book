import { z } from 'zod';

export const SUPPORTED_LANGUAGES = ['zh-TW', 'en', 'zh-CN', 'vi'] as const;

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
    .enum(['gemini', 'openai', 'anthropic', 'xai'], {
      error: 'AI 引擎必須為 gemini、openai、anthropic 或 xai',
    })
    .optional(),
  ai_model: z
    .string()
    .max(100, 'AI 模型名稱最多 100 個字元')
    .nullable()
    .optional(),
  monthly_budget: z
    .number()
    .min(0, '月預算不可為負數')
    .max(10000000, '月預算不可超過 10,000,000')
    .optional(),
  ai_instructions: z
    .string()
    .max(1000, 'AI 指示最多 1000 個字元')
    .nullable()
    .optional(),
  language: z
    .enum(SUPPORTED_LANGUAGES, {
      error: '語言必須為 zh-TW、en、zh-CN 或 vi',
    })
    .optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: '至少需提供一個欄位進行更新' }
);

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
