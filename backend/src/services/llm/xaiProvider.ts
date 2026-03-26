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

  protected static override readonly INCLUDE_PATTERNS: RegExp[] = [
    /^grok-/i,
  ];

  protected static override readonly EXCLUDE_PATTERNS: RegExp[] = [
    /embed/i, /image/i,
  ];

  override async listModels(apiKey: string): Promise<ModelInfo[]> {
    try {
      const client = this.getClient(apiKey);
      const response = await client.models.list();
      const models: ModelInfo[] = [];
      const defaults = this.getAvailableModels();
      const defaultMap = new Map(defaults.map((m) => [m.id, m]));

      for await (const model of response) {
        const included = XAIProvider.INCLUDE_PATTERNS.length === 0 || XAIProvider.INCLUDE_PATTERNS.some((p) => p.test(model.id));
        if (included && !XAIProvider.EXCLUDE_PATTERNS.some((p) => p.test(model.id))) {
          const def = defaultMap.get(model.id);
          models.push({
            id: model.id,
            name: def?.name ?? model.id,
            description: def?.description ?? '',
            isDefault: def?.isDefault ?? false,
          });
        }
      }

      models.sort((a, b) => {
        if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
        if (defaultMap.has(a.id) !== defaultMap.has(b.id)) return defaultMap.has(a.id) ? -1 : 1;
        return a.id.localeCompare(b.id);
      });

      return models.length > 0 ? models : this.getAvailableModels();
    } catch {
      return this.getAvailableModels();
    }
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
