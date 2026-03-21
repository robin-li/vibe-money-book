import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  TIME_RANGE_SYSTEM_PROMPT,
  buildTimeRangePrompt,
  buildTransactionMatchSystemPrompt,
  buildTransactionMatchUserPrompt,
} from '../prompts/queryPrompt';
import { TransactionSummaryForQuery } from '../types/llm';
import { aiQuerySchema } from '../validators/aiValidators';

// ─── Prompt 構建測試 ───

describe('queryPrompt', () => {
  describe('buildTimeRangePrompt', () => {
    it('should include query text and current time', () => {
      const prompt = buildTimeRangePrompt('最近一個月的開銷', '2026年3月21日 星期六 15:00:00 (GMT+8)');
      expect(prompt).toContain('最近一個月的開銷');
      expect(prompt).toContain('2026年3月21日');
    });
  });

  describe('TIME_RANGE_SYSTEM_PROMPT', () => {
    it('should instruct JSON output format', () => {
      expect(TIME_RANGE_SYSTEM_PROMPT).toContain('start_date');
      expect(TIME_RANGE_SYSTEM_PROMPT).toContain('end_date');
      expect(TIME_RANGE_SYSTEM_PROMPT).toContain('JSON');
    });
  });

  describe('buildTransactionMatchSystemPrompt', () => {
    it('should include persona instruction for sarcastic', () => {
      const prompt = buildTransactionMatchSystemPrompt('sarcastic');
      expect(prompt).toContain('毒舌');
      expect(prompt).toContain('matched_ids');
    });

    it('should include persona instruction for gentle', () => {
      const prompt = buildTransactionMatchSystemPrompt('gentle');
      expect(prompt).toContain('溫柔');
    });

    it('should include persona instruction for guilt_trip', () => {
      const prompt = buildTransactionMatchSystemPrompt('guilt_trip');
      expect(prompt).toContain('心疼');
    });
  });

  describe('buildTransactionMatchUserPrompt', () => {
    const mockTransactions: TransactionSummaryForQuery[] = [
      {
        id: 'uuid-1',
        amount: 600,
        type: 'expense',
        category: '寵物用品',
        merchant: '阿貓阿狗',
        note: '貓砂',
        transaction_date: '2026-03-19',
      },
      {
        id: 'uuid-2',
        amount: 1200,
        type: 'expense',
        category: '寵物用品',
        merchant: '阿貓阿狗',
        note: null,
        transaction_date: '2026-03-18',
      },
    ];

    it('should include query text and transaction details', () => {
      const prompt = buildTransactionMatchUserPrompt('阿貓阿狗花了多少', mockTransactions);
      expect(prompt).toContain('阿貓阿狗花了多少');
      expect(prompt).toContain('uuid-1');
      expect(prompt).toContain('uuid-2');
      expect(prompt).toContain('$600');
      expect(prompt).toContain('$1200');
      expect(prompt).toContain('共 2 筆');
    });

    it('should handle empty transactions', () => {
      const prompt = buildTransactionMatchUserPrompt('查詢', []);
      expect(prompt).toContain('共 0 筆');
      expect(prompt).toContain('（無交易記錄）');
    });
  });
});

// ─── Validator 測試 ───

describe('aiQuerySchema', () => {
  it('should accept valid query_text', () => {
    const result = aiQuerySchema.safeParse({ query_text: '最近一個月毛小孩的開銷' });
    expect(result.success).toBe(true);
  });

  it('should reject empty query_text', () => {
    const result = aiQuerySchema.safeParse({ query_text: '' });
    expect(result.success).toBe(false);
  });

  it('should reject missing query_text', () => {
    const result = aiQuerySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should reject query_text exceeding 500 chars', () => {
    const result = aiQuerySchema.safeParse({ query_text: 'a'.repeat(501) });
    expect(result.success).toBe(false);
  });

  it('should accept query_text at exactly 500 chars', () => {
    const result = aiQuerySchema.safeParse({ query_text: 'a'.repeat(500) });
    expect(result.success).toBe(true);
  });
});

// ─── Service 層 Mock 測試 ───

// Mock prisma
vi.mock('../config/database', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
    transaction: {
      findMany: vi.fn(),
    },
  },
}));

// Mock llmFactory
vi.mock('../services/llm/llmFactory', () => ({
  getProvider: vi.fn(),
}));

