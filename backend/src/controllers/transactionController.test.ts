import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import app from '../app';

// ─── Mock Data ─────────────────────────────────────────────────

const MOCK_USER_ID = 'user-txn-test-001';
const OTHER_USER_ID = 'user-txn-test-002';

const now = new Date();
const mockTransactions: Record<string, {
  id: string;
  userId: string;
  amount: number;
  category: string;
  merchant: string | null;
  rawText: string;
  note: string | null;
  transactionDate: Date;
  createdAt: Date;
  updatedAt: Date;
  aiFeedback?: {
    id: string;
    feedbackText: string;
    emotionTag: string;
    personaUsed: string;
    createdAt: Date;
  } | null;
}> = {};

let txnCounter = 0;

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
      findUnique: vi.fn(async () => null),
      create: vi.fn(async () => null),
    },
    transaction: {
      create: vi.fn(async ({ data, include: _include }: { data: Record<string, unknown>; include?: unknown }) => {
        txnCounter++;
        const id = `txn-${txnCounter}`;
        const feedbackData = data.aiFeedback as { create: Record<string, unknown> } | undefined;
        const txn = {
          id,
          userId: data.userId as string,
          amount: data.amount as number,
          category: data.category as string,
          merchant: (data.merchant as string) || null,
          rawText: data.rawText as string,
          note: (data.note as string) || null,
          transactionDate: data.transactionDate as Date,
          createdAt: now,
          updatedAt: now,
          aiFeedback: feedbackData
            ? {
                id: `fb-${txnCounter}`,
                feedbackText: feedbackData.create.feedbackText as string,
                emotionTag: feedbackData.create.emotionTag as string,
                personaUsed: feedbackData.create.personaUsed as string,
                createdAt: now,
              }
            : null,
        };
        mockTransactions[id] = txn;
        return txn;
      }),
      findMany: vi.fn(async ({ where, orderBy, skip, take }: {
        where: Record<string, unknown>;
        orderBy?: Record<string, string>;
        skip?: number;
        take?: number;
      }) => {
        let items = Object.values(mockTransactions).filter((t) => t.userId === where.userId);

        if (where.category) {
          items = items.filter((t) => t.category === where.category);
        }
        if (where.transactionDate) {
          const dateFilter = where.transactionDate as { gte?: Date; lte?: Date };
          if (dateFilter.gte) items = items.filter((t) => t.transactionDate >= dateFilter.gte!);
          if (dateFilter.lte) items = items.filter((t) => t.transactionDate <= dateFilter.lte!);
        }

        // Sort
        if (orderBy?.transactionDate === 'desc') {
          items.sort((a, b) => b.transactionDate.getTime() - a.transactionDate.getTime());
        } else {
          items.sort((a, b) => a.transactionDate.getTime() - b.transactionDate.getTime());
        }

        if (skip !== undefined) items = items.slice(skip);
        if (take !== undefined) items = items.slice(0, take);

        return items;
      }),
      findUnique: vi.fn(async ({ where, include: _include }: { where: { id: string }; include?: unknown }) => {
        const txn = mockTransactions[where.id] || null;
        return txn;
      }),
      count: vi.fn(async ({ where }: { where: Record<string, unknown> }) => {
        let items = Object.values(mockTransactions).filter((t) => t.userId === where.userId);
        if (where.category) items = items.filter((t) => t.category === where.category);
        return items.length;
      }),
      delete: vi.fn(async ({ where }: { where: { id: string } }) => {
        const txn = mockTransactions[where.id];
        delete mockTransactions[where.id];
        return txn;
      }),
    },
  },
}));

// ─── Test Helpers ──────────────────────────────────────────────

const AUTH_HEADER = 'Bearer mock-token';

function createTxnPayload(overrides: Record<string, unknown> = {}) {
  return {
    amount: 180,
    category: 'food',
    merchant: '拉麵店',
    raw_text: '午餐吃拉麵 180 元',
    transaction_date: '2026-03-18',
    ...overrides,
  };
}

// ─── Tests ─────────────────────────────────────────────────────

