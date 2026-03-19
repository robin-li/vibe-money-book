import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
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
  authMiddleware: (req: Request, _res: Response, next: NextFunction) => {
    (req as Request & { userId: string }).userId = 'test-user-id';
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
          amount: new Prisma.Decimal(5000),
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
          amount: new Prisma.Decimal(3000),
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
          amount: new Prisma.Decimal(2000),
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
      const totalRatio = data.distribution.reduce((sum: number, d: { ratio: number }) => sum + d.ratio, 0);
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
          amount: new Prisma.Decimal(1000),
          category: 'food',
          merchant: null,
          rawText: 'test',
          note: null,
          type: 'expense',
          transactionDate: new Date('2026-01-15'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const res = await request(app).get('/api/v1/stats/distribution?month=2026-01');

      expect(res.status).toBe(200);
      expect(res.body.data.month).toBe('2026-01');
    });

    it('should filter by type=expense', async () => {
      mockedPrisma.transaction.findMany.mockResolvedValue([
        {
          id: 't1',
          userId: 'test-user-id',
          amount: new Prisma.Decimal(5000),
          category: 'food',
          type: 'expense',
          merchant: null,
          rawText: '午餐',
          note: null,
          transactionDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const res = await request(app).get('/api/v1/stats/distribution?type=expense');

      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(5000);
      expect(res.body.data.distribution).toHaveLength(1);
      expect(res.body.data.distribution[0].category).toBe('food');

      // Verify prisma was called with type filter
      expect(mockedPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'expense' }),
        }),
      );
    });

    it('should filter by type=income', async () => {
      mockedPrisma.transaction.findMany.mockResolvedValue([
        {
          id: 't1',
          userId: 'test-user-id',
          amount: new Prisma.Decimal(50000),
          category: 'salary',
          type: 'income',
          merchant: null,
          rawText: '薪水',
          note: null,
          transactionDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 't2',
          userId: 'test-user-id',
          amount: new Prisma.Decimal(3000),
          category: 'investment',
          type: 'income',
          merchant: null,
          rawText: '股票收益',
          note: null,
          transactionDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const res = await request(app).get('/api/v1/stats/distribution?type=income');

      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(53000);
      expect(res.body.data.distribution).toHaveLength(2);
      expect(res.body.data.distribution[0].category).toBe('salary');

      expect(mockedPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'income' }),
        }),
      );
    });

    it('should return all transactions when type is not specified', async () => {
      mockedPrisma.transaction.findMany.mockResolvedValue([]);

      await request(app).get('/api/v1/stats/distribution');

      const calledWith = mockedPrisma.transaction.findMany.mock.calls[0][0];
      expect(calledWith?.where).not.toHaveProperty('type');
    });

    it('should ignore invalid type parameter', async () => {
      mockedPrisma.transaction.findMany.mockResolvedValue([]);

      await request(app).get('/api/v1/stats/distribution?type=invalid');

      const calledWith = mockedPrisma.transaction.findMany.mock.calls[0][0];
      expect(calledWith?.where).not.toHaveProperty('type');
    });
  });
});
