import { describe, it, expect, beforeEach } from 'vitest'
import i18n from '../i18n/index'
import { supportedLngs, getVoiceLang, voiceLangMap } from '../i18n/index'

describe('i18n Language Settings', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('zh-TW')
  })

  describe('supportedLngs', () => {
    it('should include all four supported languages', () => {
      expect(supportedLngs).toContain('zh-TW')
      expect(supportedLngs).toContain('en')
      expect(supportedLngs).toContain('zh-CN')
      expect(supportedLngs).toContain('vi')
      expect(supportedLngs).toHaveLength(4)
    })
  })

  describe('voiceLangMap', () => {
    it('should map UI languages to speech recognition languages', () => {
      expect(voiceLangMap['zh-TW']).toBe('zh-TW')
      expect(voiceLangMap['en']).toBe('en-US')
      expect(voiceLangMap['zh-CN']).toBe('zh-CN')
      expect(voiceLangMap['vi']).toBe('vi-VN')
    })
  })

  describe('getVoiceLang', () => {
    it('should return correct voice lang for supported languages', () => {
      expect(getVoiceLang('zh-TW')).toBe('zh-TW')
      expect(getVoiceLang('en')).toBe('en-US')
      expect(getVoiceLang('zh-CN')).toBe('zh-CN')
      expect(getVoiceLang('vi')).toBe('vi-VN')
    })

    it('should fallback to zh-TW for unsupported languages', () => {
      expect(getVoiceLang('ja')).toBe('zh-TW')
      expect(getVoiceLang('ko')).toBe('zh-TW')
      expect(getVoiceLang('unknown')).toBe('zh-TW')
    })
  })

  describe('i18n.changeLanguage', () => {
    it('should switch language to English and back', async () => {
      expect(i18n.language).toBe('zh-TW')

      await i18n.changeLanguage('en')
      expect(i18n.language).toBe('en')
      expect(i18n.t('common:save')).toBe('Save')

      await i18n.changeLanguage('zh-TW')
      expect(i18n.language).toBe('zh-TW')
      expect(i18n.t('common:save')).toBe('儲存')
    })

    it('should switch language to zh-CN', async () => {
      await i18n.changeLanguage('zh-CN')
      expect(i18n.language).toBe('zh-CN')
      expect(i18n.t('common:save')).toBe('保存')
    })

    it('should switch language to Vietnamese', async () => {
      await i18n.changeLanguage('vi')
      expect(i18n.language).toBe('vi')
      expect(i18n.t('common:save')).toBe('Lưu')
    })
  })

  describe('translation keys exist in all languages', () => {
    const keysToCheck = [
      'common:save',
      'common:cancel',
      'common:confirm',
      'common:expense',
      'common:income',
      'common:appName',
      'common:appSlogan',
      'dashboard:recentTransactions',
      'dashboard:aiFeedback.label',
      'stats:title',
      'history:title',
      'settings:title',
      'settings:language.title',
      'auth:login.submit',
      'auth:register.submit',
      'categories:food',
      'categories:transport',
    ]

    for (const lang of supportedLngs) {
      it(`should have all required keys for ${lang}`, async () => {
        await i18n.changeLanguage(lang)
        for (const key of keysToCheck) {
          const translated = i18n.t(key)
          // Should not return the key itself (meaning missing translation)
          expect(translated).not.toBe(key)
          expect(translated.length).toBeGreaterThan(0)
        }
      })
    }
  })

  describe('language persistence', () => {
    it('should update i18n language when changeLanguage is called', async () => {
      await i18n.changeLanguage('en')
      expect(i18n.language).toBe('en')
      // i18next stores to localStorage internally via the detection caches config
      // We verify the language is correctly set on the i18n instance
      await i18n.changeLanguage('zh-TW')
      expect(i18n.language).toBe('zh-TW')
    })
  })
})
