import { describe, it, expect } from 'vitest';
import { getPersonaSystemPrompt } from '../prompts/personaFeedbackPrompt';
import { getChatPersonaSystemPrompt } from '../prompts/chatReplyPrompt';
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

    it('should instruct note field to use zh-TW by default', () => {
      const prompt = buildDataExtractorPrompt({
        rawText: 'test',
        categories: ['food'],
        currentDateTime: '2026年3月22日',
      });
      expect(prompt).toContain('繁體中文');
      expect(prompt).toMatch(/note.*必須使用繁體中文撰寫/);
    });

    it('should instruct note field to use English when targetLanguage is "en"', () => {
      const prompt = buildDataExtractorPrompt({
        rawText: 'bought a t-shirt',
        categories: ['daily'],
        currentDateTime: '2026年3月22日',
        targetLanguage: 'en',
      });
      expect(prompt).toMatch(/note.*必須使用English撰寫/);
    });

    it('should instruct note field to use zh-CN when targetLanguage is "zh-CN"', () => {
      const prompt = buildDataExtractorPrompt({
        rawText: '买了一件衣服',
        categories: ['daily'],
        currentDateTime: '2026年3月22日',
        targetLanguage: 'zh-CN',
      });
      expect(prompt).toMatch(/note.*必須使用简体中文撰寫/);
    });

    it('should instruct note field to use Vietnamese when targetLanguage is "vi"', () => {
      const prompt = buildDataExtractorPrompt({
        rawText: 'mua áo',
        categories: ['daily'],
        currentDateTime: '2026年3月22日',
        targetLanguage: 'vi',
      });
      expect(prompt).toMatch(/note.*必須使用Tiếng Việt撰寫/);
    });

    it('should instruct note field in all supported languages', () => {
      const langMap: Record<string, string> = {
        'zh-TW': '繁體中文',
        'en': 'English',
        'zh-CN': '简体中文',
        'vi': 'Tiếng Việt',
      };
      for (const [lang, name] of Object.entries(langMap)) {
        const prompt = buildDataExtractorPrompt({
          rawText: 'test',
          categories: ['food'],
          currentDateTime: '2026年3月22日',
          targetLanguage: lang,
        });
        expect(prompt).toContain(`必須使用${name}撰寫`);
      }
    });

    it('should instruct suggested_category to use target language (issue #158)', () => {
      const langMap: Record<string, string> = {
        'zh-TW': '繁體中文',
        'en': 'English',
        'zh-CN': '简体中文',
        'vi': 'Tiếng Việt',
      };
      for (const [lang, name] of Object.entries(langMap)) {
        const prompt = buildDataExtractorPrompt({
          rawText: 'test',
          categories: ['food'],
          currentDateTime: '2026年3月22日',
          targetLanguage: lang,
        });
        // Rule 5: suggested_category language directive
        expect(prompt).toContain(`suggested_category 填入建議的類別名稱（必須使用${name}）`);
        // Field description table: suggested_category language directive
        expect(prompt).toMatch(new RegExp(`suggested_category.*必須使用${name}`));
      }
    });

    it('should instruct suggested_category to use zh-TW by default when no targetLanguage', () => {
      const prompt = buildDataExtractorPrompt({
        rawText: 'test',
        categories: ['food'],
        currentDateTime: '2026年3月22日',
      });
      expect(prompt).toContain('suggested_category 填入建議的類別名稱（必須使用繁體中文）');
    });

    it('should instruct suggested_category to use English when targetLanguage is "en"', () => {
      const prompt = buildDataExtractorPrompt({
        rawText: 'bought a jacket',
        categories: ['daily'],
        currentDateTime: '2026年3月22日',
        targetLanguage: 'en',
      });
      expect(prompt).toContain('suggested_category 填入建議的類別名稱（必須使用English）');
      // Should NOT contain the old hardcoded Chinese instruction
      expect(prompt).not.toContain('建議的中文類別名稱');
    });

    it('should display category names in target language in the prompt', () => {
      const promptEn = buildDataExtractorPrompt({
        rawText: 'test',
        categories: ['food', 'transport'],
        currentDateTime: '2026年3月22日',
        targetLanguage: 'en',
      });
      expect(promptEn).toContain('Food');
      expect(promptEn).toContain('Transport');

      const promptZhTW = buildDataExtractorPrompt({
        rawText: 'test',
        categories: ['food', 'transport'],
        currentDateTime: '2026年3月22日',
        targetLanguage: 'zh-TW',
      });
      expect(promptZhTW).toContain('飲食');
      expect(promptZhTW).toContain('交通');
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
