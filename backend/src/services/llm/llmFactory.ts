import { AIEngine } from '../../types/llm';
import { LLMProvider } from './llmProvider';
import { GeminiProvider } from './geminiProvider';
import { OpenAIProvider } from './openaiProvider';
import { AnthropicProvider } from './anthropicProvider';
import { XAIProvider } from './xaiProvider';

const providers: Record<AIEngine, LLMProvider> = {
  gemini: new GeminiProvider(),
  openai: new OpenAIProvider(),
  anthropic: new AnthropicProvider(),
  xai: new XAIProvider(),
};

export function getProvider(engine: AIEngine): LLMProvider {
  return providers[engine];
}

export function getAllProviders(): Record<AIEngine, LLMProvider> {
  return providers;
}
