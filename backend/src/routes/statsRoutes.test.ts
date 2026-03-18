import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app';

// Mock prisma
vi.mock('../config/database', () => {
  return {
    default: {
      user: {
        findUnique: vi.fn(),
      },
      categoryBudget: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
      },
      transaction: {
        findMany: vi.fn(),
        updateMany: vi.fn(),
      },
    },
  };
});

// Mock auth middleware
vi.mock('../middlewares/auth', () => ({
  authMiddleware: (req: any, _res: any, next: any) => {
    req.userId = 'test-user-id';
    next();
  },
  AuthRequest: {},
}));

import prisma from '../config/database';

const mockedPrisma = vi.mocked(prisma);

describe('Stats Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================
  // GET /stats/distribution
  // ==========================================
  describe('GET /api/v1/stats/distribution', () => {
    it('should return spending distribution by category', async () => {
      mockedPrisma.transaction.findMany.mockResolvedValue([
        {
          id: 't1',
          userId: 'test-user-id',
          amount: 5000 as any,
          category: 'food',
          merchant: null,
          rawText: '午餐',
          note: null,
          transactionDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 't2',
          userId: 'test-user-id',
          amount: 3000 as any,
          category: 'transport',
          merchant: null,
          rawText: '計程車',
          note: null,
          transactionDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 't3',
          userId: 'test-user-id',
          amount: 2000 as any,
          category: 'food',
          merchant: null,
          rawText: '晚餐',
          note: null,
          transactionDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const res = await request(app).get('/api/v1/stats/distribution');

      expect(res.status).toBe(200);
      const data = res.body.data;
      expect(data.total).toBe(10000);
      expect(data.distribution).toHaveLength(2);

      // Should be sorted by amount descending
      expect(data.distribution[0].category).toBe('food');
      expect(data.distribution[0].amount).toBe(7000);
      expect(data.distribution[0].ratio).toBe(0.7);

      expect(data.distribution[1].category).toBe('transport');
      expect(data.distribution[1].amount).toBe(3000);
      expect(data.distribution[1].ratio).toBe(0.3);

      // Ratios should sum to ~1
      const totalRatio = data.distribution.reduce((sum: number, d: any) => sum + d.ratio, 0);
      expect(totalRatio).toBeCloseTo(1.0, 1);
    });

    it('should return empty distribution when no transactions', async () => {
      mockedPrisma.transaction.findMany.mockResolvedValue([]);

      const res = await request(app).get('/api/v1/stats/distribution');

      expect(res.status).toBe(200);
      const data = res.body.data;
      expect(data.total).toBe(0);
      expect(data.distribution).toHaveLength(0);
    });

    it('should support month query parameter', async () => {
      mockedPrisma.transaction.findMany.mockResolvedValue([
        {
          id: 't1',
          userId: 'test-user-id',
          amount: 1000 as any,
          category: 'food',
          merchant: null,
          rawText: 'test',
          note: null,
          transactionDate: new Date('2026-01-15'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const res = await request(app).get('/api/v1/stats/distribution?month=2026-01');

      expect(res.status).toBe(200);
      expect(res.body.data.month).toBe('2026-01');
    });
  });
});
