import { test, expect } from '@playwright/test';
import {
  registerUserViaAPI,
  TEST_PASSWORD,
  loginViaUI,
} from '../fixtures/test-helpers';

const today = new Date().toISOString().split('T')[0];

/** Mock AI query API 回應 */
function mockAIQueryResponse(
  matchedIds: string[],
  summary: { text: string; total_amount: number },
  timeRange?: { start_date: string; end_date: string }
) {
  return JSON.stringify({
    code: 200,
    message: '查詢成功',
    data: {
      summary: {
        text: summary.text,
        emotion_tag: 'sarcastic_warning',
        total_amount: summary.total_amount,
        match_count: matchedIds.length,
      },
      matched_transaction_ids: matchedIds,
      time_range: timeRange ?? { start_date: '2026-03-01', end_date: '2026-03-31' },
    },
    timestamp: new Date().toISOString(),
  });
}

/** Mock 交易列表 API 回應 */
function mockTransactionListResponse(
  items: Array<{
    id: string;
    amount: number;
    category: string;
    merchant: string;
    transaction_date: string;
    note?: string;
  }>
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
      total: items.length,
      page: 1,
      limit: 200,
    },
    timestamp: new Date().toISOString(),
  });
}

/** Mock 類別 API */
function mockCategoriesResponse() {
  return JSON.stringify({
    code: 200,
    data: { categories: [{ category: 'food', type: 'expense' }, { category: '寵物用品', type: 'expense' }] },
    timestamp: new Date().toISOString(),
  });
}

const SAMPLE_TRANSACTIONS = [
  { id: 'txn-1', amount: 600, category: '寵物用品', merchant: '阿貓阿狗', transaction_date: today },
  { id: 'txn-2', amount: 1200, category: '寵物用品', merchant: '阿貓阿狗', transaction_date: today },
  { id: 'txn-3', amount: 180, category: 'food', merchant: '拉麵店', transaction_date: today },
];

/** 登入後導航至歷史紀錄頁面 */
async function loginAndGoToHistory(
  page: import('@playwright/test').Page,
  email: string,
  password: string
) {
  await loginViaUI(page, email, password);
  await page.getByRole('link', { name: '記錄' }).click();
  await page.waitForURL('/history', { timeout: 10000 });
}

test.describe('AI 語義查詢', () => {
  let authEmail: string;

  test.beforeEach(async ({ request }) => {
    const user = await registerUserViaAPI(request);
    authEmail = user.email;
  });

  test('輸入查詢 → 顯示 AI 回饋 + 篩選匹配帳目', async ({ page }) => {
    // Mock APIs
    let queryIntercepted = false;
    await page.route('**/api/v1/ai/query', (route) => {
      queryIntercepted = true;
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: mockAIQueryResponse(
          ['txn-1', 'txn-2'],
          { text: '你在阿貓阿狗花了 1800 元！', total_amount: 1800 }
        ),
      });
    });

    await page.route('**/api/v1/transactions*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: mockTransactionListResponse(SAMPLE_TRANSACTIONS),
      });
    });

    await page.route('**/api/v1/budget/categories*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: mockCategoriesResponse(),
      });
    });

    await loginAndGoToHistory(page, authEmail, TEST_PASSWORD);

    // 輸入 AI 查詢
    const input = page.getByLabel('消費描述輸入');
    await input.fill('阿貓阿狗花了多少');
    await page.getByLabel('送出').click();

    // 等待 AI 回饋卡片出現
    const feedback = page.getByTestId('ai-query-feedback');
    await expect(feedback).toBeVisible({ timeout: 10000 });
    await expect(feedback).toContainText('1800');

    // 確認 AI query API 被呼叫
    expect(queryIntercepted).toBe(true);

    // 確認匹配的交易顯示
    await expect(page.getByText('阿貓阿狗')).toBeVisible();
  });

  test('操作手動篩選器 → 清除 AI 查詢結果', async ({ page }) => {
    await page.route('**/api/v1/ai/query', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: mockAIQueryResponse(
          ['txn-1'],
          { text: '測試回饋', total_amount: 600 }
        ),
      });
    });

    await page.route('**/api/v1/transactions*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: mockTransactionListResponse(SAMPLE_TRANSACTIONS),
      });
    });

    await page.route('**/api/v1/budget/categories*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: mockCategoriesResponse(),
      });
    });

    await loginAndGoToHistory(page, authEmail, TEST_PASSWORD);

    // 先執行 AI 查詢
    const input = page.getByLabel('消費描述輸入');
    await input.fill('測試查詢');
    await page.getByLabel('送出').click();
    await expect(page.getByTestId('ai-query-feedback')).toBeVisible({ timeout: 10000 });

    // 操作類別篩選器 → AI 回饋應消失
    await page.getByTestId('category-filter').selectOption('food');
    await expect(page.getByTestId('ai-query-feedback')).not.toBeVisible({ timeout: 5000 });
  });

  test('清除篩選按鈕 → 一次清除所有條件', async ({ page }) => {
    await page.route('**/api/v1/ai/query', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: mockAIQueryResponse(
          ['txn-1'],
          { text: '測試', total_amount: 600 }
        ),
      });
    });

    await page.route('**/api/v1/transactions*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: mockTransactionListResponse(SAMPLE_TRANSACTIONS),
      });
    });

    await page.route('**/api/v1/budget/categories*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: mockCategoriesResponse(),
      });
    });

    await loginAndGoToHistory(page, authEmail, TEST_PASSWORD);

    // 執行 AI 查詢
    const input = page.getByLabel('消費描述輸入');
    await input.fill('查詢');
    await page.getByLabel('送出').click();
    await expect(page.getByTestId('ai-query-feedback')).toBeVisible({ timeout: 10000 });

    // 清除篩選按鈕應出現
    const resetBtn = page.getByTestId('reset-filters-btn');
    await expect(resetBtn).toBeVisible({ timeout: 5000 });

    // 點擊清除
    await resetBtn.click();

    // AI 回饋應消失
    await expect(page.getByTestId('ai-query-feedback')).not.toBeVisible({ timeout: 5000 });
    // 清除按鈕也應消失
    await expect(resetBtn).not.toBeVisible({ timeout: 3000 });
  });
});
