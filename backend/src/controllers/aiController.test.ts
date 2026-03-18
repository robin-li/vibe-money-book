import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import app from '../app';

// ─── Mock Data ─────────────────────────────────────────────────

const MOCK_USER_ID = 'user-llm-test-001';
const MOCK_USER = {
  id: MOCK_USER_ID,
  name: 'LLM Test User',
  email: 'llm@test.com',
  passwordHash: 'hashed_password',
  persona: 'sarcastic',
  aiEngine: 'gemini',
  monthlyBudget: 30000,
  currency: 'TWD',
  createdAt: new Date(),
  updatedAt: new Date(),
  categoryBudgets: [
    { id: 'cb-1', userId: MOCK_USER_ID, category: 'food', budgetLimit: 8000, isCustom: false, createdAt: new Date(), updatedAt: new Date() },
    { id: 'cb-2', userId: MOCK_USER_ID, category: 'transport', budgetLimit: 3000, isCustom: false, createdAt: new Date(), updatedAt: new Date() },
    { id: 'cb-3', userId: MOCK_USER_ID, category: 'entertainment', budgetLimit: 3000, isCustom: false, createdAt: new Date(), updatedAt: new Date() },
    { id: 'cb-4', userId: MOCK_USER_ID, category: 'shopping', budgetLimit: 3000, isCustom: false, createdAt: new Date(), updatedAt: new Date() },
    { id: 'cb-5', userId: MOCK_USER_ID, category: 'daily', budgetLimit: 2000, isCustom: false, createdAt: new Date(), updatedAt: new Date() },
    { id: 'cb-6', userId: MOCK_USER_ID, category: 'medical', budgetLimit: 2000, isCustom: false, createdAt: new Date(), updatedAt: new Date() },
    { id: 'cb-7', userId: MOCK_USER_ID, category: 'education', budgetLimit: 2000, isCustom: false, createdAt: new Date(), updatedAt: new Date() },
    { id: 'cb-8', userId: MOCK_USER_ID, category: 'other', budgetLimit: 0, isCustom: false, createdAt: new Date(), updatedAt: new Date() },
  ],
};

const MOCK_TRANSACTIONS = [
  { id: 't-1', userId: MOCK_USER_ID, amount: 500, category: 'food', merchant: '便當店', rawText: '午餐便當500', note: null, transactionDate: new Date(), createdAt: new Date(), updatedAt: new Date() },
];

// ─── Mock JWT ──────────────────────────────────────────────────

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(() => 'mock-token'),
    verify: vi.fn(() => ({ userId: MOCK_USER_ID })),
  },
}));

// ─── Mock Prisma ───────────────────────────────────────────────

vi.mock('../config/database', () => ({
  default: {
    user: {
      findUnique: vi.fn(async ({ where, include }: { where: { id?: string; email?: string }; include?: unknown }) => {
        if (where.id === MOCK_USER_ID || where.email === 'llm@test.com') {
          return include ? MOCK_USER : { ...MOCK_USER, categoryBudgets: undefined };
        }
        return null;
      }),
    },
    transaction: {
      findMany: vi.fn(async () => MOCK_TRANSACTIONS),
    },
  },
}));

// ─── Mock LLM Providers ────────────────────────────────────────

const mockExtractData = vi.fn();
const mockGenerateFeedback = vi.fn();

vi.mock('../services/llm/llmFactory', () => ({
  getProvider: vi.fn(() => ({
    extractData: mockExtractData,
    generateFeedback: mockGenerateFeedback,
  })),
}));

// ─── Test Helpers ──────────────────────────────────────────────

const AUTH_HEADER = 'Bearer mock-token';
const API_KEY_HEADER = 'test-api-key-12345';

function postParse(rawText: string, apiKey = API_KEY_HEADER) {
  return request(app)
    .post('/api/v1/ai/parse')
    .set('Authorization', AUTH_HEADER)
    .set('X-LLM-API-Key', apiKey)
    .send({ raw_text: rawText });
}

function postValidateKey(apiKey = API_KEY_HEADER) {
  return request(app)
    .post('/api/v1/ai/validate-key')
    .set('Authorization', AUTH_HEADER)
    .set('X-LLM-API-Key', apiKey);
}

