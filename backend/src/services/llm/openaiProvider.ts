import OpenAI from 'openai';
import { LLMProvider } from './llmProvider';
import { ParsedTransaction, AIFeedbackContent } from '../../types/llm';
import { DATA_EXTRACTOR_SYSTEM_PROMPT } from '../../prompts/dataExtractorPrompt';
import { AppError } from '../../middlewares/errorHandler';

const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const TIMEOUT_MS = 3000;
const MAX_RETRIES = 2;

export class OpenAIProvider implements LLMProvider {
  private async callWithRetry(
    apiKey: string,
    systemPrompt: string,
    userPrompt: string,
    temperature: number,
    maxTokens: number
  ): Promise<string> {
    const client = new OpenAI({ apiKey, timeout: TIMEOUT_MS });

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await client.chat.completions.create({
          model: OPENAI_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature,
          max_tokens: maxTokens,
        });

        const text = response.choices[0]?.message?.content;
        if (!text) {
          throw new Error('OpenAI 回傳空結果');
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
    if (message.includes('Incorrect API key') || message.includes('invalid_api_key')) {
      throw new AppError('OpenAI API Key 無效，請確認您的 API Key', 403);
    }
    if (message.includes('Rate limit') || message.includes('quota')) {
      throw new AppError('OpenAI API 額度已用盡，請檢查您的配額或切換引擎', 403);
    }
    throw new AppError('LLM 服務暫時不可用，請稍後再試', 502);
  }

  async extractData(prompt: string, apiKey: string): Promise<ParsedTransaction> {
    const text = await this.callWithRetry(apiKey, DATA_EXTRACTOR_SYSTEM_PROMPT, prompt, 0, 200);
    return this.parseJSON<ParsedTransaction>(text);
  }

  async generateFeedback(prompt: string, apiKey: string): Promise<AIFeedbackContent> {
    const parts = prompt.split('\n---SYSTEM---\n');
    const systemPrompt = parts.length > 1 ? parts[0] : '';
    const userPrompt = parts.length > 1 ? parts[1] : prompt;
    const text = await this.callWithRetry(apiKey, systemPrompt, userPrompt, 0.8, 150);
    return this.parseJSON<AIFeedbackContent>(text);
  }

  private parseJSON<T>(text: string): T {
    let cleaned = text.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }
    try {
      return JSON.parse(cleaned) as T;
    } catch {
      throw new AppError('LLM 回傳格式異常，無法解析', 502);
    }
  }
}
