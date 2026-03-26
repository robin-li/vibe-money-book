import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { aiParseSchema, aiQuerySchema, aiValidateKeySchema } from '../validators/aiValidators';
import * as llmService from '../services/llmService';
import { createI18nError } from '../middlewares/errorHandler';
import { ApiResponse } from '../types';
import { t } from '../i18n';
import { ZodError } from 'zod';
import prisma from '../config/database';
import { AIEngine } from '../types/llm';
import { getAllProviders, getProvider } from '../services/llm/llmFactory';

function formatZodErrors(error: ZodError) {
  return error.issues.map((issue) => ({
    field: issue.path.join('.'),
    reason: issue.message,
  }));
}

function getDefaultApiKey(engine: string): string | undefined {
  if (engine === 'gemini') return process.env.DEFAULT_GEMINI_API_KEY;
  if (engine === 'openai') return process.env.DEFAULT_OPENAI_API_KEY;
  if (engine === 'anthropic') return process.env.DEFAULT_ANTHROPIC_API_KEY;
  if (engine === 'xai') return process.env.DEFAULT_XAI_API_KEY;
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

  throw createI18nError('llm_api_key_missing', 400);
}

export async function aiParse(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = aiParseSchema.safeParse(req.body);
    if (!parsed.success) {
      throw createI18nError('validation_failed', 400, formatZodErrors(parsed.error));
    }

    const apiKey = await extractApiKey(req);
    const userId = req.userId!;

    const result = await llmService.parseTransaction(userId, parsed.data.raw_text, apiKey);

    const response: ApiResponse<typeof result> = {
      code: 200,
      message: result.intent === 'chat' ? t('chat_reply_success', req.locale) : t('parse_success', req.locale),
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
    const parsed = aiValidateKeySchema.safeParse(req.body);
    if (!parsed.success) {
      throw createI18nError('validation_failed', 400, formatZodErrors(parsed.error));
    }

    const apiKey = await extractApiKey(req);
    const userId = req.userId!;

    const engine = parsed.data?.engine as AIEngine | undefined;
    const model = parsed.data?.model;

    const result = await llmService.validateApiKey(userId, apiKey, engine, model);

    const response: ApiResponse<typeof result> = {
      code: 200,
      message: t('validate_success', req.locale),
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
      throw createI18nError('validation_failed', 400, formatZodErrors(parsed.error));
    }

    const apiKey = await extractApiKey(req);
    const userId = req.userId!;

    const result = await llmService.queryTransactions(userId, parsed.data.query_text, apiKey);

    const response: ApiResponse<typeof result> = {
      code: 200,
      message: t('query_success', req.locale),
      data: result,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function getAIConfig(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const response: ApiResponse<{ hasDefaultKey: Record<string, boolean> }> = {
      code: 200,
      message: t('ai_config_fetched', req.locale),
      data: {
        hasDefaultKey: {
          gemini: !!process.env.DEFAULT_GEMINI_API_KEY,
          openai: !!process.env.DEFAULT_OPENAI_API_KEY,
          anthropic: !!process.env.DEFAULT_ANTHROPIC_API_KEY,
          xai: !!process.env.DEFAULT_XAI_API_KEY,
        },
      },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function getProviders(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const allProviders = getAllProviders();
    const providerNames: Record<AIEngine, string> = {
      gemini: 'Google Gemini',
      openai: 'OpenAI',
      anthropic: 'Anthropic',
      xai: 'xAI',
    };

    const providers = (Object.keys(allProviders) as AIEngine[]).map((code) => ({
      code,
      name: providerNames[code],
      models: allProviders[code].getAvailableModels(),
    }));

    const response: ApiResponse<{ providers: typeof providers }> = {
      code: 200,
      message: 'success',
      data: { providers },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function listModels(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const engine = (req.query.engine as AIEngine) || 'openai';
    const validEngines: AIEngine[] = ['gemini', 'openai', 'anthropic', 'xai'];
    if (!validEngines.includes(engine)) {
      throw createI18nError('validation_failed', 400);
    }

    const provider = getProvider(engine);
    const apiKey = req.headers['x-llm-api-key'] as string | undefined;
    const defaultKey = getDefaultApiKey(engine);
    const effectiveKey = apiKey || defaultKey;

    let models;
    if (effectiveKey) {
      models = await provider.listModels(effectiveKey);
    } else {
      models = provider.getAvailableModels();
    }

    const apiResponse: ApiResponse<{ models: typeof models; dynamic: boolean }> = {
      code: 200,
      message: 'success',
      data: { models, dynamic: !!effectiveKey },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(apiResponse);
  } catch (err) {
    next(err);
  }
}
