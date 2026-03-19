import { test, expect } from '@playwright/test';
import {
  registerUserViaAPI,
  injectAuthState,
  setMonthlyBudgetViaAPI,
  createTransactionViaAPI,
  TEST_NAME,
} from '../fixtures/test-helpers';

test.describe('預算血條顯示', () => {
  let authToken: string;
  let authEmail: string;
  let authUserId: string;

  test.beforeEach(async ({ page, request }) => {
    const user = await registerUserViaAPI(request);
    authToken = user.token;
    authEmail = user.email;
    authUserId = user.userId;

    await page.goto('/login');
    await injectAuthState(page, authToken, {
      id: authUserId,
      name: TEST_NAME,
      email: authEmail,
    });
  });

  test('未設定預算時顯示預設狀態', async ({ page }) => {
    // Mock budget summary — 未設定預算
    await page.route('**/api/v1/budget/summary', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          message: '取得成功',
          data: {
            month: '2026-03',
            monthly_budget: 0,
            total_spent: 0,
            remaining: 0,
            used_ratio: 0,
            transaction_count: 0,
            categories: [],
          },
          timestamp: new Date().toISOString(),
        }),
      });
    });

    await page.goto('/');

    const budgetSection = page.getByLabel('預算概覽');
    await expect(budgetSection).toBeVisible();
    await expect(budgetSection.getByText('尚未設定預算')).toBeVisible();
  });

  test('安全狀態（>50% 剩餘）— 綠色進度條', async ({ page }) => {
    await page.route('**/api/v1/budget/summary', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          message: '取得成功',
          data: {
            month: '2026-03',
            monthly_budget: 30000,
            total_spent: 10000,
            remaining: 20000,
            used_ratio: 0.33,
            transaction_count: 5,
            categories: [],
          },
          timestamp: new Date().toISOString(),
        }),
      });
    });

    await page.goto('/');

    const budgetSection = page.getByLabel('預算概覽');
    await expect(budgetSection).toBeVisible();

    // 應顯示剩餘百分比
    await expect(budgetSection.getByText('67%')).toBeVisible();

    // 驗證進度條存在且為安全狀態（success class）
    const budgetBar = page.getByTestId('budget-bar');
    await expect(budgetBar).toBeVisible();
    await expect(budgetBar).toHaveClass(/budget-bar-safe/);

    // 內部進度條應為綠色
    const progressBar = budgetBar.getByRole('progressbar');
    await expect(progressBar).toHaveClass(/bg-success/);
  });

  test('警告狀態（20%-50% 剩餘）— 黃色進度條', async ({ page }) => {
    await page.route('**/api/v1/budget/summary', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          message: '取得成功',
          data: {
            month: '2026-03',
            monthly_budget: 30000,
            total_spent: 21000,
            remaining: 9000,
            used_ratio: 0.7,
            transaction_count: 15,
            categories: [],
          },
          timestamp: new Date().toISOString(),
        }),
      });
    });

    await page.goto('/');

    const budgetSection = page.getByLabel('預算概覽');
    await expect(budgetSection).toBeVisible();

    // 應顯示剩餘百分比
    await expect(budgetSection.getByText('30%')).toBeVisible();

    // 進度條應為警告狀態
    const budgetBar = page.getByTestId('budget-bar');
    await expect(budgetBar).toHaveClass(/budget-bar-warning/);

    const progressBar = budgetBar.getByRole('progressbar');
    await expect(progressBar).toHaveClass(/bg-warning/);
  });

  test('危險狀態（<20% 剩餘）— 紅色進度條帶呼吸動畫', async ({ page }) => {
    await page.route('**/api/v1/budget/summary', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          message: '取得成功',
          data: {
            month: '2026-03',
            monthly_budget: 30000,
            total_spent: 27000,
            remaining: 3000,
            used_ratio: 0.9,
            transaction_count: 25,
            categories: [],
          },
          timestamp: new Date().toISOString(),
        }),
      });
    });

    await page.goto('/');

    const budgetSection = page.getByLabel('預算概覽');
    await expect(budgetSection).toBeVisible();

    // 應顯示剩餘百分比
    await expect(budgetSection.getByText('10%')).toBeVisible();

    // 進度條應為危險狀態
    const budgetBar = page.getByTestId('budget-bar');
    await expect(budgetBar).toHaveClass(/budget-bar-danger/);

    const progressBar = budgetBar.getByRole('progressbar');
    await expect(progressBar).toHaveClass(/bg-danger/);
    // 危險狀態有呼吸動畫
    await expect(progressBar).toHaveClass(/animate-budget-pulse/);
  });

  test('超支狀態 — 顯示「超支」文字', async ({ page }) => {
    await page.route('**/api/v1/budget/summary', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          message: '取得成功',
          data: {
            month: '2026-03',
            monthly_budget: 30000,
            total_spent: 35000,
            remaining: -5000,
            used_ratio: 1.17,
            transaction_count: 30,
            categories: [],
          },
          timestamp: new Date().toISOString(),
        }),
      });
    });

    await page.goto('/');

    const budgetSection = page.getByLabel('預算概覽');
    await expect(budgetSection).toBeVisible();
    await expect(budgetSection.getByText('超支')).toBeVisible();
  });

  test('本月支出金額正確顯示', async ({ page }) => {
    await page.route('**/api/v1/budget/summary', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          message: '取得成功',
          data: {
            month: '2026-03',
            monthly_budget: 50000,
            total_spent: 12345,
            remaining: 37655,
            used_ratio: 0.25,
            transaction_count: 8,
            categories: [],
          },
          timestamp: new Date().toISOString(),
        }),
      });
    });

    await page.goto('/');

    const budgetSection = page.getByLabel('預算概覽');
    await expect(budgetSection.getByText('$12,345')).toBeVisible();
    await expect(budgetSection.getByText('$50,000')).toBeVisible();
  });
});
