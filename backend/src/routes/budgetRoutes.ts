import { Router, Response, NextFunction } from 'express';
import { authMiddleware, AuthRequest } from '../middlewares/auth';
import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';
import { ApiResponse } from '../types';

const router = Router();

// POST /budget/categories - 新增類別
router.post('/categories', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { category } = req.body;

    if (!category || typeof category !== 'string' || !category.trim()) {
      throw new AppError('請提供類別名稱', 400);
    }

    const trimmed = category.trim();

    // Check duplicate
    const existing = await prisma.categoryBudget.findUnique({
      where: { userId_category: { userId, category: trimmed } },
    });

    if (existing) {
      throw new AppError('該類別已存在', 409);
    }

    const created = await prisma.categoryBudget.create({
      data: {
        userId,
        category: trimmed,
        isCustom: true,
        budgetLimit: 0,
      },
    });

    const response: ApiResponse<{ id: string; category: string }> = {
      code: 201,
      message: '類別新增成功',
      data: { id: created.id, category: created.category },
      timestamp: new Date().toISOString(),
    };

    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
});

// GET /budget/categories - 取得使用者類別清單
router.get('/categories', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const categories = await prisma.categoryBudget.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    const response: ApiResponse<typeof categories> = {
      code: 200,
      message: '取得成功',
      data: categories,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

// GET /budget/summary - 取得當月預算摘要
router.get('/summary', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('使用者不存在', 404);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        transactionDate: { gte: monthStart, lte: monthEnd },
      },
    });

    const monthlyBudget = Number(user.monthlyBudget);
    const totalSpent = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const remaining = monthlyBudget - totalSpent;
    const usedRatio = monthlyBudget > 0 ? Math.round((totalSpent / monthlyBudget) * 100) / 100 : 0;

    const response: ApiResponse<Record<string, unknown>> = {
      code: 200,
      message: '取得成功',
      data: {
        month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
        monthly_budget: monthlyBudget,
        total_spent: totalSpent,
        remaining,
        used_ratio: usedRatio,
        transaction_count: transactions.length,
      },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

export default router;
