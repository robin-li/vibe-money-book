import { ParsedTransaction, AIFeedbackContent } from '../../types/llm';

export interface LLMProvider {
  extractData(prompt: string, apiKey: string): Promise<ParsedTransaction>;
  generateFeedback(prompt: string, apiKey: string): Promise<AIFeedbackContent>;
  generateText(systemPrompt: string, userPrompt: string, apiKey: string): Promise<string>;
}
