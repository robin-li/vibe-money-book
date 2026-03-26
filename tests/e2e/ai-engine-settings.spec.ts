import { test, expect } from '@playwright/test';
import {
  registerUserViaAPI,
  TEST_PASSWORD,
  loginViaUI,
} from '../fixtures/test-helpers';

/**
 * AI 引擎進階設定 (PRD-F-017 / T-704)
 */
test.describe('AI 引擎設定', () => {
  let authEmail: string;

  const mockProviders = [
    {
      code: 'gemini',
      name: 'Google Gemini',
      models: [
        { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: '快速且經濟實惠', isDefault: true },
        { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: '高品質推理能力', isDefault: false },
      ],
    },
    {
      code: 'openai',
      name: 'OpenAI',
      models: [
        { id: 'gpt-4o', name: 'GPT-4o', description: '多模態旗艦模型', isDefault: true },
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: '經濟實惠的小型模型', isDefault: false },
      ],
    },
    {
      code: 'anthropic',
      name: 'Anthropic',
      models: [
        { id: 'claude-sonnet-4-5-20250514', name: 'Claude Sonnet 4.5', description: '高效的推理與代碼生成', isDefault: true },
      ],
    },
    {
      code: 'xai',
      name: 'xAI',
      models: [
        { id: 'grok-3', name: 'Grok 3', description: '新一代推理模型', isDefault: true },
      ],
    },
  ];

  test.beforeEach(async ({ page, request }) => {
    const user = await registerUserViaAPI(request);
    authEmail = user.email;

    // Mock providers API
    await page.route('**/api/v1/ai/providers', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          message: 'OK',
          data: { providers: mockProviders },
          timestamp: new Date().toISOString(),
        }),
      });
    });

    // Mock AI config API
    await page.route('**/api/v1/ai/config', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          message: 'OK',
          data: {
            hasDefaultKey: { gemini: true, openai: false, anthropic: false, xai: false },
          },
          timestamp: new Date().toISOString(),
        }),
      });
    });

    // Mock profile API
    await page.route('**/api/v1/users/profile', (route, request) => {
      if (request.method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 200,
            message: 'OK',
            data: {
              name: 'E2E Tester',
              email: authEmail,
              persona: 'gentle',
              ai_engine: 'gemini',
              ai_model: 'gemini-2.5-flash',
              monthly_budget: 0,
              ai_instructions: '',
              language: 'zh-TW',
            },
            timestamp: new Date().toISOString(),
          }),
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 200,
            message: 'OK',
            data: { success: true },
            timestamp: new Date().toISOString(),
          }),
        });
      }
    });

    // Mock categories API
    await page.route('**/api/v1/categories*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          message: 'OK',
          data: { categories: [] },
          timestamp: new Date().toISOString(),
        }),
      });
    });
  });

  test('顯示四個供應商選項且 Gemini 為預設選中', async ({ page }) => {
    await loginViaUI(page, authEmail, TEST_PASSWORD);
    await page.goto('/settings');

    // 等待 AI 引擎設定區塊載入
    const section = page.getByLabel('AI 引擎設定');
    await expect(section).toBeVisible({ timeout: 10000 });

    // 四個供應商按鈕
    await expect(page.getByLabel('選擇 Gemini 引擎')).toBeVisible();
    await expect(page.getByLabel('選擇 OpenAI 引擎')).toBeVisible();
    await expect(page.getByLabel('選擇 Anthropic 引擎')).toBeVisible();
    await expect(page.getByLabel('選擇 xAI 引擎')).toBeVisible();

    // Gemini 為預設選中
    await expect(page.getByLabel('選擇 Gemini 引擎')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByLabel('選擇 OpenAI 引擎')).toHaveAttribute('aria-pressed', 'false');
  });

  test('切換供應商時自動選擇預設模型', async ({ page }) => {
    await loginViaUI(page, authEmail, TEST_PASSWORD);
    await page.goto('/settings');

    const section = page.getByLabel('AI 引擎設定');
    await expect(section).toBeVisible({ timeout: 10000 });

    // 初始為 Gemini，模型應為 Gemini 2.5 Flash
    const modelSelect = page.getByLabel('AI 模型');
    await expect(modelSelect).toBeVisible();
    await expect(modelSelect).toHaveValue('gemini-2.5-flash');

    // 切換到 Anthropic
    await page.getByLabel('選擇 Anthropic 引擎').click();
    await expect(page.getByLabel('選擇 Anthropic 引擎')).toHaveAttribute('aria-pressed', 'true');

    // 模型應自動切換為 Claude Sonnet 4.5
    await expect(modelSelect).toHaveValue('claude-sonnet-4-5-20250514');

    // 切換到 xAI
    await page.getByLabel('選擇 xAI 引擎').click();
    await expect(modelSelect).toHaveValue('grok-3');
  });

  test('模型下拉選單顯示正確的可用模型', async ({ page }) => {
    await loginViaUI(page, authEmail, TEST_PASSWORD);
    await page.goto('/settings');

    const section = page.getByLabel('AI 引擎設定');
    await expect(section).toBeVisible({ timeout: 10000 });

    // Gemini 應有 2 個模型選項
    const modelSelect = page.getByLabel('AI 模型');
    const options = modelSelect.locator('option');
    await expect(options).toHaveCount(2);
    await expect(options.nth(0)).toContainText('Gemini 2.5 Flash');
    await expect(options.nth(1)).toContainText('Gemini 2.5 Pro');

    // 切換到 OpenAI 應有 2 個模型
    await page.getByLabel('選擇 OpenAI 引擎').click();
    await expect(options).toHaveCount(2);
    await expect(options.nth(0)).toContainText('GPT-4o');

    // 切換到 Anthropic 應有 1 個模型
    await page.getByLabel('選擇 Anthropic 引擎').click();
    await expect(options).toHaveCount(1);
    await expect(options.nth(0)).toContainText('Claude Sonnet 4.5');
  });

  test('API Key 輸入與顯示/隱藏切換', async ({ page }) => {
    await loginViaUI(page, authEmail, TEST_PASSWORD);
    await page.goto('/settings');

    const section = page.getByLabel('AI 引擎設定');
    await expect(section).toBeVisible({ timeout: 10000 });

    const keyInput = page.getByLabel('gemini API Key');
    await expect(keyInput).toBeVisible();
    await expect(keyInput).toHaveAttribute('type', 'password');

    // 輸入 API Key
    await keyInput.fill('test-api-key-12345');

    // 點擊顯示按鈕
    await page.getByLabel('顯示 API Key').click();
    await expect(keyInput).toHaveAttribute('type', 'text');

    // 點擊隱藏按鈕
    await page.getByLabel('隱藏 API Key').click();
    await expect(keyInput).toHaveAttribute('type', 'password');
  });

  test('驗證 API Key — 有效', async ({ page }) => {
    // Mock validate-key API (成功)
    await page.route('**/api/v1/ai/validate-key', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          message: 'Key 有效',
          data: { valid: true },
          timestamp: new Date().toISOString(),
        }),
      });
    });

    await loginViaUI(page, authEmail, TEST_PASSWORD);
    await page.goto('/settings');

    const section = page.getByLabel('AI 引擎設定');
    await expect(section).toBeVisible({ timeout: 10000 });

    // 輸入 API Key
    await page.getByLabel('gemini API Key').fill('valid-key-12345');

    // 點擊驗證按鈕
    await page.getByLabel('驗證 API Key').click();

    // 應顯示有效訊息
    const status = page.getByRole('status');
    await expect(status).toContainText('✅ 金鑰有效', { timeout: 10000 });
  });

  test('驗證 API Key — 無效', async ({ page }) => {
    // Mock validate-key API (失敗)
    await page.route('**/api/v1/ai/validate-key', (route) => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 400,
          message: 'Invalid API Key',
          data: null,
          timestamp: new Date().toISOString(),
        }),
      });
    });

    await loginViaUI(page, authEmail, TEST_PASSWORD);
    await page.goto('/settings');

    const section = page.getByLabel('AI 引擎設定');
    await expect(section).toBeVisible({ timeout: 10000 });

    // 輸入無效 API Key
    await page.getByLabel('gemini API Key').fill('invalid-key');

    // 點擊驗證
    await page.getByLabel('驗證 API Key').click();

    // 應顯示無效訊息
    const status = page.getByRole('status');
    await expect(status).toContainText('❌ 金鑰無效', { timeout: 10000 });
  });

  test('未輸入 API Key 時驗證按鈕為 disabled', async ({ page }) => {
    await loginViaUI(page, authEmail, TEST_PASSWORD);
    await page.goto('/settings');

    const section = page.getByLabel('AI 引擎設定');
    await expect(section).toBeVisible({ timeout: 10000 });

    // 驗證按鈕應為 disabled（未輸入 Key）
    const validateBtn = page.getByLabel('驗證 API Key');
    await expect(validateBtn).toBeDisabled();
  });

  test('Gemini 有預設 Key 時顯示提示訊息', async ({ page }) => {
    await loginViaUI(page, authEmail, TEST_PASSWORD);
    await page.goto('/settings');

    const section = page.getByLabel('AI 引擎設定');
    await expect(section).toBeVisible({ timeout: 10000 });

    // Gemini 有預設 Key 且使用者未輸入自訂 Key，應顯示提示
    await expect(page.getByText('✅ 已配置預設金鑰，無需手動輸入即可使用 AI 功能')).toBeVisible();
  });

  test('切換供應商後 API Key 輸入框對應更新', async ({ page }) => {
    await loginViaUI(page, authEmail, TEST_PASSWORD);
    await page.goto('/settings');

    const section = page.getByLabel('AI 引擎設定');
    await expect(section).toBeVisible({ timeout: 10000 });

    // 在 Gemini 輸入 Key
    await page.getByLabel('gemini API Key').fill('gemini-key-123');

    // 切換到 Anthropic
    await page.getByLabel('選擇 Anthropic 引擎').click();

    // API Key 輸入框應為空（Anthropic 的 Key）
    const anthropicKeyInput = page.getByLabel('anthropic API Key');
    await expect(anthropicKeyInput).toBeVisible();
    await expect(anthropicKeyInput).toHaveValue('');

    // 切換回 Gemini
    await page.getByLabel('選擇 Gemini 引擎').click();

    // 應恢復之前輸入的 Key
    const geminiKeyInput = page.getByLabel('gemini API Key');
    await expect(geminiKeyInput).toHaveValue('gemini-key-123');
  });

  test('切換供應商後驗證狀態重置', async ({ page }) => {
    // Mock validate-key API (成功)
    await page.route('**/api/v1/ai/validate-key', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          message: 'Key 有效',
          data: { valid: true },
          timestamp: new Date().toISOString(),
        }),
      });
    });

    await loginViaUI(page, authEmail, TEST_PASSWORD);
    await page.goto('/settings');

    const section = page.getByLabel('AI 引擎設定');
    await expect(section).toBeVisible({ timeout: 10000 });

    // 在 Gemini 驗證成功
    await page.getByLabel('gemini API Key').fill('valid-gemini-key');
    await page.getByLabel('驗證 API Key').click();
    await expect(page.getByRole('status')).toContainText('✅ 金鑰有效', { timeout: 10000 });

    // 切換到 Anthropic — 驗證狀態應重置
    await page.getByLabel('選擇 Anthropic 引擎').click();
    await expect(page.getByRole('status')).not.toBeVisible();
  });
});
