import { Router, Response, NextFunction } from 'express';
import { authMiddleware, AuthRequest } from '../middlewares/auth';
import prisma from '../config/database';
import { createI18nError } from '../middlewares/errorHandler';
import { ApiResponse } from '../types';
import { t } from '../i18n';

const router = Router();

const MAX_CATEGORIES = 50;

// POST /budget/categories - 新增類別
router.post('/categories', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { category, budget_limit, type } = req.body;

    if (!category || typeof category !== 'string' || !category.trim()) {
      throw createI18nError('category_name_required', 400);
    }

    const trimmed = category.trim();

    // Validate type
    const categoryType = type || 'expense';
    if (categoryType !== 'income' && categoryType !== 'expense') {
      throw createI18nError('category_type_invalid', 400);
    }

    // Check category count limit
    const count = await prisma.categoryBudget.count({ where: { userId } });
    if (count >= MAX_CATEGORIES) {
      throw createI18nError('category_limit_reached', 400, undefined, { max: MAX_CATEGORIES });
    }

    // Check duplicate
    const existing = await prisma.categoryBudget.findUnique({
      where: { userId_type_category: { userId, type: categoryType, category: trimmed } },
    });

    if (existing) {
      throw createI18nError('category_already_exists', 409);
    }

    const budgetLimit = budget_limit != null ? Number(budget_limit) : 0;
    if (isNaN(budgetLimit) || budgetLimit < 0) {
      throw createI18nError('budget_limit_invalid', 400);
    }

    const created = await prisma.categoryBudget.create({
      data: {
        userId,
        category: trimmed,
        type: categoryType,
        isCustom: true,
        budgetLimit,
      },
    });

    const response: ApiResponse<{ id: string; category: string; type: string; budget_limit: number }> = {
      code: 201,
      message: t('category_created', req.locale),
      data: { id: created.id, category: created.category, type: created.type, budget_limit: Number(created.budgetLimit) },
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
    const typeFilter = req.query.type as string | undefined;

    const where: { userId: string; type?: string } = { userId };
    if (typeFilter && (typeFilter === 'income' || typeFilter === 'expense')) {
      where.type = typeFilter;
    }

    const categories = await prisma.categoryBudget.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    const response: ApiResponse<typeof categories> = {
      code: 200,
      message: t('fetch_success', req.locale),
      data: categories,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

// PUT /budget/categories - 批次更新類別預算限額
router.put('/categories', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { categories } = req.body;

    if (!Array.isArray(categories) || categories.length === 0) {
      throw createI18nError('categories_list_required', 400);
    }

    const results = [];

    for (const item of categories) {
      if (!item.category || typeof item.category !== 'string') {
        throw createI18nError('category_item_missing', 400);
      }
      if (item.budget_limit == null || isNaN(Number(item.budget_limit)) || Number(item.budget_limit) < 0) {
        throw createI18nError('category_budget_limit_invalid', 400, undefined, { category: item.category });
      }

      const itemType = item.type || 'expense';
      const existing = await prisma.categoryBudget.findUnique({
        where: { userId_type_category: { userId, type: itemType, category: item.category } },
      });

      if (!existing) {
        throw createI18nError('category_not_found_named', 404, undefined, { category: item.category });
      }

      const updated = await prisma.categoryBudget.update({
        where: { userId_type_category: { userId, type: itemType, category: item.category } },
        data: { budgetLimit: Number(item.budget_limit) },
      });

      results.push({
        category: updated.category,
        budget_limit: Number(updated.budgetLimit),
      });
    }

    const response: ApiResponse<typeof results> = {
      code: 200,
      message: t('category_budget_updated', req.locale),
      data: results,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

// DELETE /budget/categories/:category - 刪除自訂類別
router.delete('/categories/:category', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const category = req.params.category as string;
    const type = (req.query.type as string) || 'expense';

    if (type !== 'income' && type !== 'expense') {
      throw createI18nError('category_type_invalid', 400);
    }

    const existing = await prisma.categoryBudget.findUnique({
      where: { userId_type_category: { userId, type, category } },
    });

    if (!existing) {
      throw createI18nError('category_not_found', 404);
    }

    if (!existing.isCustom) {
      throw createI18nError('cannot_delete_default_category', 400);
    }

    // Update related transactions to "other"
    await prisma.transaction.updateMany({
      where: { userId, category, type },
      data: { category: type === 'income' ? 'other_income' : 'other' },
    });

    // Delete the category
    await prisma.categoryBudget.delete({
      where: { userId_type_category: { userId, type, category } },
    });

    const response: ApiResponse<{ category: string }> = {
      code: 200,
      message: t('category_deleted', req.locale),
      data: { category },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

// GET /budget/summary - 取得當月預算摘要（含各類別明細）
router.get('/summary', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw createI18nError('user_not_found', 404);

    // Support optional month query param (format: YYYY-MM)
    const monthParam = req.query.month as string | undefined;
    let year: number, month: number;

    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      const parts = monthParam.split('-');
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
    } else {
      const now = new Date();
      year = now.getFullYear();
      month = now.getMonth();
    }

    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        transactionDate: { gte: monthStart, lte: monthEnd },
      },
    });

    const monthlyBudget = Number(user.monthlyBudget);
    // Only count expense transactions toward budget spent
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const totalSpent = expenseTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const remaining = monthlyBudget - totalSpent;
    const usedRatio = monthlyBudget > 0 ? Math.round((totalSpent / monthlyBudget) * 100) / 100 : 0;

    // Calculate monthly income for display
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);

    // Calculate total asset across ALL transactions (not just current month)
    const allTimeAggregation = await prisma.transaction.groupBy({
      by: ['type'],
      where: { userId },
      _sum: { amount: true },
    });
    const allTimeIncome = Number(allTimeAggregation.find(a => a.type === 'income')?._sum.amount ?? 0);
    const allTimeExpense = Number(allTimeAggregation.find(a => a.type === 'expense')?._sum.amount ?? 0);
    const totalAsset = allTimeIncome - allTimeExpense;

    // Build category breakdown
    const categoryBudgets = await prisma.categoryBudget.findMany({
      where: { userId },
    });

    const categorySpentMap: Record<string, number> = {};
    for (const t of expenseTransactions) {
      categorySpentMap[t.category] = (categorySpentMap[t.category] || 0) + Number(t.amount);
    }

    // Include all categories that have budgets or have spending
    const allCategories = new Set([
      ...categoryBudgets.map(cb => cb.category),
      ...Object.keys(categorySpentMap),
    ]);

    const categoriesDetail = Array.from(allCategories).map(cat => {
      const budget = categoryBudgets.find(cb => cb.category === cat);
      const budgetLimit = budget ? Number(budget.budgetLimit) : 0;
      const spent = categorySpentMap[cat] || 0;
      return {
        category: cat,
        budget_limit: budgetLimit,
        spent,
        remaining: budgetLimit - spent,
      };
    });

    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

    const response: ApiResponse<Record<string, unknown>> = {
      code: 200,
      message: t('fetch_success', req.locale),
      data: {
        month: monthStr,
        monthly_budget: monthlyBudget,
        total_spent: totalSpent,
        remaining,
        used_ratio: usedRatio,
        total_income: totalIncome,
        total_asset: totalAsset,
        all_time_income: allTimeIncome,
        all_time_spent: allTimeExpense,
        transaction_count: transactions.length,
        categories: categoriesDetail,
      },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

export default router;
