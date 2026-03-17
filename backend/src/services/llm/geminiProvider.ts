import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMProvider } from './llmProvider';
import { ParsedTransaction, AIFeedbackContent } from '../../types/llm';
import { AppError } from '../../middlewares/errorHandler';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash-lite';
const TIMEOUT_MS = 3000;
const MAX_RETRIES = 2;

export class GeminiProvider implements LLMProvider {
  private async callWithRetry(
    apiKey: string,
    systemPrompt: string,
    userPrompt: string,
    temperature: number,
    maxTokens: number
  ): Promise<string> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
      systemInstruction: systemPrompt,
    });

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        });

        clearTimeout(timeout);
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
    if (message.includes('API_KEY_INVALID') || message.includes('PERMISSION_DENIED')) {
      throw new AppError('Gemini API Key 無效，請確認您的 API Key', 403);
    }
    if (message.includes('RESOURCE_EXHAUSTED') || message.includes('quota')) {
      throw new AppError('Gemini API 額度已用盡，請檢查您的配額或切換引擎', 403);
    }
    throw new AppError('LLM 服務暫時不可用，請稍後再試', 502);
  }

  async extractData(prompt: string, apiKey: string): Promise<ParsedTransaction> {
    const systemPrompt = '你是一個精確的記帳資料萃取引擎。你只能回傳 JSON 格式的結果，不能包含任何其他文字。';
    const text = await this.callWithRetry(apiKey, systemPrompt, prompt, 0, 200);
    return this.parseJSON<ParsedTransaction>(text);
  }

  async generateFeedback(prompt: string, apiKey: string): Promise<AIFeedbackContent> {
    // The persona system prompt is embedded in the prompt parameter
    const parts = prompt.split('\n---SYSTEM---\n');
    const systemPrompt = parts.length > 1 ? parts[0] : '';
    const userPrompt = parts.length > 1 ? parts[1] : prompt;
    const text = await this.callWithRetry(apiKey, systemPrompt, userPrompt, 0.8, 150);
    return this.parseJSON<AIFeedbackContent>(text);
  }

  private parseJSON<T>(text: string): T {
    // Strip markdown code blocks if present
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
