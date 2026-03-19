import { test, expect } from '@playwright/test';
import {
  uniqueEmail,
  TEST_PASSWORD,
  TEST_NAME,
  loginViaUI,
} from '../fixtures/test-helpers';

test.describe('註冊流程', () => {
  test('成功註冊後跳轉至首頁', async ({ page }) => {
    const email = uniqueEmail();

    await page.goto('/register');

    // 確認頁面標題與表單存在
    await expect(page.getByRole('heading', { name: 'Vibe Money Book' })).toBeVisible();

    // 填寫註冊表單
    await page.getByLabel('使用者名稱').fill(TEST_NAME);
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('密碼', { exact: false }).first().fill(TEST_PASSWORD);
    await page.getByLabel('確認密碼').fill(TEST_PASSWORD);

    // 點擊註冊
    await page.getByRole('button', { name: '註冊' }).click();

    // 應跳轉至首頁 (Dashboard)
    await page.waitForURL('/', { timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Vibe Money Book' })).toBeVisible();
  });

  test('重複 email 顯示錯誤', async ({ page, request }) => {
    const email = uniqueEmail();

    // 先註冊一次
    await page.goto('/register');
    await page.getByLabel('使用者名稱').fill(TEST_NAME);
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('密碼', { exact: false }).first().fill(TEST_PASSWORD);
    await page.getByLabel('確認密碼').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: '註冊' }).click();
    await page.waitForURL('/');

    // 登出（清除 localStorage）
    await page.evaluate(() => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    });

    // 再次用相同 email 註冊
    await page.goto('/register');
    await page.getByLabel('使用者名稱').fill('Another User');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('密碼', { exact: false }).first().fill(TEST_PASSWORD);
    await page.getByLabel('確認密碼').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: '註冊' }).click();

    // 應顯示錯誤訊息
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });
  });

  test('前端表單驗證 — 空欄位', async ({ page }) => {
    await page.goto('/register');

    // 直接點擊註冊（不填任何欄位）
    await page.getByRole('button', { name: '註冊' }).click();

    // 應顯示驗證錯誤
    await expect(page.getByText('請輸入使用者名稱')).toBeVisible();
    await expect(page.getByText('請輸入 Email')).toBeVisible();
    await expect(page.getByText('請輸入密碼')).toBeVisible();
  });

  test('前端表單驗證 — 密碼不一致', async ({ page }) => {
    await page.goto('/register');

    await page.getByLabel('使用者名稱').fill(TEST_NAME);
    await page.getByLabel('Email').fill(uniqueEmail());
    await page.getByLabel('密碼', { exact: false }).first().fill(TEST_PASSWORD);
    await page.getByLabel('確認密碼').fill('DifferentPassword1!');
    await page.getByRole('button', { name: '註冊' }).click();

    await expect(page.getByText('兩次輸入的密碼不一致')).toBeVisible();
  });

  test('註冊頁有「返回登入」連結', async ({ page }) => {
    await page.goto('/register');

    const loginLink = page.getByRole('link', { name: '返回登入' });
    await expect(loginLink).toBeVisible();
    await loginLink.click();

    await page.waitForURL('/login');
  });
});

test.describe('登入流程', () => {
  let testEmail: string;

  test.beforeEach(async ({ page }) => {
    // 建立測試帳號
    testEmail = uniqueEmail();
    await page.goto('/register');
    await page.getByLabel('使用者名稱').fill(TEST_NAME);
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('密碼', { exact: false }).first().fill(TEST_PASSWORD);
    await page.getByLabel('確認密碼').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: '註冊' }).click();
    await page.waitForURL('/');

    // 清除登入狀態
    await page.evaluate(() => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    });
  });

  test('成功登入後跳轉至首頁', async ({ page }) => {
    await loginViaUI(page, testEmail, TEST_PASSWORD);
    await expect(page.getByRole('heading', { name: 'Vibe Money Book' })).toBeVisible();
  });

  test('錯誤密碼顯示錯誤訊息', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('密碼').fill('WrongPassword!');
    await page.getByRole('button', { name: '登入' }).click();

    await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });
  });

  test('前端表單驗證 — 空欄位', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: '登入' }).click();

    await expect(page.getByText('請輸入 Email')).toBeVisible();
    await expect(page.getByText('請輸入密碼')).toBeVisible();
  });

  test('登入頁有「立即註冊」連結', async ({ page }) => {
    await page.goto('/login');

    const registerLink = page.getByRole('link', { name: '立即註冊' });
    await expect(registerLink).toBeVisible();
    await registerLink.click();

    await page.waitForURL('/register');
  });

  test('未登入狀態訪問首頁導向登入頁', async ({ page }) => {
    await page.goto('/');

    // ProtectedRoute 應將使用者導向 /login
    await page.waitForURL('/login', { timeout: 10000 });
  });
});
