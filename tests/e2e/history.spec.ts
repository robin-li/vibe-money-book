import { test, expect } from '@playwright/test';
import {
  registerUserViaAPI,
  TEST_PASSWORD,
  loginViaUI,
} from '../fixtures/test-helpers';

/** 產生 mock 交易清單的 API 回應 */
function mockTransactionListResponse(
  items: Array<{
    id: string;
    amount: number;
    category: string;
    merchant: string;
    transaction_date: string;
    note?: string;
  }>,
  total?: number
) {
  return JSON.stringify({
    code: 200,
    message: '取得成功',
    data: {
      items: items.map((item) => ({
        ...item,
        raw_text: item.merchant,
        created_at: new Date().toISOString(),
      })),
      total: total ?? items.length,
      page: 1,
      limit: 20,
    },
    timestamp: new Date().toISOString(),
  });
}

/** 登入後導航至歷史紀錄頁面 */
async function loginAndGoToHistory(
  page: import('@playwright/test').Page,
  email: string,
  password: string
) {
  await loginViaUI(page, email, password);
  // 透過底部 tab 導航至歷史頁面（client-side routing，不會重新載入）
  await page.getByRole('link', { name: '記錄' }).click();
  await page.waitForURL('/history', { timeout: 10000 });
}

test.describe('交易記錄列表', () => {
  let authEmail: string;

  test.beforeEach(async ({ page, request }) => {
    const user = await registerUserViaAPI(request);
    authEmail = user.email;
  });

  test('顯示交易記錄列表', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0];

    await page.route('**/api/v1/transactions*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: mockTransactionListResponse([
          {
            id: 'tx-1',
            amount: 280,
            category: 'food',
            merchant: '拉麵店',
            transaction_date: today,
          },
          {
            id: 'tx-2',
            amount: 150,
            category: 'transport',
            merchant: 'Uber',
            transaction_date: today,
          },
          {
            id: 'tx-3',
            amount: 500,
            category: 'shopping',
            merchant: '書店',
            transaction_date: today,
            note: '買了一本技術書',
          },
        ]),
      });
    });

    await loginAndGoToHistory(page, authEmail, TEST_PASSWORD);

    const txList = page.getByTestId('transaction-list');
    await expect(txList).toBeVisible({ timeout: 10000 });

    // 驗證交易項目存在
    await expect(page.getByText('拉麵店')).toBeVisible();
    await expect(page.getByText('Uber')).toBeVisible();
    await expect(page.getByText('書店')).toBeVisible();
  });

  test('空列表顯示引導文字', async ({ page }) => {
    await page.route('**/api/v1/transactions*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: mockTransactionListResponse([]),
      });
    });

    await loginAndGoToHistory(page, authEmail, TEST_PASSWORD);

    const emptyState = page.getByTestId('empty-state');
    await expect(emptyState).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('還沒有記帳紀錄')).toBeVisible();
  });

  test('展開交易記錄顯示詳情', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0];

    await page.route('**/api/v1/transactions*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: mockTransactionListResponse([
          {
            id: 'tx-detail-1',
            amount: 350,
            category: 'food',
            merchant: '壽司店',
            transaction_date: today,
            note: '和朋友聚餐',
          },
        ]),
      });
    });

    await loginAndGoToHistory(page, authEmail, TEST_PASSWORD);

    // 點擊交易項目展開
    await page.getByText('壽司店').click();

    // 應顯示詳情
    await expect(page.getByText('和朋友聚餐')).toBeVisible();
    await expect(page.getByTestId('delete-btn')).toBeVisible();
  });

  test('刪除交易記錄 — 確認對話框', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0];

    await page.route('**/api/v1/transactions*', (route, request) => {
      if (request.method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: mockTransactionListResponse([
            {
              id: 'tx-delete-1',
              amount: 200,
              category: 'food',
              merchant: '咖啡廳',
              transaction_date: today,
            },
          ]),
        });
      } else {
        route.continue();
      }
    });

    // Mock DELETE API
    await page.route('**/api/v1/transactions/tx-delete-1', (route, request) => {
      if (request.method() === 'DELETE') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 200,
            message: '刪除成功',
            data: { id: 'tx-delete-1' },
            timestamp: new Date().toISOString(),
          }),
        });
      } else {
        route.continue();
      }
    });

    await loginAndGoToHistory(page, authEmail, TEST_PASSWORD);

    // 展開交易
    await page.getByText('咖啡廳').click();

    // 點擊刪除
    await page.getByTestId('delete-btn').click();

    // 應顯示確認對話框
    const confirmDialog = page.getByTestId('delete-confirm-dialog');
    await expect(confirmDialog).toBeVisible();
    await expect(page.getByText('確定要刪除這筆帳目嗎？')).toBeVisible();

    // 點擊確認刪除
    await page.getByTestId('confirm-delete-btn').click();

    // 刪除後項目消失
    await expect(page.getByText('咖啡廳')).not.toBeVisible({ timeout: 5000 });
  });

  test('刪除交易 — 取消刪除', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0];

    await page.route('**/api/v1/transactions*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: mockTransactionListResponse([
          {
            id: 'tx-cancel-del-1',
            amount: 100,
            category: 'daily',
            merchant: '超市',
            transaction_date: today,
          },
        ]),
      });
    });

    await loginAndGoToHistory(page, authEmail, TEST_PASSWORD);

    // 展開 → 刪除 → 取消
    await page.getByText('超市').first().click();
    await page.getByTestId('delete-btn').click();

    const confirmDialog = page.getByTestId('delete-confirm-dialog');
    await expect(confirmDialog).toBeVisible();

    await page.getByRole('button', { name: '取消' }).click();

    // 確認對話框應消失，交易仍在
    await expect(confirmDialog).not.toBeVisible();
    await expect(page.getByText('超市').first()).toBeVisible();
  });

  test('類別篩選功能', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0];

    await page.route('**/api/v1/transactions*', (route, request) => {
      const url = new URL(request.url());
      const category = url.searchParams.get('category');

      if (category === 'food') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: mockTransactionListResponse([
            {
              id: 'tx-food-1',
              amount: 280,
              category: 'food',
              merchant: '拉麵店',
              transaction_date: today,
            },
          ]),
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: mockTransactionListResponse([
            {
              id: 'tx-all-1',
              amount: 280,
              category: 'food',
              merchant: '拉麵店',
              transaction_date: today,
            },
            {
              id: 'tx-all-2',
              amount: 150,
              category: 'transport',
              merchant: 'Uber',
              transaction_date: today,
            },
          ]),
        });
      }
    });

    // Mock categories
    await page.route('**/api/v1/budget/categories', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          message: '取得成功',
          data: [
            { category: 'food' },
            { category: 'transport' },
            { category: 'entertainment' },
            { category: 'shopping' },
            { category: 'daily' },
            { category: 'medical' },
            { category: 'education' },
            { category: 'other' },
          ],
          timestamp: new Date().toISOString(),
        }),
      });
    });

    await loginAndGoToHistory(page, authEmail, TEST_PASSWORD);

    // 等待初始列表載入
    await expect(page.getByText('拉麵店')).toBeVisible({ timeout: 10000 });

    // 選擇飲食類別篩選
    const categoryFilter = page.getByTestId('category-filter');
    await categoryFilter.selectOption('food');

    // 等待 API 請求完成，篩選後只顯示飲食類
    await expect(page.getByText('拉麵店')).toBeVisible({ timeout: 5000 });
  });

  test('清除篩選按鈕', async ({ page }) => {
    await page.route('**/api/v1/transactions*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: mockTransactionListResponse([]),
      });
    });

    await page.route('**/api/v1/budget/categories', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          message: '取得成功',
          data: [{ category: 'food' }, { category: 'transport' }],
          timestamp: new Date().toISOString(),
        }),
      });
    });

    await loginAndGoToHistory(page, authEmail, TEST_PASSWORD);

    // 設定篩選條件
    await page.getByTestId('category-filter').selectOption('food');

    // 清除篩選按鈕應出現
    const resetBtn = page.getByTestId('reset-filters-btn');
    await expect(resetBtn).toBeVisible({ timeout: 5000 });

    // 點擊清除
    await resetBtn.click();

    // 清除按鈕應消失
    await expect(resetBtn).not.toBeVisible({ timeout: 3000 });
  });

  test('日期範圍篩選', async ({ page }) => {
    await page.route('**/api/v1/transactions*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: mockTransactionListResponse([]),
      });
    });

    await page.route('**/api/v1/budget/categories', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          data: [],
          timestamp: new Date().toISOString(),
        }),
      });
    });

    await loginAndGoToHistory(page, authEmail, TEST_PASSWORD);

    // 設定日期篩選
    const startDate = page.getByTestId('start-date-filter');
    const endDate = page.getByTestId('end-date-filter');

    await startDate.fill('2026-03-01');
    await endDate.fill('2026-03-15');

    // 清除篩選按鈕應出現
    const resetBtn = page.getByTestId('reset-filters-btn');
    await expect(resetBtn).toBeVisible({ timeout: 5000 });
  });
});
