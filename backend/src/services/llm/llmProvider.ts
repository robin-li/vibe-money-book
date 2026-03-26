import { ParsedTransaction, AIFeedbackContent, ModelInfo } from '../../types/llm';

export type ValidationErrorType = 'invalid_key' | 'invalid_model';

export interface ValidationResult {
  valid: boolean;
  errorType?: ValidationErrorType;
}

export interface LLMProvider {
  extractData(prompt: string, apiKey: string, model?: string): Promise<ParsedTransaction>;
  generateFeedback(prompt: string, apiKey: string, model?: string): Promise<AIFeedbackContent>;
  generateText(systemPrompt: string, userPrompt: string, apiKey: string, model?: string): Promise<string>;
  getAvailableModels(): ModelInfo[];
  /** Fetch models dynamically from provider API. Falls back to getAvailableModels() on failure. */
  listModels(apiKey: string): Promise<ModelInfo[]>;
  validateKey(apiKey: string, model?: string): Promise<ValidationResult>;
}