beforeEach(() => {
  // Clear mock transactions
  Object.keys(mockTransactions).forEach((key) => delete mockTransactions[key]);
  txnCounter = 0;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/v1/transactions', () => {
  it('應成功建立交易記錄', async () => {
    const res = await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', AUTH_HEADER)
      .send(createTxnPayload());

    expect(res.status).toBe(201);
    expect(res.body.code).toBe(201);
    expect(res.body.message).toBe('交易建立成功');
    expect(res.body.data.transaction.amount).toBe(180);
    expect(res.body.data.transaction.category).toBe('food');
    expect(res.body.data.transaction.merchant).toBe('拉麵店');
    expect(res.body.data.transaction.transaction_date).toBe('2026-03-18');
    expect(res.body.data.feedback).toBeNull();
  });

  it('應同時建立交易與 AI 回饋記錄', async () => {
    const res = await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', AUTH_HEADER)
      .send(createTxnPayload({
        feedback: {
          text: '又吃拉麵？你準備靠光合作用過活嗎？',
          emotion_tag: 'sarcastic_warning',
          persona_used: 'sarcastic',
        },
      }));

    expect(res.status).toBe(201);
    expect(res.body.data.feedback).not.toBeNull();
    expect(res.body.data.feedback.feedback_text).toBe('又吃拉麵？你準備靠光合作用過活嗎？');
    expect(res.body.data.feedback.persona_used).toBe('sarcastic');
  });

  it('應拒絕金額為負數的交易', async () => {
    const res = await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', AUTH_HEADER)
      .send(createTxnPayload({ amount: -100 }));

    expect(res.status).toBe(400);
    expect(res.body.code).toBe(400);
  });

  it('應拒絕缺少必填欄位的請求', async () => {
    const res = await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', AUTH_HEADER)
      .send({ amount: 100 });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('應拒絕無效的日期格式', async () => {
    const res = await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', AUTH_HEADER)
      .send(createTxnPayload({ transaction_date: '2026/03/18' }));

    expect(res.status).toBe(400);
  });

  it('應拒絕超過 500 字元的 raw_text', async () => {
    const res = await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', AUTH_HEADER)
      .send(createTxnPayload({ raw_text: 'a'.repeat(501) }));

    expect(res.status).toBe(400);
  });

  it('應拒絕未認證的請求', async () => {
    const res = await request(app)
      .post('/api/v1/transactions')
      .send(createTxnPayload());

    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/transactions', () => {
  beforeEach(async () => {
    // Seed some transactions
    for (let i = 1; i <= 3; i++) {
      await request(app)
        .post('/api/v1/transactions')
        .set('Authorization', AUTH_HEADER)
        .send(createTxnPayload({
          amount: i * 100,
          category: i === 3 ? 'transport' : 'food',
          transaction_date: `2026-03-${String(15 + i).padStart(2, '0')}`,
        }));
    }
  });

  it('應回傳分頁交易列表', async () => {
    const res = await request(app)
      .get('/api/v1/transactions')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(3);
    expect(res.body.data.pagination.total).toBe(3);
    expect(res.body.data.pagination.page).toBe(1);
  });

  it('應支援分頁查詢（limit=1）', async () => {
    const res = await request(app)
      .get('/api/v1/transactions?limit=1&page=1')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.pagination.pages).toBe(3);
  });

  it('應支援按類別篩選', async () => {
    const res = await request(app)
      .get('/api/v1/transactions?category=transport')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].category).toBe('transport');
  });

  it('應支援按日期範圍篩選', async () => {
    const res = await request(app)
      .get('/api/v1/transactions?start_date=2026-03-17&end_date=2026-03-18')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBeGreaterThanOrEqual(1);
  });

  it('應在無結果時回傳空陣列', async () => {
    const res = await request(app)
      .get('/api/v1/transactions?category=nonexistent')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(0);
    expect(res.body.data.pagination.total).toBe(0);
  });

  it('應拒絕未認證的請求', async () => {
    const res = await request(app)
      .get('/api/v1/transactions');

    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/transactions/:id', () => {
  it('應回傳單筆交易詳情', async () => {
    // Create a transaction first
    const createRes = await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', AUTH_HEADER)
      .send(createTxnPayload());

    const txnId = createRes.body.data.transaction.id;

    const res = await request(app)
      .get(`/api/v1/transactions/${txnId}`)
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(txnId);
    expect(res.body.data.amount).toBe(180);
    expect(res.body.data.raw_text).toBe('午餐吃拉麵 180 元');
  });

  it('應在交易不存在時回傳 404', async () => {
    const res = await request(app)
      .get('/api/v1/transactions/nonexistent-id')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(404);
  });

  it('應拒絕存取其他使用者的交易', async () => {
    // Create a transaction owned by another user
    const otherId = `txn-other-${Date.now()}`;
    mockTransactions[otherId] = {
      id: otherId,
      userId: OTHER_USER_ID,
      amount: 999,
      category: 'food',
      merchant: '別人的店',
      rawText: '別人的交易',
      note: null,
      transactionDate: now,
      createdAt: now,
      updatedAt: now,
    };

    const res = await request(app)
      .get(`/api/v1/transactions/${otherId}`)
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(404); // 404 not 403 for security
  });
});

describe('DELETE /api/v1/transactions/:id', () => {
  it('應成功刪除交易', async () => {
    const createRes = await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', AUTH_HEADER)
      .send(createTxnPayload());

    const txnId = createRes.body.data.transaction.id;

    const res = await request(app)
      .delete(`/api/v1/transactions/${txnId}`)
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(204);
  });

  it('應在交易不存在時回傳 404', async () => {
    const res = await request(app)
      .delete('/api/v1/transactions/nonexistent-id')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(404);
  });

  it('應拒絕刪除其他使用者的交易', async () => {
    const otherId = `txn-other-del-${Date.now()}`;
    mockTransactions[otherId] = {
      id: otherId,
      userId: OTHER_USER_ID,
      amount: 500,
      category: 'food',
      merchant: '別人的店',
      rawText: '別人的交易',
      note: null,
      transactionDate: now,
      createdAt: now,
      updatedAt: now,
    };

    const res = await request(app)
      .delete(`/api/v1/transactions/${otherId}`)
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(404);
  });

  it('應拒絕未認證的請求', async () => {
    const res = await request(app)
      .delete('/api/v1/transactions/some-id');

    expect(res.status).toBe(401);
  });
});
