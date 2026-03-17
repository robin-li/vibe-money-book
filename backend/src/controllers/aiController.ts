import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { aiParseSchema } from '../validators/aiValidators';
import * as llmService from '../services/llmService';
import { AppError } from '../middlewares/errorHandler';
import { ApiResponse } from '../types';
import { ZodError } from 'zod';

function formatZodErrors(error: ZodError) {
  return error.issues.map((issue) => ({
    field: issue.path.join('.'),
    reason: issue.message,
  }));
}

function extractApiKey(req: AuthRequest): string {
  const apiKey = req.headers['x-llm-api-key'] as string | undefined;
  if (!apiKey) {
    throw new AppError('請提供 LLM API Key（X-LLM-API-Key Header）', 400);
  }
  return apiKey;
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

    const apiKey = extractApiKey(req);
    const userId = req.userId!;

    const result = await llmService.parseTransaction(userId, parsed.data.raw_text, apiKey);

    const response: ApiResponse<typeof result> = {
      code: 200,
      message: '解析成功',
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
    const apiKey = extractApiKey(req);
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
