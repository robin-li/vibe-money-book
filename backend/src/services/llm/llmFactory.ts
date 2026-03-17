import { AIEngine } from '../../types/llm';
import { LLMProvider } from './llmProvider';
import { GeminiProvider } from './geminiProvider';
import { OpenAIProvider } from './openaiProvider';

const providers: Record<AIEngine, LLMProvider> = {
  gemini: new GeminiProvider(),
  openai: new OpenAIProvider(),
};

export function getProvider(engine: AIEngine): LLMProvider {
  return providers[engine];
}
