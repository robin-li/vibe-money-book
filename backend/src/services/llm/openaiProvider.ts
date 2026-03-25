import OpenAI from 'openai';
import { LLMProvider } from './llmProvider';
import { ParsedTransaction, AIFeedbackContent, ModelInfo } from '../../types/llm';
import { DATA_EXTRACTOR_SYSTEM_PROMPT } from '../../prompts/dataExtractorPrompt';
import { createI18nError } from '../../middlewares/errorHandler';

const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-5.4-mini';
const TIMEOUT_MS = Number(process.env.LLM_TIMEOUT_MS) || 10000;
const MAX_RETRIES = 2;

export class OpenAIProvider implements LLMProvider {
  protected getClient(apiKey: string): OpenAI {
    return new OpenAI({ apiKey, timeout: TIMEOUT_MS });
  }

  protected getDefaultModel(): string {
    return OPENAI_MODEL;
  }

  protected getProviderName(): string {
    return 'OpenAI';
  }

  protected getErrorPrefix(): string {
    return '[OpenAI Error]';
  }

  protected handleApiError(message: string): never {
    if (message.includes('Incorrect API key') || message.includes('invalid_api_key')) {
      throw createI18nError('openai_api_key_invalid', 403);
    }
    if (message.includes('Rate limit') || message.includes('quota')) {
      throw createI18nError('openai_quota_exhausted', 403);
    }
    throw createI18nError('llm_service_unavailable', 502);
  }

  protected async callWithRetry(
    apiKey: string,
    systemPrompt: string,
    userPrompt: string,
    temperature: number,
    maxTokens: number,
    model?: string
  ): Promise<string> {
    const client = this.getClient(apiKey);

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await client.chat.completions.create({
          model: model || this.getDefaultModel(),
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature,
          max_completion_tokens: maxTokens,
        });

        const text = response.choices[0]?.message?.content;
        if (!text) {
          throw new Error(`${this.getProviderName()} 回傳空結果`);
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
    console.error(this.getErrorPrefix(), message, lastError);
    this.handleApiError(message);
  }

  async extractData(prompt: string, apiKey: string, model?: string): Promise<ParsedTransaction> {
    const text = await this.callWithRetry(apiKey, DATA_EXTRACTOR_SYSTEM_PROMPT, prompt, 0, 200, model);
    return this.parseJSON<ParsedTransaction>(text);
  }

  async generateFeedback(prompt: string, apiKey: string, model?: string): Promise<AIFeedbackContent> {
    const parts = prompt.split('\n---SYSTEM---\n');
    const systemPrompt = parts.length > 1 ? parts[0] : '';
    const userPrompt = parts.length > 1 ? parts[1] : prompt;
    const text = await this.callWithRetry(apiKey, systemPrompt, userPrompt, 0.8, 150, model);
    return this.parseJSON<AIFeedbackContent>(text);
  }

  async generateText(systemPrompt: string, userPrompt: string, apiKey: string, model?: string): Promise<string> {
    return this.callWithRetry(apiKey, systemPrompt, userPrompt, 0, 1024, model);
  }

  getAvailableModels(): ModelInfo[] {
    return [
      {
        id: 'gpt-5.4-mini',
        name: 'GPT-5.4 Mini',
        description: 'Fast and cost-effective model',
        isDefault: true,
      },
      {
        id: 'gpt-4.1',
        name: 'GPT-4.1',
        description: 'Advanced model with strong reasoning',
        isDefault: false,
      },
    ];
  }

  async validateKey(apiKey: string): Promise<boolean> {
    try {
      const client = this.getClient(apiKey);
      await client.chat.completions.create({
        model: this.getDefaultModel(),
        messages: [{ role: 'user', content: 'test' }],
        max_completion_tokens: 5,
      });
      return true;
    } catch {
      return false;
    }
  }

  protected parseJSON<T>(text: string): T {
    let cleaned = text.trim();

    // Strip thinking tags
    cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    // Strip markdown code blocks anywhere in the text (not just at start)
    const codeBlockMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
    if (codeBlockMatch) {
      cleaned = codeBlockMatch[1].trim();
    }

    try {
      return JSON.parse(cleaned) as T;
    } catch {
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
