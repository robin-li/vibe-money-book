import { test, expect } from '@playwright/test';
import {
  registerUserViaAPI,
  TEST_PASSWORD,
  loginViaUI,
} from '../fixtures/test-helpers';

/**
 * 統計頁條狀圖交互展開 (PRD-F-016 / T-703)
 */
test.describe('統計頁類別條狀圖展開 / 收合', () => {
  let authEmail: string;

  const mockDistribution = [
    { category: 'food', amount: 2500, percentage: 50 },
    { category: 'transport', amount: 1500, percentage: 30 },
    { category: 'entertainment', amount: 1000, percentage: 20 },
  ];

  const mockTransactions = [
    {
      id: 'tx-drilldown-1',
      amount: 280,
      category: 'food',
      merchant: '拉麵店',
      raw_text: '拉麵店 280',
      transaction_date: new Date().toISOString().split('T')[0],
      type: 'expense',
      note: '和朋友聚餐',
      created_at: new Date().toISOString(),
    },
    {
      id: 'tx-drilldown-2',
      amount: 150,
      category: 'food',
      merchant: '便利商店',
      raw_text: '便利商店 150',
      transaction_date: new Date().toISOString().split('T')[0],
      type: 'expense',
      note: null,
      created_at: new Date().toISOString(),
    },
  ];

  test.beforeEach(async ({ page, request }) => {
    const user = await registerUserViaAPI(request);
    authEmail = user.email;

    // Mock stats distribution API
    await page.route('**/api/v1/stats/distribution*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          message: 'OK',
          data: { distribution: mockDistribution },
          timestamp: new Date().toISOString(),
        }),
      });
    });

    // Mock budget summary API
    await page.route('**/api/v1/budget/summary', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          message: 'OK',
          data: {
            month: new Date().toISOString().slice(0, 7),
            monthly_budget: 30000,
            total_spent: 5000,
            remaining: 25000,
            used_ratio: 0.17,
            transaction_count: 3,
            categories: [],
          },
          timestamp: new Date().toISOString(),
        }),
      });
    });

    // Mock transactions list API (for drilldown)
    await page.route('**/api/v1/transactions?*', (route, request) => {
      if (request.method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 200,
            message: 'OK',
            data: {
              items: mockTransactions,
              total: mockTransactions.length,
              page: 1,
              limit: 50,
            },
            timestamp: new Date().toISOString(),
          }),
        });
      } else {
        route.continue();
      }
    });

    // Mock single transaction detail API (for AI feedback)
    await page.route('**/api/v1/transactions/tx-drilldown-*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          message: 'OK',
          data: {
            id: 'tx-drilldown-1',
            amount: 280,
            category: 'food',
            merchant: '拉麵店',
            transaction_date: new Date().toISOString().split('T')[0],
            type: 'expense',
            note: '和朋友聚餐',
            ai_comment: '又花錢吃拉麵！不過記帳是好習慣～',
          },
          timestamp: new Date().toISOString(),
        }),
      });
    });
  });

  test('點擊條狀圖展開交易記錄列表', async ({ page }) => {
    await loginViaUI(page, authEmail, TEST_PASSWORD);
    await page.goto('/stats');

    // 等待類別排行載入
    const foodBar = page.getByTestId('category-bar-food');
    await expect(foodBar).toBeVisible({ timeout: 10000 });

    // 初始狀態：未展開
    await expect(foodBar).toHaveAttribute('aria-expanded', 'false');

    // 點擊展開
    await foodBar.click();
    await expect(foodBar).toHaveAttribute('aria-expanded', 'true');

    // 等待交易列表載入
    const txList = page.getByTestId('category-tx-list');
    await expect(txList).toBeVisible({ timeout: 10000 });

    // 應顯示交易記錄
    await expect(page.getByTestId('drilldown-tx-tx-drilldown-1')).toBeVisible();
    await expect(page.getByTestId('drilldown-tx-tx-drilldown-2')).toBeVisible();
  });

  test('再次點擊條狀圖收合列表', async ({ page }) => {
    await loginViaUI(page, authEmail, TEST_PASSWORD);
    await page.goto('/stats');

    const foodBar = page.getByTestId('category-bar-food');
    await expect(foodBar).toBeVisible({ timeout: 10000 });

    // 展開
    await foodBar.click();
    await expect(foodBar).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByTestId('category-tx-list')).toBeVisible({ timeout: 10000 });

    // 收合
    await foodBar.click();
    await expect(foodBar).toHaveAttribute('aria-expanded', 'false');
  });

  test('展開後點擊交易記錄查看明細與 AI 評論', async ({ page }) => {
    await loginViaUI(page, authEmail, TEST_PASSWORD);
    await page.goto('/stats');

    const foodBar = page.getByTestId('category-bar-food');
    await expect(foodBar).toBeVisible({ timeout: 10000 });
    await foodBar.click();

    // 等待交易列表載入
    await expect(page.getByTestId('category-tx-list')).toBeVisible({ timeout: 10000 });

    // 點擊第一筆交易展開明細
    const txToggle = page.getByTestId('drilldown-tx-toggle-tx-drilldown-1');
    await expect(txToggle).toHaveAttribute('aria-expanded', 'false');
    await txToggle.click();
    await expect(txToggle).toHaveAttribute('aria-expanded', 'true');

    // 應顯示 AI 評論（lazy loaded）
    await expect(page.getByText('又花錢吃拉麵！不過記帳是好習慣～')).toBeVisible({ timeout: 10000 });
  });

  test('展開一個類別後點擊另一個類別，前一個自動收合', async ({ page }) => {
    await loginViaUI(page, authEmail, TEST_PASSWORD);
    await page.goto('/stats');

    const foodBar = page.getByTestId('category-bar-food');
    const transportBar = page.getByTestId('category-bar-transport');
    await expect(foodBar).toBeVisible({ timeout: 10000 });

    // 展開 food
    await foodBar.click();
    await expect(foodBar).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByTestId('category-tx-list')).toBeVisible({ timeout: 10000 });

    // 點擊 transport，food 應收合
    await transportBar.click();
    await expect(transportBar).toHaveAttribute('aria-expanded', 'true');
    await expect(foodBar).toHaveAttribute('aria-expanded', 'false');
  });

  test('切換收入/支出 Tab 時重置展開狀態', async ({ page }) => {
    await loginViaUI(page, authEmail, TEST_PASSWORD);
    await page.goto('/stats');

    const foodBar = page.getByTestId('category-bar-food');
    await expect(foodBar).toBeVisible({ timeout: 10000 });

    // 展開 food
    await foodBar.click();
    await expect(foodBar).toHaveAttribute('aria-expanded', 'true');

    // 切換到收入 Tab
    await page.getByTestId('tab-income').click();

    // 切換回支出 Tab
    await page.getByTestId('tab-expense').click();

    // food 應不再展開
    const foodBarAfter = page.getByTestId('category-bar-food');
    await expect(foodBarAfter).toBeVisible({ timeout: 10000 });
    await expect(foodBarAfter).toHaveAttribute('aria-expanded', 'false');
  });

  test('空類別展開時顯示無交易記錄提示', async ({ page }) => {
    // Override transactions mock to return empty
    await page.route('**/api/v1/transactions?*', (route, request) => {
      if (request.method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 200,
            message: 'OK',
            data: { items: [], total: 0, page: 1, limit: 50 },
            timestamp: new Date().toISOString(),
          }),
        });
      } else {
        route.continue();
      }
    });

    await loginViaUI(page, authEmail, TEST_PASSWORD);
    await page.goto('/stats');

    const foodBar = page.getByTestId('category-bar-food');
    await expect(foodBar).toBeVisible({ timeout: 10000 });
    await foodBar.click();

    // 應顯示空列表提示
    const emptyHint = page.getByTestId('category-tx-empty');
    await expect(emptyHint).toBeVisible({ timeout: 10000 });
    await expect(emptyHint).toContainText('此類別無交易記錄');
  });
});
