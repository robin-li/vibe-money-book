import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E 測試配置
 *
 * 前端：https://localhost:5173（Vite dev server，HTTPS）
 * 後端：http://localhost:3000
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }]],
  timeout: 30000,

  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'https://localhost:5173',
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 15000,
    locale: 'zh-TW',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* 可選：自動啟動前後端 dev server */
  // webServer: [
  //   {
  //     command: 'cd backend && npm run dev',
  //     port: 3000,
  //     reuseExistingServer: !process.env.CI,
  //   },
  //   {
  //     command: 'cd frontend && npm run dev',
  //     url: 'https://localhost:5173',
  //     ignoreHTTPSErrors: true,
  //     reuseExistingServer: !process.env.CI,
  //   },
  // ],
});
