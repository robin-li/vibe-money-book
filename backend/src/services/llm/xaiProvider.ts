import OpenAI from 'openai';
import { OpenAIProvider } from './openaiProvider';
import { ModelInfo } from '../../types/llm';
import { createI18nError } from '../../middlewares/errorHandler';

const XAI_MODEL = process.env.XAI_MODEL || 'grok-3-mini-fast';
const TIMEOUT_MS = Number(process.env.LLM_TIMEOUT_MS) || 30000;

export class XAIProvider extends OpenAIProvider {
  protected override getClient(apiKey: string): OpenAI {
    return new OpenAI({
      apiKey,
      baseURL: 'https://api.x.ai/v1',
      timeout: TIMEOUT_MS,
    });
  }

  protected override getDefaultModel(): string {
    return XAI_MODEL;
  }

  protected override getProviderName(): string {
    return 'xAI';
  }

  protected override getErrorPrefix(): string {
    return '[xAI Error]';
  }

  protected override handleApiError(message: string): never {
    if (message.includes('Incorrect API key') || message.includes('invalid_api_key') || message.includes('Unauthorized')) {
      throw createI18nError('xai_api_key_invalid', 403);
    }
    if (message.includes('Rate limit') || message.includes('quota')) {
      throw createI18nError('xai_quota_exhausted', 403);
    }
    throw createI18nError('llm_service_unavailable', 502);
  }

  override getAvailableModels(): ModelInfo[] {
    return [
      {
        id: 'grok-3-mini-fast',
        name: 'Grok 3 Mini Fast',
        description: 'Fastest and most cost-effective xAI model',
        isDefault: true,
      },
      {
        id: 'grok-3-mini',
        name: 'Grok 3 Mini',
        description: 'Balanced xAI model with good reasoning',
        isDefault: false,
      },
      {
        id: 'grok-3',
        name: 'Grok 3',
        description: 'Most capable xAI model',
        isDefault: false,
      },
    ];
  }
}
