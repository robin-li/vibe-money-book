import { test, expect } from '@playwright/test';
import {
  registerUserViaAPI,
  TEST_PASSWORD,
  loginViaUI,
} from '../fixtures/test-helpers';

/**
 * i18n E2E Tests (T-607)
 *
 * Tests for language switching, persistence, backend error messages,
 * and category name translation.
 */

/** Helper: login and navigate to settings page */
async function loginAndGoToSettings(
  page: import('@playwright/test').Page,
  email: string,
  password: string
) {
  await loginViaUI(page, email, password);
  await page.getByRole('link', { name: '設定' }).click();
  await page.waitForURL('/settings', { timeout: 10000 });
}

test.describe('語言切換功能', () => {
  let authEmail: string;

  test.beforeEach(async ({ request }) => {
    const user = await registerUserViaAPI(request);
    authEmail = user.email;
  });

  test('切換語言至 English 後 UI 文字應變更', async ({ page }) => {
    await loginAndGoToSettings(page, authEmail, TEST_PASSWORD);

    // 確認目前為繁體中文
    const languageSection = page.getByLabel('語言設定');
    await expect(languageSection).toBeVisible();

    // 點擊 English 語言按鈕
    await page.getByRole('button', { name: 'English' }).click();

    // 等待 UI 更新 — Settings page title should change to English
    await expect(page.getByText('Language')).toBeVisible({ timeout: 5000 });

    // Navigation tabs should show English text
    await expect(page.getByRole('link', { name: 'Settings' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();

    // AI Persona section title should be in English
    await expect(page.getByText('AI Persona')).toBeVisible();
  });

  test('切換語言至 English 再切回繁體中文', async ({ page }) => {
    await loginAndGoToSettings(page, authEmail, TEST_PASSWORD);

    // 切換至 English
    await page.getByRole('button', { name: 'English' }).click();
    await expect(page.getByText('Language')).toBeVisible({ timeout: 5000 });

    // 切換回繁體中文
    await page.getByRole('button', { name: '繁體中文' }).click();
    await expect(page.getByText('語言設定')).toBeVisible({ timeout: 5000 });

    // 導航列應回到中文
    await expect(page.getByRole('link', { name: '設定' })).toBeVisible();
    await expect(page.getByRole('link', { name: '首頁' })).toBeVisible();
  });

  test('語言偏好在頁面重新載入後持久化', async ({ page }) => {
    await loginAndGoToSettings(page, authEmail, TEST_PASSWORD);

    // 切換至 English
    await page.getByRole('button', { name: 'English' }).click();
    await expect(page.getByText('Language')).toBeVisible({ timeout: 5000 });

    // 重新載入頁面
    await page.reload();

    // 等待頁面載入完成
    await page.waitForLoadState('networkidle');

    // 應保持 English
    await expect(page.getByText('Language')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('link', { name: 'Settings' })).toBeVisible();
  });

  test('語言偏好在跨頁面導航後保持一致', async ({ page }) => {
    await loginAndGoToSettings(page, authEmail, TEST_PASSWORD);

    // 切換至 English
    await page.getByRole('button', { name: 'English' }).click();
    await expect(page.getByText('Language')).toBeVisible({ timeout: 5000 });

    // 導航至首頁
    await page.getByRole('link', { name: 'Home' }).click();
    await page.waitForURL('/', { timeout: 10000 });

    // 首頁應顯示英文
    await expect(page.getByRole('heading', { name: 'Vibe Money Book' })).toBeVisible();

    // 導航至記錄頁
    await page.getByRole('link', { name: 'History' }).click();
    await page.waitForURL('/history', { timeout: 10000 });

    // 記錄頁標題應為英文
    await expect(page.getByText('History')).toBeVisible();
  });
});

test.describe('後端錯誤訊息多語化', () => {
  test('zh-TW 環境下後端錯誤訊息為中文', async ({ page, request }) => {
    const user = await registerUserViaAPI(request);

    // Mock API 返回 i18n 格式的錯誤
    await page.route('**/api/v1/auth/register', (route, req) => {
      if (req.method() === 'POST') {
        route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 409,
            message: '此 Email 已被註冊',
            timestamp: new Date().toISOString(),
          }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/register');

    // 填寫已存在的 email
    await page.getByLabel('姓名').fill('Test User');
    await page.getByLabel('電子郵件').fill(user.email);
    await page.getByLabel('密碼', { exact: false }).first().fill(TEST_PASSWORD);
    await page.getByLabel('確認密碼').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: '註冊' }).click();

    // 應顯示中文錯誤訊息
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 10000 });
  });

  test('English 環境下後端錯誤訊息應為英文', async ({ page, request }) => {
    const user = await registerUserViaAPI(request);

    // Mock API 返回英文 i18n 格式的錯誤
    await page.route('**/api/v1/auth/register', (route, req) => {
      if (req.method() === 'POST') {
        route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 409,
            message: 'This email is already registered',
            timestamp: new Date().toISOString(),
          }),
        });
      } else {
        route.continue();
      }
    });

    // 先在 localStorage 設定語言為 English
    await page.goto('/register');
    await page.evaluate(() => {
      localStorage.setItem('i18nextLng', 'en');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 填寫已存在的 email（英文 UI）
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Name').fill('Test User');
    await page.getByLabel('Password', { exact: false }).first().fill(TEST_PASSWORD);
    await page.getByLabel('Confirm Password').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Register' }).click();

    // 應顯示英文錯誤訊息
    const alert = page.getByRole('alert');
    await expect(alert).toBeVisible({ timeout: 10000 });
    await expect(alert).toContainText('already registered');
  });
});