// ─── Tests ─────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();

  // Default mock responses
  mockExtractData.mockResolvedValue({
    amount: 180,
    category: 'food',
    merchant: '拉麵店',
    date: '2026-03-18',
    confidence: 0.95,
    is_new_category: false,
    suggested_category: null,
  });

  mockGenerateFeedback.mockResolvedValue({
    text: '180 元買拉麵？你準備靠光合作用過活嗎？',
    emotion_tag: 'sarcastic_warning',
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('POST /api/v1/ai/parse', () => {
  // --- 案例 1: 標準輸入 ---
  it('應正確解析標準自然語言輸入（午餐拉麵 180 元）', async () => {
    const res = await postParse('午餐吃拉麵 180 元');

    expect(res.status).toBe(200);
    expect(res.body.code).toBe(200);
    expect(res.body.message).toBe('解析成功');
    expect(res.body.data.parsed).toEqual({
      amount: 180,
      category: 'food',
      merchant: '拉麵店',
      date: '2026-03-18',
      confidence: 0.95,
      is_new_category: false,
      suggested_category: null,
    });
    expect(res.body.data.feedback.text).toBeDefined();
    expect(res.body.data.feedback.emotion_tag).toBe('sarcastic_warning');
    expect(res.body.data.budget_context).toBeDefined();
    expect(res.body.data.budget_context.monthly_budget).toBe(30000);
    expect(res.body.timestamp).toBeDefined();
  });

  // --- 案例 2: 無金額 ---
  it('應處理無法辨識金額的情境（amount 為 null）', async () => {
    mockExtractData.mockResolvedValue({
      amount: null,
      category: 'food',
      merchant: '餐廳',
      date: '2026-03-18',
      confidence: 0.5,
      is_new_category: false,
      suggested_category: null,
    });

    const res = await postParse('今天去吃飯');
    expect(res.status).toBe(200);
    expect(res.body.data.parsed.amount).toBeNull();
    expect(res.body.data.parsed.confidence).toBeLessThan(1);
  });

  // --- 案例 3: 新類別偵測 ---
  it('應偵測新類別並回傳 suggested_category', async () => {
    mockExtractData.mockResolvedValue({
      amount: 1200,
      category: null,
      merchant: '寵物店',
      date: '2026-03-18',
      confidence: 0.85,
      is_new_category: true,
      suggested_category: '寵物',
    });

    const res = await postParse('帶貓咪去寵物店打疫苗 1200 元');
    expect(res.status).toBe(200);
    expect(res.body.data.parsed.is_new_category).toBe(true);
    expect(res.body.data.parsed.suggested_category).toBe('寵物');
    expect(res.body.data.parsed.category).toBeNull();
  });

  // --- 案例 4: 模糊類別 ---
  it('應處理模糊類別並降低 confidence', async () => {
    mockExtractData.mockResolvedValue({
      amount: 350,
      category: 'entertainment',
      merchant: '書店',
      date: '2026-03-18',
      confidence: 0.6,
      is_new_category: false,
      suggested_category: null,
    });

    const res = await postParse('在書店買了本小說 350');
    expect(res.status).toBe(200);
    expect(res.body.data.parsed.confidence).toBeLessThanOrEqual(0.7);
  });

  // --- 案例 5: 多筆消費（只處理第一筆）---
  it('應僅處理第一筆消費', async () => {
    mockExtractData.mockResolvedValue({
      amount: 100,
      category: 'food',
      merchant: '早餐店',
      date: '2026-03-18',
      confidence: 0.9,
      is_new_category: false,
      suggested_category: null,
    });

    const res = await postParse('早餐 100 元，午餐 200 元');
    expect(res.status).toBe(200);
    expect(res.body.data.parsed.amount).toBe(100);
  });

  // --- 案例 6: 預算上下文正確計算 ---
  it('應回傳正確的 budget_context', async () => {
    const res = await postParse('午餐 180 元');
    expect(res.status).toBe(200);

    const ctx = res.body.data.budget_context;
    expect(ctx.monthly_budget).toBe(30000);
    expect(ctx.spent_this_month).toBe(500); // from MOCK_TRANSACTIONS
    expect(ctx.remaining).toBe(29500);
    expect(ctx.category_spent).toBe(500); // food category
    expect(ctx.category_limit).toBe(8000);
  });

  // --- 案例 7: 缺少 X-LLM-API-Key ---
  it('應在缺少 API Key 時回傳 400', async () => {
    const res = await request(app)
      .post('/api/v1/ai/parse')
      .set('Authorization', AUTH_HEADER)
      .send({ raw_text: '午餐 100 元' });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('API Key');
  });

  // --- 案例 8: 空白輸入 ---
  it('應拒絕空白輸入', async () => {
    const res = await postParse('');
    expect(res.status).toBe(400);
    expect(res.body.code).toBe(400);
  });

  // --- 案例 9: 超長輸入 ---
  it('應拒絕超過 500 字元的輸入', async () => {
    const longText = 'a'.repeat(501);
    const res = await postParse(longText);
    expect(res.status).toBe(400);
    expect(res.body.code).toBe(400);
  });

  // --- 案例 10: 未認證 ---
  it('應拒絕未認證的請求', async () => {
    const res = await request(app)
      .post('/api/v1/ai/parse')
      .set('X-LLM-API-Key', API_KEY_HEADER)
      .send({ raw_text: '午餐 100 元' });

    expect(res.status).toBe(401);
  });

  // --- 案例 11: LLM API Key 無效 ---
  it('應在 LLM API Key 無效時回傳 403', async () => {
    const { AppError } = await import('../middlewares/errorHandler');
    mockExtractData.mockRejectedValue(new AppError('Gemini API Key 無效，請確認您的 API Key', 403));

    const res = await postParse('午餐 100 元', 'invalid-key');
    expect(res.status).toBe(403);
    expect(res.body.message).toContain('API Key');
  });

  // --- 案例 12: LLM 服務不可用 ---
  it('應在 LLM 服務不可用時回傳 502', async () => {
    const { AppError } = await import('../middlewares/errorHandler');
    mockExtractData.mockRejectedValue(new AppError('LLM 服務暫時不可用，請稍後再試', 502));

    const res = await postParse('午餐 100 元');
    expect(res.status).toBe(502);
    expect(res.body.message).toContain('不可用');
  });

  // --- 案例 13: 引擎切換邏輯 ---
  it('應根據使用者偏好選擇正確的 Provider', async () => {
    const { getProvider } = await import('../services/llm/llmFactory');
    await postParse('午餐 100 元');
    // getProvider should be called (mocked, but verifies the flow)
    expect(getProvider).toHaveBeenCalled();
  });

  // --- 案例 14: Prompt 組裝驗證 ---
  it('應將使用者類別清單注入 Prompt', async () => {
    await postParse('午餐 100 元');
    // extractData should be called with a prompt containing category names
    const callArgs = mockExtractData.mock.calls[0];
    const prompt = callArgs[0] as string;
    expect(prompt).toContain('food');
    expect(prompt).toContain('transport');
    expect(prompt).toContain('entertainment');
  });
});

describe('POST /api/v1/ai/validate-key', () => {
  // --- 案例 15: 驗證成功 ---
  it('應在 API Key 有效時回傳 valid: true', async () => {
    const res = await postValidateKey();

    expect(res.status).toBe(200);
    expect(res.body.code).toBe(200);
    expect(res.body.data.valid).toBe(true);
    expect(res.body.data.engine).toBe('gemini');
  });

  // --- 案例 16: 驗證失敗 ---
  it('應在 API Key 無效時回傳 403', async () => {
    const { AppError } = await import('../middlewares/errorHandler');
    mockExtractData.mockRejectedValue(new AppError('Gemini API Key 無效，請確認您的 API Key', 403));

    const res = await postValidateKey('bad-key');
    expect(res.status).toBe(403);
  });

  // --- 案例 17: 缺少 API Key ---
  it('應在缺少 API Key 時回傳 400', async () => {
    const res = await request(app)
      .post('/api/v1/ai/validate-key')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('API Key');
  });

  // --- 案例 18: 未認證 ---
  it('應拒絕未認證的請求', async () => {
    const res = await request(app)
      .post('/api/v1/ai/validate-key')
      .set('X-LLM-API-Key', API_KEY_HEADER);

    expect(res.status).toBe(401);
  });
});
