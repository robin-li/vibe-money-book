import { describe, it, expect } from 'vitest';
import { getPersonaSystemPrompt, buildPersonaFeedbackPrompt } from '../prompts/personaFeedbackPrompt';
import { getChatPersonaSystemPrompt, buildChatReplyPrompt } from '../prompts/chatReplyPrompt';
import { buildTransactionMatchSystemPrompt, TIME_RANGE_SYSTEM_PROMPT } from '../prompts/queryPrompt';
import { buildDataExtractorPrompt, DATA_EXTRACTOR_SYSTEM_PROMPT } from '../prompts/dataExtractorPrompt';
import { buildIntentDetectorPrompt, INTENT_DETECTOR_SYSTEM_PROMPT } from '../prompts/intentDetectorPrompt';

describe('T-603: AI Prompt i18n', () => {
  describe('personaFeedbackPrompt', () => {
    it('should include zh-TW language instruction by default', () => {
      const prompt = getPersonaSystemPrompt('sarcastic');
      expect(prompt).toContain('繁體中文');
    });

    it('should include English language instruction for "en"', () => {
      const prompt = getPersonaSystemPrompt('sarcastic', 'en');
      expect(prompt).toContain('English');
    });

    it('should include zh-CN language instruction', () => {
      const prompt = getPersonaSystemPrompt('gentle', 'zh-CN');
      expect(prompt).toContain('简体中文');
    });

    it('should include Vietnamese language instruction', () => {
      const prompt = getPersonaSystemPrompt('guilt_trip', 'vi');
      expect(prompt).toContain('Tiếng Việt');
    });

    it('should contain language requirement marker', () => {
      const prompt = getPersonaSystemPrompt('gentle', 'en');
      expect(prompt).toContain('語言要求');
      expect(prompt).toContain('English');
    });

    it('should work with all three personas', () => {
      for (const persona of ['sarcastic', 'gentle', 'guilt_trip']) {
        for (const lang of ['zh-TW', 'en', 'zh-CN', 'vi']) {
          const prompt = getPersonaSystemPrompt(persona, lang);
          expect(prompt.length).toBeGreaterThan(0);
          expect(prompt).toContain('語言要求');
        }
      }
    });
  });

  describe('chatReplyPrompt', () => {
    it('should include zh-TW language instruction by default', () => {
      const prompt = getChatPersonaSystemPrompt('sarcastic');
      expect(prompt).toContain('繁體中文');
    });

    it('should include English language instruction for "en"', () => {
      const prompt = getChatPersonaSystemPrompt('sarcastic', 'en');
      expect(prompt).toContain('English');
    });

    it('should include Vietnamese language instruction for "vi"', () => {
      const prompt = getChatPersonaSystemPrompt('gentle', 'vi');
      expect(prompt).toContain('Tiếng Việt');
    });

    it('should work with all personas and languages', () => {
      for (const persona of ['sarcastic', 'gentle', 'guilt_trip'] as const) {
        for (const lang of ['zh-TW', 'en', 'zh-CN', 'vi']) {
          const prompt = getChatPersonaSystemPrompt(persona, lang);
          expect(prompt.length).toBeGreaterThan(0);
          expect(prompt).toContain('語言要求');
        }
      }
    });
  });

  describe('queryPrompt', () => {
    it('TIME_RANGE_SYSTEM_PROMPT should support multilingual input', () => {
      expect(TIME_RANGE_SYSTEM_PROMPT).toContain('多種語言');
    });

    it('buildTransactionMatchSystemPrompt should include target language for summary_text', () => {
      const prompt = buildTransactionMatchSystemPrompt('sarcastic', 'en');
      expect(prompt).toContain('English');
      expect(prompt).toContain('語言要求');
    });

    it('should default to zh-TW when no targetLanguage', () => {
      const prompt = buildTransactionMatchSystemPrompt('gentle');
      expect(prompt).toContain('繁體中文');
    });

    it('should support Vietnamese target language', () => {
      const prompt = buildTransactionMatchSystemPrompt('guilt_trip', 'vi');
      expect(prompt).toContain('Tiếng Việt');
    });

    it('should support multilingual queries in time range parsing', () => {
      expect(TIME_RANGE_SYSTEM_PROMPT).toContain('英文');
      expect(TIME_RANGE_SYSTEM_PROMPT).toContain('越南文');
    });
  });

  describe('dataExtractorPrompt', () => {
    it('DATA_EXTRACTOR_SYSTEM_PROMPT should mention multi-language understanding', () => {
      expect(DATA_EXTRACTOR_SYSTEM_PROMPT).toContain('多種語言');
    });

    it('buildDataExtractorPrompt should mention multilingual input support', () => {
      const prompt = buildDataExtractorPrompt({
        rawText: 'test',
        categories: ['food', 'transport'],
        currentDateTime: '2026年3月22日 星期日 10:00:00 (GMT+8)',
      });
      expect(prompt).toContain('多種語言');
      expect(prompt).toContain('英文');
      expect(prompt).toContain('越南文');
    });

    it('should include multilingual keywords for income/expense detection', () => {
      const prompt = buildDataExtractorPrompt({
        rawText: 'test',
        categories: ['food'],
        currentDateTime: '2026年3月22日',
      });
      // English keywords
      expect(prompt).toContain('salary');
      expect(prompt).toContain('buy');
      // Vietnamese keywords
      expect(prompt).toContain('lương');
      expect(prompt).toContain('mua');
    });

    it('should support multilingual date expressions', () => {
      const prompt = buildDataExtractorPrompt({
        rawText: 'test',
        categories: ['food'],
        currentDateTime: '2026年3月22日',
      });
      expect(prompt).toContain('yesterday');
      expect(prompt).toContain('hôm qua');
    });
  });

  describe('intentDetectorPrompt', () => {
    it('INTENT_DETECTOR_SYSTEM_PROMPT should mention multi-language understanding', () => {
      expect(INTENT_DETECTOR_SYSTEM_PROMPT).toContain('多種語言');
    });

    it('buildIntentDetectorPrompt should include multilingual examples', () => {
      const prompt = buildIntentDetectorPrompt('test input');
      expect(prompt).toContain('English');
      expect(prompt).toContain('Tiếng Việt');
      // Should contain multilingual examples
      expect(prompt).toContain('Lunch ramen');
      expect(prompt).toContain('Ăn trưa');
    });

    it('should mention it handles any language input', () => {
      const prompt = buildIntentDetectorPrompt('test');
      expect(prompt).toContain('任何語言');
    });
  });

  describe('Prompt language-agnostic verification', () => {
    it('dataExtractorPrompt output should be JSON (language-agnostic)', () => {
      const prompt = buildDataExtractorPrompt({
        rawText: 'lunch 100',
        categories: ['food'],
        currentDateTime: '2026年3月22日',
      });
      // Output format should always be JSON regardless of language
      expect(prompt).toContain('"type"');
      expect(prompt).toContain('"amount"');
      expect(prompt).toContain('"category"');
    });

    it('intentDetectorPrompt output should be JSON (language-agnostic)', () => {
      const prompt = buildIntentDetectorPrompt('hello');
      expect(prompt).toContain('"intent"');
      expect(prompt).toContain('transaction');
      expect(prompt).toContain('chat');
    });
  });
});
