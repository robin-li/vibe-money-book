import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMProvider, ValidationResult } from './llmProvider';
import { ParsedTransaction, AIFeedbackContent, ModelInfo } from '../../types/llm';
import { DATA_EXTRACTOR_SYSTEM_PROMPT } from '../../prompts/dataExtractorPrompt';
import { createI18nError } from '../../middlewares/errorHandler';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';
const TIMEOUT_MS = Number(process.env.LLM_TIMEOUT_MS) || 30000;
const MAX_RETRIES = 2;

export class GeminiProvider implements LLMProvider {
  private async callWithRetry(
    apiKey: string,
    systemPrompt: string,
    userPrompt: string,
    temperature: number,
    maxTokens: number,
    responseMimeType?: string,
    model?: string
  ): Promise<string> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const generationConfig: Record<string, unknown> = {
      temperature,
      maxOutputTokens: maxTokens,
      // Disable thinking to reduce latency and token usage
      thinkingConfig: { thinkingBudget: 0 },
    };
    if (responseMimeType) {
      generationConfig.responseMimeType = responseMimeType;
    }
    const genModel = genAI.getGenerativeModel({
      model: model || GEMINI_MODEL,
      generationConfig,
      systemInstruction: systemPrompt,
    });

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const generatePromise = genModel.generateContent({
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API timeout')), TIMEOUT_MS)
        );

        const result = await Promise.race([generatePromise, timeoutPromise]);

        const text = result.response.text();
        if (!text) {
          throw new Error('Gemini 回傳空結果');
        }
        return text;
      } catch (err) {
        lastError = err as Error;
        if (attempt < MAX_RETRIES) {
          continue;
        }
      }
    }

    const message = lastError?.message || '';
    console.error('[Gemini Error]', message, lastError);
    if (message.includes('API_KEY_INVALID') || message.includes('PERMISSION_DENIED')) {
      throw createI18nError('gemini_api_key_invalid', 403);
    }
    if (message.includes('RESOURCE_EXHAUSTED') || message.includes('quota')) {
      throw createI18nError('gemini_quota_exhausted', 403);
    }
    throw createI18nError('llm_service_unavailable', 502);
  }

  async extractData(prompt: string, apiKey: string, model?: string): Promise<ParsedTransaction> {
    const text = await this.callWithRetry(apiKey, DATA_EXTRACTOR_SYSTEM_PROMPT, prompt, 0, 2048, 'application/json', model);
    return this.parseJSON<ParsedTransaction>(text);
  }

  async generateFeedback(prompt: string, apiKey: string, model?: string): Promise<AIFeedbackContent> {
    // The persona system prompt is embedded in the prompt parameter
    const parts = prompt.split('\n---SYSTEM---\n');
    const systemPrompt = parts.length > 1 ? parts[0] : '';
    const userPrompt = parts.length > 1 ? parts[1] : prompt;
    const text = await this.callWithRetry(apiKey, systemPrompt, userPrompt, 0.8, 4096, 'application/json', model);
    return this.parseJSON<AIFeedbackContent>(text);
  }

  async generateText(systemPrompt: string, userPrompt: string, apiKey: string, model?: string): Promise<string> {
    return this.callWithRetry(apiKey, systemPrompt, userPrompt, 0, 1024, 'application/json', model);
  }

  private static readonly EXCLUDE_PATTERNS = [
    /embedding/i, /aqa/i, /imagen/i, /veo/i, /chirp/i, /codec/i,
    /text-bison/i, /chat-bison/i, /gemma/i, /learnlm/i,
    /nano/i, /tts/i, /robotics/i, /lyria/i, /computer.?use/i,
    /deep.?research/i, /custom.?tools/i,
  ];

  async listModels(apiKey: string): Promise<ModelInfo[]> {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
        { signal: AbortSignal.timeout(10000) }
      );
      if (!res.ok) return this.getAvailableModels();
      const data = await res.json() as { models?: Array<{ name: string; displayName: string; description?: string; supportedGenerationMethods?: string[] }> };
      if (!data.models) return this.getAvailableModels();

      const defaults = this.getAvailableModels();
      const defaultMap = new Map(defaults.map((m) => [m.id, m]));

      const models: ModelInfo[] = data.models
        .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
        .map((m) => {
          const id = m.name.replace('models/', '');
          const def = defaultMap.get(id);
          return {
            id,
            name: def?.name ?? m.displayName,
            description: def?.description ?? (m.description?.substring(0, 80) ?? ''),
            isDefault: def?.isDefault ?? false,
          };
        })
        .filter((m) => !GeminiProvider.EXCLUDE_PATTERNS.some((p) => p.test(m.id)));

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

  getAvailableModels(): ModelInfo[] {
    return [
      {
        id: 'gemini-3-flash-preview',
        name: 'Gemini 3 Flash',
        description: 'Fast and efficient model for everyday tasks',
        isDefault: true,
      },
      {
        id: 'gemini-2.5-pro-preview-05-06',
        name: 'Gemini 2.5 Pro',
        description: 'Advanced model with stronger reasoning capabilities',
        isDefault: false,
      },
    ];
  }

  async validateKey(apiKey: string, model?: string): Promise<ValidationResult> {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const genModel = genAI.getGenerativeModel({ model: model || GEMINI_MODEL });
      await genModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: 'test' }] }],
      });
      return { valid: true };
    } catch (err: unknown) {
      const message = (err as Error)?.message ?? '';
      if (message.includes('API_KEY_INVALID') || message.includes('PERMISSION_DENIED')) {
        return { valid: false, errorType: 'invalid_key' };
      }
      if (message.includes('NOT_FOUND') || message.includes('not found') || message.includes('is not supported')) {
        return { valid: false, errorType: 'invalid_model' };
      }
      return { valid: false, errorType: 'invalid_key' };
    }
  }

  private parseJSON<T>(text: string): T {
    let cleaned = text.trim();

    // Strip thinking tags (e.g. <think>...</think>)
    cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    // Strip markdown code blocks anywhere in the text (not just at start)
    const codeBlockMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
    if (codeBlockMatch) {
      cleaned = codeBlockMatch[1].trim();
    }

    // Try direct parse first
    try {
      return JSON.parse(cleaned) as T;
    } catch {
      // Fallback: extract first JSON object from text
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          return JSON.parse(match[0]) as T;
        } catch {
          // fall through
        }
      }
      throw createI18nError('llm_parse_error', 502);
    }
  }
}
