import Anthropic from '@anthropic-ai/sdk';
import { LLMProvider } from './llmProvider';
import { ParsedTransaction, AIFeedbackContent, ModelInfo } from '../../types/llm';
import { DATA_EXTRACTOR_SYSTEM_PROMPT } from '../../prompts/dataExtractorPrompt';
import { createI18nError } from '../../middlewares/errorHandler';

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001';
const TIMEOUT_MS = Number(process.env.LLM_TIMEOUT_MS) || 30000;
const MAX_RETRIES = 2;

export class AnthropicProvider implements LLMProvider {
  private async callWithRetry(
    apiKey: string,
    systemPrompt: string,
    userPrompt: string,
    temperature: number,
    maxTokens: number,
    model?: string
  ): Promise<string> {
    const client = new Anthropic({ apiKey, timeout: TIMEOUT_MS });

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await client.messages.create({
          model: model || ANTHROPIC_MODEL,
          max_tokens: maxTokens,
          temperature,
          system: systemPrompt,
          messages: [
            { role: 'user', content: userPrompt },
          ],
        });

        const textBlock = response.content.find((block) => block.type === 'text');
        const text = textBlock && 'text' in textBlock ? textBlock.text : null;
        if (!text) {
          throw new Error('Anthropic 回傳空結果');
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
    console.error('[Anthropic Error]', message, lastError);
    if (message.includes('invalid x-api-key') || message.includes('authentication_error')) {
      throw createI18nError('anthropic_api_key_invalid', 403);
    }
    if (message.includes('rate_limit') || message.includes('overloaded')) {
      throw createI18nError('anthropic_quota_exhausted', 403);
    }
    throw createI18nError('llm_service_unavailable', 502);
  }

  async extractData(prompt: string, apiKey: string, model?: string): Promise<ParsedTransaction> {
    const systemPrompt = DATA_EXTRACTOR_SYSTEM_PROMPT + '\n\nYou MUST respond with valid JSON only. No markdown, no code blocks, no explanation.';
    const text = await this.callWithRetry(apiKey, systemPrompt, prompt, 0, 2048, model);
    return this.parseJSON<ParsedTransaction>(text);
  }

  async generateFeedback(prompt: string, apiKey: string, model?: string): Promise<AIFeedbackContent> {
    const parts = prompt.split('\n---SYSTEM---\n');
    const systemPrompt = parts.length > 1
      ? parts[0] + '\n\nYou MUST respond with valid JSON only. No markdown, no code blocks, no explanation.'
      : 'You MUST respond with valid JSON only.';
    const userPrompt = parts.length > 1 ? parts[1] : prompt;
    const text = await this.callWithRetry(apiKey, systemPrompt, userPrompt, 0.8, 4096, model);
    return this.parseJSON<AIFeedbackContent>(text);
  }

  async generateText(systemPrompt: string, userPrompt: string, apiKey: string, model?: string): Promise<string> {
    const enhancedSystemPrompt = systemPrompt + '\n\nYou MUST respond with valid JSON only. No markdown, no code blocks, no explanation.';
    return this.callWithRetry(apiKey, enhancedSystemPrompt, userPrompt, 0, 1024, model);
  }

  async listModels(_apiKey: string): Promise<ModelInfo[]> {
    // Anthropic does not provide a List Models API
    return this.getAvailableModels();
  }

  getAvailableModels(): ModelInfo[] {
    return [
      {
        id: 'claude-haiku-4-5-20251001',
        name: 'Claude Haiku 4.5',
        description: 'Fast and cost-effective model for everyday tasks',
        isDefault: true,
      },
      {
        id: 'claude-sonnet-4-5-20250514',
        name: 'Claude Sonnet 4.5',
        description: 'Advanced model with strong reasoning and analysis',
        isDefault: false,
      },
    ];
  }

  async validateKey(apiKey: string): Promise<boolean> {
    try {
      const client = new Anthropic({ apiKey, timeout: TIMEOUT_MS });
      await client.messages.create({
        model: ANTHROPIC_MODEL,
        max_tokens: 5,
        messages: [{ role: 'user', content: 'test' }],
      });
      return true;
    } catch {
      return false;
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