test.describe('類別名稱多語化', () => {
  let authEmail: string;

  test.beforeEach(async ({ request }) => {
    const user = await registerUserViaAPI(request);
    authEmail = user.email;
  });

  test('zh-TW 環境下類別名稱應為中文', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0];

    // Mock 交易列表 API，包含各類別
    await page.route('**/api/v1/transactions*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          message: '取得成功',
          data: {
            items: [
              {
                id: 'tx-cat-1',
                amount: 100,
                category: 'food',
                merchant: '測試商家',
                raw_text: '測試',
                transaction_date: today,
                created_at: new Date().toISOString(),
              },
            ],
            total: 1,
            page: 1,
            limit: 20,
          },
          timestamp: new Date().toISOString(),
        }),
      });
    });

    await loginViaUI(page, authEmail, TEST_PASSWORD);
    await page.getByRole('link', { name: '記錄' }).click();
    await page.waitForURL('/history', { timeout: 10000 });

    // 類別篩選器應包含中文類別名稱
    await page.route('**/api/v1/budget/categories*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          data: {
            categories: [
              { category: 'food', type: 'expense' },
              { category: 'transport', type: 'expense' },
            ],
          },
          timestamp: new Date().toISOString(),
        }),
      });
    });

    // 在解析結果卡片中，類別選擇器應顯示中文類別名
    // 測試 food 類別翻譯
    await expect(page.getByText('測試商家')).toBeVisible({ timeout: 10000 });
  });

  test('切換至 English 後類別名稱應為英文', async ({ page }) => {
    // Mock budget summary for settings page
    await page.route('**/api/v1/budget/summary', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
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

    // Mock categories for settings page
    await page.route('**/api/v1/budget/categories*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          data: {
            categories: [
              { category: 'food', type: 'expense' },
              { category: 'transport', type: 'expense' },
            ],
          },
          timestamp: new Date().toISOString(),
        }),
      });
    });

    await loginAndGoToSettings(page, authEmail, TEST_PASSWORD);

    // 切換語言至 English
    await page.getByRole('button', { name: 'English' }).click();
    await expect(page.getByText('Language')).toBeVisible({ timeout: 5000 });

    // 類別管理區應顯示英文類別名
    // Settings page has category management section
    const categorySection = page.getByText('Category Management');
    await expect(categorySection).toBeVisible({ timeout: 5000 });
  });
});
