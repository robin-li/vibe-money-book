import { test, expect } from '@playwright/test';
import {
  TEST_PASSWORD,
  registerUserViaAPI,
  loginViaUI,
  mockAIParseResponse,
} from '../fixtures/test-helpers';

test.describe('文字記帳流程', () => {
  let authEmail: string;

  test.beforeEach(async ({ page, request }) => {
    // 透過 API 註冊使用者
    const user = await registerUserViaAPI(request);
    authEmail = user.email;
  });

  test('輸入文字 → AI 解析 → 顯示解析結果卡片', async ({ page }) => {
    // Mock AI parse API（在登入前設定，route 會持續生效）
    await mockAIParseResponse(page, {
      amount: 280,
      category: 'food',
      merchant: '拉麵店',
    });

    // 透過 UI 登入，登入後自動導航至首頁
    await loginViaUI(page, authEmail, TEST_PASSWORD);

    // 找到輸入框並輸入消費描述
    const input = page.getByLabel('消費描述輸入');
    await expect(input).toBeVisible();
    await input.fill('中午吃拉麵 280 元');

    // 點擊送出按鈕
    await page.getByLabel('送出').click();

    // 等待解析結果卡片出現
    const resultCard = page.getByRole('region', { name: 'AI 解析結果' });
    await expect(resultCard).toBeVisible({ timeout: 10000 });

    // 驗證解析結果內容
    await expect(resultCard.getByText('280')).toBeVisible();
    await expect(resultCard.getByText('飲食')).toBeVisible();
    await expect(resultCard.getByText('拉麵店')).toBeVisible();
  });

  test('解析結果確認後記帳成功', async ({ page }) => {
    // Mock AI parse 和 transaction create
    await mockAIParseResponse(page, {
      amount: 150,
      category: 'transport',
      merchant: 'Uber',
    });

    // Mock transaction 建立成功
    await page.route('**/api/v1/transactions', (route, request) => {
      if (request.method() === 'POST') {
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 201,
            message: '交易記錄建立成功',
            data: {
              transaction: {
                id: 'tx-mock-001',
                amount: 150,
                category: 'transport',
                merchant: 'Uber',
                raw_text: 'Uber',
                note: null,
                transaction_date: new Date().toISOString().split('T')[0],
                created_at: new Date().toISOString(),
              },
              feedback: {
                feedback_text: '又搭 Uber 了！',
                persona_used: 'gentle',
              },
            },
            timestamp: new Date().toISOString(),
          }),
        });
      } else {
        route.continue();
      }
    });

    await loginViaUI(page, authEmail, TEST_PASSWORD);

    // 輸入消費
    await page.getByLabel('消費描述輸入').fill('搭 Uber 150');
    await page.getByLabel('送出').click();

    // 等待解析結果
    const resultCard = page.getByRole('region', { name: 'AI 解析結果' });
    await expect(resultCard).toBeVisible({ timeout: 10000 });

    // 點擊確認記帳
    await page.getByRole('button', { name: '確認記帳' }).click();

    // 解析結果卡片應消失
    await expect(resultCard).not.toBeVisible({ timeout: 5000 });
  });

  test('解析結果可修改後再確認', async ({ page }) => {
    await mockAIParseResponse(page, {
      amount: 100,
      category: 'food',
      merchant: '便利商店',
    });

    // Mock transaction create
    await page.route('**/api/v1/transactions', (route, request) => {
      if (request.method() === 'POST') {
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 201,
            message: '交易記錄建立成功',
            data: {
              transaction: {
                id: 'tx-mock-002',
                amount: 120,
                category: 'daily',
                merchant: '便利商店',
                raw_text: '便利商店',
                note: null,
                transaction_date: new Date().toISOString().split('T')[0],
                created_at: new Date().toISOString(),
              },
              feedback: null,
            },
            timestamp: new Date().toISOString(),
          }),
        });
      } else {
        route.continue();
      }
    });

    await loginViaUI(page, authEmail, TEST_PASSWORD);

    await page.getByLabel('消費描述輸入').fill('便利商店買東西 100');
    await page.getByLabel('送出').click();

    const resultCard = page.getByRole('region', { name: 'AI 解析結果' });
    await expect(resultCard).toBeVisible({ timeout: 10000 });

    // 點擊「修改」按鈕進入編輯模式
    await page.getByRole('button', { name: '修改' }).click();

    // 修改金額
    const amountInput = resultCard.getByLabel('金額');
    await amountInput.clear();
    await amountInput.fill('120');

    // 修改類別
    const categorySelect = resultCard.getByLabel('類別');
    await categorySelect.selectOption('daily');

    // 點擊確認
    await page.getByRole('button', { name: '確認記帳' }).click();

    // 結果卡片應消失
    await expect(resultCard).not.toBeVisible({ timeout: 5000 });
  });

  test('解析結果取消後回到 idle 狀態', async ({ page }) => {
    await mockAIParseResponse(page, {
      amount: 50,
      category: 'food',
      merchant: '飲料店',
    });

    await loginViaUI(page, authEmail, TEST_PASSWORD);

    await page.getByLabel('消費描述輸入').fill('買飲料 50');
    await page.getByLabel('送出').click();

    const resultCard = page.getByRole('region', { name: 'AI 解析結果' });
    await expect(resultCard).toBeVisible({ timeout: 10000 });

    // 先按「修改」進入編輯模式，再按「取消」
    await page.getByRole('button', { name: '修改' }).click();
    await page.getByRole('button', { name: '取消' }).click();

    // 結果卡片應消失
    await expect(resultCard).not.toBeVisible({ timeout: 5000 });
  });

  test('AI 解析失敗顯示錯誤訊息', async ({ page }) => {
    // Mock AI parse 失敗
    await page.route('**/api/v1/ai/parse', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 500,
          message: 'AI 服務暫時不可用',
          timestamp: new Date().toISOString(),
        }),
      });
    });

    await loginViaUI(page, authEmail, TEST_PASSWORD);

    await page.getByLabel('消費描述輸入').fill('something');
    await page.getByLabel('送出').click();

    // 應顯示錯誤訊息
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 10000 });
  });

  test('送出按鈕在輸入為空時應 disabled', async ({ page }) => {
    await loginViaUI(page, authEmail, TEST_PASSWORD);

    const sendButton = page.getByLabel('送出');
    await expect(sendButton).toBeDisabled();
  });
});
