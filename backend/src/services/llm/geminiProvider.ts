import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMProvider } from './llmProvider';
import { ParsedTransaction, AIFeedbackContent } from '../../types/llm';
import { DATA_EXTRACTOR_SYSTEM_PROMPT } from '../../prompts/dataExtractorPrompt';
import { AppError } from '../../middlewares/errorHandler';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const TIMEOUT_MS = Number(process.env.LLM_TIMEOUT_MS) || 10000;
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
        const generatePromise = model.generateContent({
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
    if (message.includes('API_KEY_INVALID') || message.includes('PERMISSION_DENIED')) {
      throw new AppError('Gemini API Key 無效，請確認您的 API Key', 403);
    }
    if (message.includes('RESOURCE_EXHAUSTED') || message.includes('quota')) {
      throw new AppError('Gemini API 額度已用盡，請檢查您的配額或切換引擎', 403);
    }
    throw new AppError('LLM 服務暫時不可用，請稍後再試', 502);
  }

  async extractData(prompt: string, apiKey: string): Promise<ParsedTransaction> {
    const text = await this.callWithRetry(apiKey, DATA_EXTRACTOR_SYSTEM_PROMPT, prompt, 0, 2048);
    return this.parseJSON<ParsedTransaction>(text);
  }

  async generateFeedback(prompt: string, apiKey: string): Promise<AIFeedbackContent> {
    // The persona system prompt is embedded in the prompt parameter
    const parts = prompt.split('\n---SYSTEM---\n');
    const systemPrompt = parts.length > 1 ? parts[0] : '';
    const userPrompt = parts.length > 1 ? parts[1] : prompt;
    const text = await this.callWithRetry(apiKey, systemPrompt, userPrompt, 0.8, 1024);
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
