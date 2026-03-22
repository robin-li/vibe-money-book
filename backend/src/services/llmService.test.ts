import { describe, it, expect } from 'vitest';
import { getQueryRangeTooLargeMessage } from './llmService';

describe('getQueryRangeTooLargeMessage', () => {
  describe('zh-TW locale', () => {
    it('should return sarcastic message for sarcastic persona', () => {
      const msg = getQueryRangeTooLargeMessage('sarcastic', 'zh-TW');
      expect(msg).toContain('半年的帳');
      expect(msg).toContain('超級電腦');
    });

    it('should return gentle message for gentle persona', () => {
      const msg = getQueryRangeTooLargeMessage('gentle', 'zh-TW');
      expect(msg).toContain('數據好多');
      expect(msg).toContain('💕');
    });

    it('should return guilt_trip message for guilt_trip persona', () => {
      const msg = getQueryRangeTooLargeMessage('guilt_trip', 'zh-TW');
      expect(msg).toContain('不在乎我的感受');
      expect(msg).toContain('🥺');
    });
  });

  describe('en locale', () => {
    it('should return sarcastic message for sarcastic persona', () => {
      const msg = getQueryRangeTooLargeMessage('sarcastic', 'en');
      expect(msg).toContain('Six months');
      expect(msg).toContain('supercomputer');
    });

    it('should return gentle message for gentle persona', () => {
      const msg = getQueryRangeTooLargeMessage('gentle', 'en');
      expect(msg).toContain('shorter time period');
      expect(msg).toContain('💕');
    });

    it('should return guilt_trip message for guilt_trip persona', () => {
      const msg = getQueryRangeTooLargeMessage('guilt_trip', 'en');
      expect(msg).toContain('care about me');
      expect(msg).toContain('🥺');
    });
  });

  describe('language fallback', () => {
    it('should use en messages for en-US', () => {
      const msg = getQueryRangeTooLargeMessage('sarcastic', 'en-US');
      expect(msg).toContain('Six months');
    });

    it('should use en messages for en-GB', () => {
      const msg = getQueryRangeTooLargeMessage('gentle', 'en-GB');
      expect(msg).toContain('shorter time period');
    });

    it('should fallback to zh-TW for unknown languages', () => {
      const msg = getQueryRangeTooLargeMessage('sarcastic', 'ja');
      expect(msg).toContain('半年的帳');
    });
  });
});
