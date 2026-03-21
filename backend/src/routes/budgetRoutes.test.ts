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
        groupBy: vi.fn(),
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

describe('Budget Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================
  // POST /budget/categories
  // ==========================================
  describe('POST /api/v1/budget/categories', () => {
    it('should create a new category with default type expense', async () => {
      mockedPrisma.categoryBudget.count.mockResolvedValue(5);
      mockedPrisma.categoryBudget.findUnique.mockResolvedValue(null);
      mockedPrisma.categoryBudget.create.mockResolvedValue({
        id: 'cat-1',
        userId: 'test-user-id',
        category: 'food',
        type: 'expense',
        budgetLimit: new Prisma.Decimal(0),
        isCustom: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .post('/api/v1/budget/categories')
        .send({ category: 'food' });

      expect(res.status).toBe(201);
      expect(res.body.data.category).toBe('food');
      expect(res.body.data.type).toBe('expense');
    });

    it('should create an income category with type income', async () => {
      mockedPrisma.categoryBudget.count.mockResolvedValue(5);
      mockedPrisma.categoryBudget.findUnique.mockResolvedValue(null);
      mockedPrisma.categoryBudget.create.mockResolvedValue({
        id: 'cat-income-1',
        userId: 'test-user-id',
        category: 'salary',
        type: 'income',
        budgetLimit: new Prisma.Decimal(0),
        isCustom: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .post('/api/v1/budget/categories')
        .send({ category: 'salary', type: 'income' });

      expect(res.status).toBe(201);
      expect(res.body.data.category).toBe('salary');
      expect(res.body.data.type).toBe('income');
    });

    it('should reject invalid type value', async () => {
      const res = await request(app)
        .post('/api/v1/budget/categories')
        .send({ category: 'test', type: 'invalid' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('type');
    });

    it('should create a category with budget_limit', async () => {
      mockedPrisma.categoryBudget.count.mockResolvedValue(5);
      mockedPrisma.categoryBudget.findUnique.mockResolvedValue(null);
      mockedPrisma.categoryBudget.create.mockResolvedValue({
        id: 'cat-2',
        userId: 'test-user-id',
        category: 'transport',
        type: 'expense',
        budgetLimit: new Prisma.Decimal(5000),
        isCustom: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .post('/api/v1/budget/categories')
        .send({ category: 'transport', budget_limit: 5000 });

      expect(res.status).toBe(201);
      expect(res.body.data.budget_limit).toBe(5000);
    });

    it('should reject duplicate category name', async () => {
      mockedPrisma.categoryBudget.count.mockResolvedValue(5);
      mockedPrisma.categoryBudget.findUnique.mockResolvedValue({
        id: 'cat-1',
        userId: 'test-user-id',
        category: 'food',
        type: 'expense',
        budgetLimit: new Prisma.Decimal(0),
        isCustom: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .post('/api/v1/budget/categories')
        .send({ category: 'food' });

      expect(res.status).toBe(409);
      expect(res.body.message).toContain('已存在');
    });

    it('should reject when category limit of 50 reached', async () => {
      mockedPrisma.categoryBudget.count.mockResolvedValue(50);

      const res = await request(app)
        .post('/api/v1/budget/categories')
        .send({ category: 'newcat' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('上限');
    });

    it('should reject empty category name', async () => {
      const res = await request(app)
        .post('/api/v1/budget/categories')
        .send({ category: '' });

      expect(res.status).toBe(400);
    });
  });

  // ==========================================
  // GET /budget/categories with type filter
  // ==========================================
  describe('GET /api/v1/budget/categories', () => {
    it('should return all categories when no type filter', async () => {
      mockedPrisma.categoryBudget.findMany.mockResolvedValue([
        { id: 'cb1', userId: 'test-user-id', category: 'food', type: 'expense', budgetLimit: new Prisma.Decimal(8000), isCustom: false, createdAt: new Date(), updatedAt: new Date() },
        { id: 'cb2', userId: 'test-user-id', category: 'salary', type: 'income', budgetLimit: new Prisma.Decimal(0), isCustom: false, createdAt: new Date(), updatedAt: new Date() },
      ]);

      const res = await request(app).get('/api/v1/budget/categories');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });

    it('should filter by type=expense', async () => {
      mockedPrisma.categoryBudget.findMany.mockResolvedValue([
        { id: 'cb1', userId: 'test-user-id', category: 'food', type: 'expense', budgetLimit: new Prisma.Decimal(8000), isCustom: false, createdAt: new Date(), updatedAt: new Date() },
      ]);

      const res = await request(app).get('/api/v1/budget/categories?type=expense');

      expect(res.status).toBe(200);
      expect(mockedPrisma.categoryBudget.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'test-user-id', type: 'expense' } })
      );
    });

    it('should filter by type=income', async () => {
      mockedPrisma.categoryBudget.findMany.mockResolvedValue([
        { id: 'cb2', userId: 'test-user-id', category: 'salary', type: 'income', budgetLimit: new Prisma.Decimal(0), isCustom: false, createdAt: new Date(), updatedAt: new Date() },
      ]);

      const res = await request(app).get('/api/v1/budget/categories?type=income');

      expect(res.status).toBe(200);
      expect(mockedPrisma.categoryBudget.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'test-user-id', type: 'income' } })
      );
    });
  });

  // ==========================================
  // PUT /budget/categories
  // ==========================================
  describe('PUT /api/v1/budget/categories', () => {
    it('should batch update category budget limits', async () => {
      mockedPrisma.categoryBudget.findUnique.mockResolvedValue({
        id: 'cat-1',
        userId: 'test-user-id',
        category: 'food',
        type: 'expense',
        budgetLimit: new Prisma.Decimal(0),
        isCustom: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockedPrisma.categoryBudget.update.mockResolvedValue({
        id: 'cat-1',
        userId: 'test-user-id',
        category: 'food',
        type: 'expense',
        budgetLimit: new Prisma.Decimal(8000),
        isCustom: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .put('/api/v1/budget/categories')
        .send({
          categories: [{ category: 'food', budget_limit: 8000 }],
        });

      expect(res.status).toBe(200);
      expect(res.body.data[0].category).toBe('food');
      expect(res.body.data[0].budget_limit).toBe(8000);
    });

    it('should reject when category does not exist', async () => {
      mockedPrisma.categoryBudget.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/v1/budget/categories')
        .send({
          categories: [{ category: 'nonexistent', budget_limit: 1000 }],
        });

      expect(res.status).toBe(404);
    });

    it('should reject empty categories array', async () => {
      const res = await request(app)
        .put('/api/v1/budget/categories')
        .send({ categories: [] });

      expect(res.status).toBe(400);
    });

    it('should reject negative budget_limit', async () => {
      const res = await request(app)
        .put('/api/v1/budget/categories')
        .send({
          categories: [{ category: 'food', budget_limit: -100 }],
        });

      expect(res.status).toBe(400);
    });
  });

  // ==========================================
  // DELETE /budget/categories/:category
  // ==========================================
  describe('DELETE /api/v1/budget/categories/:category', () => {
    it('should delete a custom category and reassign transactions', async () => {
      mockedPrisma.categoryBudget.findUnique.mockResolvedValue({
        id: 'cat-1',
        userId: 'test-user-id',
        category: 'snacks',
        type: 'expense',
        budgetLimit: new Prisma.Decimal(0),
        isCustom: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockedPrisma.transaction.updateMany.mockResolvedValue({ count: 3 });
      mockedPrisma.categoryBudget.delete.mockResolvedValue({
        id: 'cat-1',
        userId: 'test-user-id',
        category: 'snacks',
        type: 'expense',
        budgetLimit: new Prisma.Decimal(0),
        isCustom: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .delete('/api/v1/budget/categories/snacks');

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('刪除成功');

      // Verify transactions were reassigned to "other"
      expect(mockedPrisma.transaction.updateMany).toHaveBeenCalledWith({
        where: { userId: 'test-user-id', category: 'snacks' },
        data: { category: 'other' },
      });
    });

    it('should reject deleting non-custom (system) category', async () => {
      mockedPrisma.categoryBudget.findUnique.mockResolvedValue({
        id: 'cat-sys',
        userId: 'test-user-id',
        category: 'food',
        type: 'expense',
        budgetLimit: new Prisma.Decimal(0),
        isCustom: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .delete('/api/v1/budget/categories/food');

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('系統預設');
    });

    it('should return 404 for non-existent category', async () => {
      mockedPrisma.categoryBudget.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .delete('/api/v1/budget/categories/nonexistent');

      expect(res.status).toBe(404);
    });
  });

  // ==========================================
  // GET /budget/summary
  // ==========================================
  describe('GET /api/v1/budget/summary', () => {
    it('should return monthly summary with category breakdown', async () => {
      mockedPrisma.user.findUnique.mockResolvedValue({
        id: 'test-user-id',
        name: 'Test',
        email: 'test@test.com',
        passwordHash: 'hash',
        persona: 'gentle',
        aiEngine: 'gemini',
        monthlyBudget: new Prisma.Decimal(30000),
        currency: 'TWD',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockedPrisma.transaction.findMany.mockResolvedValue([
        {
          id: 't1',
          userId: 'test-user-id',
          type: 'expense',
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
          type: 'expense',
          amount: new Prisma.Decimal(3000),
          category: 'transport',
          merchant: null,
          rawText: '計程車',
          note: null,
          transactionDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      mockedPrisma.categoryBudget.findMany.mockResolvedValue([
        {
          id: 'cb1',
          userId: 'test-user-id',
          category: 'food',
          type: 'expense',
          budgetLimit: new Prisma.Decimal(8000),
          isCustom: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'cb2',
          userId: 'test-user-id',
          category: 'transport',
          type: 'expense',
          budgetLimit: new Prisma.Decimal(5000),
          isCustom: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      (mockedPrisma.transaction.groupBy as ReturnType<typeof vi.fn>).mockResolvedValue([
        { type: 'expense', _sum: { amount: new Prisma.Decimal(8000) } },
      ]);

      const res = await request(app).get('/api/v1/budget/summary');

      expect(res.status).toBe(200);
      const data = res.body.data;
      expect(data.monthly_budget).toBe(30000);
      expect(data.total_spent).toBe(8000);
      expect(data.remaining).toBe(22000);
      expect(data.used_ratio).toBeCloseTo(0.27, 1);
      expect(data.transaction_count).toBe(2);
      expect(data.categories).toHaveLength(2);

      const foodCat = data.categories.find((c: { category: string }) => c.category === 'food');
      expect(foodCat.budget_limit).toBe(8000);
      expect(foodCat.spent).toBe(5000);
      expect(foodCat.remaining).toBe(3000);
    });

    it('should exclude income transactions from budget calculation', async () => {
      mockedPrisma.user.findUnique.mockResolvedValue({
        id: 'test-user-id',
        name: 'Test',
        email: 'test@test.com',
        passwordHash: 'hash',
        persona: 'gentle',
        aiEngine: 'gemini',
        monthlyBudget: new Prisma.Decimal(30000),
        currency: 'TWD',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockedPrisma.transaction.findMany.mockResolvedValue([
        {
          id: 't1',
          userId: 'test-user-id',
          type: 'expense',
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
          type: 'income',
          amount: new Prisma.Decimal(20000),
          category: 'other',
          merchant: null,
          rawText: '薪水',
          note: null,
          transactionDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      mockedPrisma.categoryBudget.findMany.mockResolvedValue([
        {
          id: 'cb1',
          userId: 'test-user-id',
          category: 'food',
          type: 'expense',
          budgetLimit: new Prisma.Decimal(8000),
          isCustom: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      (mockedPrisma.transaction.groupBy as ReturnType<typeof vi.fn>).mockResolvedValue([
        { type: 'expense', _sum: { amount: new Prisma.Decimal(5000) } },
        { type: 'income', _sum: { amount: new Prisma.Decimal(20000) } },
      ]);

      const res = await request(app).get('/api/v1/budget/summary');

      expect(res.status).toBe(200);
      const data = res.body.data;
      // Only the expense (5000) should count, not the income (20000)
      expect(data.total_spent).toBe(5000);
      expect(data.remaining).toBe(25000);
      expect(data.transaction_count).toBe(2); // All transactions counted
      // Category breakdown should only include expense spending
      const foodCat = data.categories.find((c: { category: string }) => c.category === 'food');
      expect(foodCat.spent).toBe(5000);
      // Income category 'other' should not appear in category breakdown (no expense spending)
      const otherCat = data.categories.find((c: { category: string }) => c.category === 'other');
      expect(otherCat).toBeUndefined();
    });

    it('should return 404 for non-existent user', async () => {
      mockedPrisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app).get('/api/v1/budget/summary');

      expect(res.status).toBe(404);
    });
  });
});