describe('queryTransactions service', () => {
  let queryTransactions: typeof import('../services/llmService').queryTransactions;
  let mockPrisma: any;
  let mockGetProvider: any;

  beforeEach(async () => {
    vi.resetModules();
    const prismaModule = await import('../config/database');
    mockPrisma = prismaModule.default;

    const factoryModule = await import('../services/llm/llmFactory');
    mockGetProvider = factoryModule.getProvider;

    const serviceModule = await import('../services/llmService');
    queryTransactions = serviceModule.queryTransactions;
  });

  it('should return query result with matched IDs', async () => {
    // Mock user
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      aiEngine: 'gemini',
      persona: 'sarcastic',
      aiInstructions: null,
    });

    // Mock transactions
    mockPrisma.transaction.findMany.mockResolvedValue([
      {
        id: 'txn-1',
        amount: 600,
        type: 'expense',
        category: '寵物用品',
        merchant: '阿貓阿狗',
        note: '貓砂',
        transactionDate: new Date('2026-03-19'),
      },
      {
        id: 'txn-2',
        amount: 1200,
        type: 'expense',
        category: '寵物用品',
        merchant: '阿貓阿狗',
        note: null,
        transactionDate: new Date('2026-03-18'),
      },
      {
        id: 'txn-3',
        amount: 180,
        type: 'expense',
        category: '飲食',
        merchant: '拉麵店',
        note: null,
        transactionDate: new Date('2026-03-17'),
      },
    ]);

    // Mock LLM provider
    const mockProvider = {
      generateText: vi.fn()
        // 1st call: time range parsing
        .mockResolvedValueOnce(JSON.stringify({
          start_date: '2026-03-01',
          end_date: '2026-03-31',
        }))
        // 2nd call: transaction matching
        .mockResolvedValueOnce(JSON.stringify({
          matched_ids: ['txn-1', 'txn-2'],
          total_amount: 1800,
          summary_text: '你在阿貓阿狗花了 1800 元！',
          emotion_tag: 'sarcastic_warning',
        })),
      extractData: vi.fn(),
      generateFeedback: vi.fn(),
    };
    mockGetProvider.mockReturnValue(mockProvider);

    const result = await queryTransactions('user-1', '阿貓阿狗花了多少', 'test-key');

    expect(result.matched_transaction_ids).toEqual(['txn-1', 'txn-2']);
    expect(result.summary.text).toContain('1800');
    expect(result.summary.match_count).toBe(2);
    expect(result.summary.total_amount).toBe(1800);
    expect(result.time_range.start_date).toBe('2026-03-01');
    expect(result.time_range.end_date).toBe('2026-03-31');

    // Verify two LLM calls were made
    expect(mockProvider.generateText).toHaveBeenCalledTimes(2);
  });

  it('should fallback to current month when time parsing fails', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      aiEngine: 'gemini',
      persona: 'gentle',
      aiInstructions: null,
    });

    mockPrisma.transaction.findMany.mockResolvedValue([]);

    const mockProvider = {
      generateText: vi.fn()
        .mockResolvedValueOnce('invalid json')  // time range parse fails
        .mockResolvedValueOnce(JSON.stringify({
          matched_ids: [],
          total_amount: 0,
          summary_text: '找不到相關記錄呢。',
          emotion_tag: 'neutral',
        })),
      extractData: vi.fn(),
      generateFeedback: vi.fn(),
    };
    mockGetProvider.mockReturnValue(mockProvider);

    const result = await queryTransactions('user-1', '潛水花了多少', 'test-key');

    // Should fallback to current month
    const now = new Date();
    const expectedMonth = String(now.getMonth() + 1).padStart(2, '0');
    expect(result.time_range.start_date).toContain(`-${expectedMonth}-01`);
    expect(result.matched_transaction_ids).toEqual([]);
  });

  it('should filter out invalid matched IDs', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      aiEngine: 'openai',
      persona: 'gentle',
      aiInstructions: null,
    });

    mockPrisma.transaction.findMany.mockResolvedValue([
      {
        id: 'txn-1',
        amount: 100,
        type: 'expense',
        category: '飲食',
        merchant: '便當店',
        note: null,
        transactionDate: new Date('2026-03-15'),
      },
    ]);

    const mockProvider = {
      generateText: vi.fn()
        .mockResolvedValueOnce(JSON.stringify({
          start_date: '2026-03-01',
          end_date: '2026-03-31',
        }))
        .mockResolvedValueOnce(JSON.stringify({
          matched_ids: ['txn-1', 'txn-FAKE'],  // txn-FAKE doesn't exist
          total_amount: 100,
          summary_text: '找到了！',
          emotion_tag: 'neutral',
        })),
      extractData: vi.fn(),
      generateFeedback: vi.fn(),
    };
    mockGetProvider.mockReturnValue(mockProvider);

    const result = await queryTransactions('user-1', '便當', 'test-key');

    // Should filter out invalid ID
    expect(result.matched_transaction_ids).toEqual(['txn-1']);
    expect(result.summary.match_count).toBe(1);
  });

  it('should throw 404 for non-existent user', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await expect(
      queryTransactions('non-existent', '查詢', 'test-key')
    ).rejects.toThrow('使用者不存在');
  });
});
