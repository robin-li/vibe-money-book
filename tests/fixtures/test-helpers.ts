import { type Page, type APIRequestContext } from '@playwright/test';

/** 後端 API base URL */
const API_BASE = process.env.E2E_API_URL ?? 'http://localhost:3000/api/v1';

/** 產生唯一 email 以避免測試間衝突 */
export function uniqueEmail(): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  return `e2e_${ts}_${rand}@test.local`;
}

/** 測試用預設密碼 */
export const TEST_PASSWORD = 'Test1234!';

/** 測試用預設使用者名稱 */
export const TEST_NAME = 'E2E Tester';

/**
 * 透過 API 直接註冊使用者，回傳 token 與 user 資訊。
 * 用於需要已登入狀態但不測試註冊流程的場景。
 */
export async function registerUserViaAPI(
  request: APIRequestContext,
  options?: { name?: string; email?: string; password?: string }
): Promise<{ token: string; email: string; userId: string }> {
  const email = options?.email ?? uniqueEmail();
  const name = options?.name ?? TEST_NAME;
  const password = options?.password ?? TEST_PASSWORD;

  const response = await request.post(`${API_BASE}/auth/register`, {
    data: { name, email, password },
  });

  if (!response.ok()) {
    throw new Error(`Failed to register user via API: ${response.status()} ${await response.text()}`);
  }

  const body = await response.json();
  return {
    token: body.data.token,
    email,
    userId: body.data.user.id,
  };
}

/**
 * 透過 API 登入使用者，回傳 token。
 */
export async function loginUserViaAPI(
  request: APIRequestContext,
  email: string,
  password: string = TEST_PASSWORD
): Promise<string> {
  const response = await request.post(`${API_BASE}/auth/login`, {
    data: { email, password },
  });

  if (!response.ok()) {
    throw new Error(`Failed to login via API: ${response.status()} ${await response.text()}`);
  }

  const body = await response.json();
  return body.data.token;
}

/**
 * 在瀏覽器中設定 localStorage 的認證狀態（模擬已登入）。
 * 必須先導航到任一頁面才能設定 localStorage。
 */
export async function injectAuthState(
  page: Page,
  token: string,
  user: { id: string; name?: string; email: string }
): Promise<void> {
  await page.evaluate(
    ({ token: t, user: u }) => {
      localStorage.setItem('auth_token', t);
      localStorage.setItem(
        'auth_user',
        JSON.stringify({ id: u.id, name: u.name ?? 'E2E Tester', email: u.email })
      );
    },
    { token, user }
  );
}

/**
 * 透過 UI 進行登入。
 */
export async function loginViaUI(
  page: Page,
  email: string,
  password: string = TEST_PASSWORD
): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('密碼').fill(password);
  await page.getByRole('button', { name: '登入' }).click();
  // 等待導航至首頁
  await page.waitForURL('/', { timeout: 10000 });
}

/**
 * 透過 API 建立交易記錄。
 */
export async function createTransactionViaAPI(
  request: APIRequestContext,
  token: string,
  data: {
    amount: number;
    category: string;
    merchant: string;
    transaction_date?: string;
    raw_text?: string;
    note?: string;
  }
): Promise<string> {
  const today = new Date().toISOString().split('T')[0];
  const response = await request.post(`${API_BASE}/transactions`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      amount: data.amount,
      category: data.category,
      merchant: data.merchant,
      raw_text: data.raw_text ?? data.merchant,
      transaction_date: data.transaction_date ?? today,
      note: data.note,
    },
  });

  if (!response.ok()) {
    throw new Error(`Failed to create transaction: ${response.status()} ${await response.text()}`);
  }

  const body = await response.json();
  return body.data.transaction.id;
}

/**
 * 透過 API 更新使用者每月預算。
 */
export async function setMonthlyBudgetViaAPI(
  request: APIRequestContext,
  token: string,
  budget: number
): Promise<void> {
  const response = await request.put(`${API_BASE}/users/profile`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { monthly_budget: budget },
  });

  if (!response.ok()) {
    throw new Error(`Failed to set budget: ${response.status()} ${await response.text()}`);
  }
}

/**
 * Mock AI parse API 回應 — 使用 Playwright route 攔截。
 * 會攔截前端對 /ai/parse 的請求並回傳預設解析結果。
 */
export async function mockAIParseResponse(
  page: Page,
  parsed: {
    amount: number;
    category: string;
    merchant: string;
    date?: string;
    confidence?: number;
    note?: string;
  },
  feedback?: { text: string; emotion_tag: string }
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  await page.route('**/api/v1/ai/parse', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 200,
        message: 'OK',
        data: {
          parsed: {
            amount: parsed.amount,
            category: parsed.category,
            merchant: parsed.merchant,
            date: parsed.date ?? today,
            confidence: parsed.confidence ?? 0.95,
            is_new_category: false,
            suggested_category: null,
            note: parsed.note ?? null,
          },
          feedback: feedback ?? {
            text: '又花錢啦！不過記帳是好習慣～',
            emotion_tag: 'gentle',
          },
          budget_context: null,
        },
        timestamp: new Date().toISOString(),
      }),
    });
  });
}
