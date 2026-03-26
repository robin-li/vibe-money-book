import { ParsedTransaction, AIFeedbackContent, ModelInfo } from '../../types/llm';

export interface LLMProvider {
  extractData(prompt: string, apiKey: string, model?: string): Promise<ParsedTransaction>;
  generateFeedback(prompt: string, apiKey: string, model?: string): Promise<AIFeedbackContent>;
  generateText(systemPrompt: string, userPrompt: string, apiKey: string, model?: string): Promise<string>;
  getAvailableModels(): ModelInfo[];
  /** Fetch models dynamically from provider API. Falls back to getAvailableModels() on failure. */
  listModels(apiKey: string): Promise<ModelInfo[]>;
  validateKey(apiKey: string): Promise<boolean>;
}
