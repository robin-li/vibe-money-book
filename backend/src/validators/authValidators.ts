import { z } from 'zod';

export const registerSchema = z.object({
  name: z
    .string({ error: '名稱為必填' })
    .min(2, '名稱至少 2 個字元')
    .max(50, '名稱最多 50 個字元'),
  email: z
    .string({ error: 'Email 為必填' })
    .email('Email 格式不正確'),
  password: z
    .string({ error: '密碼為必填' })
    .min(8, '密碼至少 8 個字元')
    .max(100, '密碼最多 100 個字元'),
});

export const loginSchema = z.object({
  email: z
    .string({ error: 'Email 為必填' })
    .email('Email 格式不正確'),
  password: z
    .string({ error: '密碼為必填' }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
