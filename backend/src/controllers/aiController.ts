import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { aiParseSchema, aiQuerySchema } from '../validators/aiValidators';
import * as llmService from '../services/llmService';
import { AppError } from '../middlewares/errorHandler';
import { ApiResponse } from '../types';
import { ZodError } from 'zod';
import prisma from '../config/database';

function formatZodErrors(error: ZodError) {
  return error.issues.map((issue) => ({
    field: issue.path.join('.'),
    reason: issue.message,
  }));
}

function getDefaultApiKey(engine: string): string | undefined {
  if (engine === 'gemini') return process.env.DEFAULT_GEMINI_API_KEY;
  if (engine === 'openai') return process.env.DEFAULT_OPENAI_API_KEY;
  return undefined;
}

async function extractApiKey(req: AuthRequest): Promise<string> {
  const apiKey = req.headers['x-llm-api-key'] as string | undefined;
  if (apiKey) return apiKey;

  // Fallback: 使用環境變數中的預設 API Key
  const userId = req.userId!;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { aiEngine: true } });
  const engine = user?.aiEngine ?? 'gemini';
  const defaultKey = getDefaultApiKey(engine);
  if (defaultKey) return defaultKey;

  throw new AppError('請提供 LLM API Key（X-LLM-API-Key Header）', 400);
}

export async function aiParse(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = aiParseSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError('參數驗證失敗', 400, formatZodErrors(parsed.error));
    }

    const apiKey = await extractApiKey(req);
    const userId = req.userId!;

    const result = await llmService.parseTransaction(userId, parsed.data.raw_text, apiKey);

    const response: ApiResponse<typeof result> = {
      code: 200,
      message: result.intent === 'chat' ? '對話回覆成功' : '解析成功',
      data: result,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function validateKey(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const apiKey = await extractApiKey(req);
    const userId = req.userId!;

    const result = await llmService.validateApiKey(userId, apiKey);

    const response: ApiResponse<typeof result> = {
      code: 200,
      message: '驗證成功',
      data: result,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function aiQuery(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = aiQuerySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError('參數驗證失敗', 400, formatZodErrors(parsed.error));
    }

    const apiKey = await extractApiKey(req);
    const userId = req.userId!;

    const result = await llmService.queryTransactions(userId, parsed.data.query_text, apiKey);

    const response: ApiResponse<typeof result> = {
      code: 200,
      message: '查詢成功',
      data: result,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function getAIConfig(
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const response: ApiResponse<{ hasDefaultKey: Record<string, boolean> }> = {
      code: 200,
      message: '取得 AI 配置',
      data: {
        hasDefaultKey: {
          gemini: !!process.env.DEFAULT_GEMINI_API_KEY,
          openai: !!process.env.DEFAULT_OPENAI_API_KEY,
        },
      },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}
