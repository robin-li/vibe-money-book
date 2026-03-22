import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { AppError, createI18nError, errorHandler } from '../middlewares/errorHandler';
import { t } from '../i18n';
import express, { Request, Response, NextFunction } from 'express';
import { localeMiddleware } from '../middlewares/locale';

// Mock Prisma for auth tests
vi.mock('../config/database', () => {
  return {
    default: {
      user: {
        findUnique: vi.fn(async () => null),
        create: vi.fn(),
      },
      categoryBudget: {
        count: vi.fn(async () => 0),
        findMany: vi.fn(async () => []),
        findUnique: vi.fn(async () => null),
        create: vi.fn(),
      },
    },
  };
});

describe('T-602: Backend Error Messages i18n', () => {
  describe('AppError with i18n key', () => {
    it('should create AppError with i18nKey using createI18nError', () => {
      const error = createI18nError('user_not_found', 404);
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(404);
      expect(error.i18nKey).toBe('user_not_found');
      // Default message should be zh-TW translation
      expect(error.message).toBe('使用者不存在');
    });

    it('should support interpolation params', () => {
      const error = createI18nError('category_limit_reached', 400, undefined, { max: 50 });
      expect(error.i18nKey).toBe('category_limit_reached');
      expect(error.i18nParams).toEqual({ max: 50 });
      expect(error.message).toContain('50');
    });

    it('should support backward compatible AppError (no i18n key)', () => {
      const error = new AppError('Custom error message', 500);
      expect(error.i18nKey).toBeUndefined();
      expect(error.message).toBe('Custom error message');
    });
  });

  describe('t() translation function', () => {
    it('should return zh-TW translation by default', () => {
      expect(t('user_not_found')).toBe('使用者不存在');
    });

    it('should return English translation for "en"', () => {
      expect(t('user_not_found', 'en')).toBe('User not found');
    });

    it('should return zh-CN translation', () => {
      expect(t('user_not_found', 'zh-CN')).toBe('用户不存在');
    });

    it('should return Vietnamese translation', () => {
      expect(t('user_not_found', 'vi')).toBe('Không tìm thấy người dùng');
    });

    it('should support interpolation', () => {
      expect(t('category_limit_reached', 'en', { max: 50 })).toBe('Category limit reached (max 50)');
      expect(t('category_limit_reached', 'zh-TW', { max: 50 })).toBe('類別數量已達上限 50');
    });
  });

  describe('errorHandler middleware with locale', () => {
    function createTestApp(throwError: () => void) {
      const testApp = express();
      testApp.use(express.json());
      testApp.use(localeMiddleware);
      testApp.get('/test-error', (_req: Request, _res: Response, next: NextFunction) => {
        try {
          throwError();
        } catch (err) {
          next(err);
        }
      });
      testApp.use(errorHandler);
      return testApp;
    }

    it('should return zh-TW error message when Accept-Language is zh-TW', async () => {
      const testApp = createTestApp(() => {
        throw createI18nError('user_not_found', 404);
      });

      const res = await request(testApp)
        .get('/test-error')
        .set('Accept-Language', 'zh-TW');

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('使用者不存在');
    });

    it('should return English error message when Accept-Language is en', async () => {
      const testApp = createTestApp(() => {
        throw createI18nError('user_not_found', 404);
      });

      const res = await request(testApp)
        .get('/test-error')
        .set('Accept-Language', 'en');

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('User not found');
    });

    it('should return zh-CN error message when Accept-Language is zh-CN', async () => {
      const testApp = createTestApp(() => {
        throw createI18nError('user_not_found', 404);
      });

      const res = await request(testApp)
        .get('/test-error')
        .set('Accept-Language', 'zh-CN');

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('用户不存在');
    });

    it('should return Vietnamese error message when Accept-Language is vi', async () => {
      const testApp = createTestApp(() => {
        throw createI18nError('user_not_found', 404);
      });

      const res = await request(testApp)
        .get('/test-error')
        .set('Accept-Language', 'vi');

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Không tìm thấy người dùng');
    });

    it('should fallback to zh-TW when Accept-Language is not supported', async () => {
      const testApp = createTestApp(() => {
        throw createI18nError('user_not_found', 404);
      });

      const res = await request(testApp)
        .get('/test-error')
        .set('Accept-Language', 'fr');

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('使用者不存在');
    });

    it('should handle backward-compatible AppError without i18nKey', async () => {
      const testApp = createTestApp(() => {
        throw new AppError('Legacy error message', 400);
      });

      const res = await request(testApp)
        .get('/test-error')
        .set('Accept-Language', 'en');

      expect(res.status).toBe(400);
      // Without i18n key, original message should be preserved
      expect(res.body.message).toBe('Legacy error message');
    });

    it('should translate non-AppError as internal_error', async () => {
      const testApp = createTestApp(() => {
        throw new Error('Some unexpected error');
      });

      const res = await request(testApp)
        .get('/test-error')
        .set('Accept-Language', 'en');

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Internal server error');
    });

    it('should handle interpolation params with locale', async () => {
      const testApp = createTestApp(() => {
        throw createI18nError('category_limit_reached', 400, undefined, { max: 50 });
      });

      const res = await request(testApp)
        .get('/test-error')
        .set('Accept-Language', 'en');

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Category limit reached (max 50)');
    });
  });

  describe('All error keys have 4-language translations', () => {
    const errorKeys = [
      'validation_failed',
      'not_found',
      'unauthorized',
      'token_missing',
      'token_expired',
      'token_invalid',
      'user_not_found',
      'email_already_exists',
      'invalid_credentials',
      'internal_error',
      'rate_limit_exceeded',
      'at_least_one_field',
      'transaction_not_found',
      'llm_api_key_missing',
      'llm_api_key_invalid',
      'gemini_api_key_invalid',
      'gemini_quota_exhausted',
      'openai_api_key_invalid',
      'openai_quota_exhausted',
      'llm_service_unavailable',
      'llm_parse_error',
      'category_name_required',
      'category_type_invalid',
      'category_already_exists',
      'budget_limit_invalid',
      'category_not_found',
      'category_item_missing',
      'cannot_delete_default_category',
      'categories_list_required',
    ];

    const languages = ['zh-TW', 'en', 'zh-CN', 'vi'];

    for (const key of errorKeys) {
      for (const lang of languages) {
        it(`should have translation for "${key}" in "${lang}"`, () => {
          const translation = t(key, lang);
          // Should not return the key itself (means missing translation)
          expect(translation).not.toBe(key);
          expect(translation.length).toBeGreaterThan(0);
        });
      }
    }
  });
});
