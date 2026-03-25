import { ParsedTransaction, AIFeedbackContent, ModelInfo } from '../../types/llm';

export interface LLMProvider {
  extractData(prompt: string, apiKey: string, model?: string): Promise<ParsedTransaction>;
  generateFeedback(prompt: string, apiKey: string, model?: string): Promise<AIFeedbackContent>;
  generateText(systemPrompt: string, userPrompt: string, apiKey: string, model?: string): Promise<string>;
  getAvailableModels(): ModelInfo[];
  validateKey(apiKey: string): Promise<boolean>;
}
