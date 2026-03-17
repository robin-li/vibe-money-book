# 04 CI/CD 規格文件

> **專案名稱**：Vibe Money Book — 語音記帳應用
> **本文件定義持續整合與持續部署策略**，由 Dev Plan T-104（CI 基礎建設）與 T-401（Docker 容器化）參照。
> **最後更新**：2026-03-17

---

## 1. 概述

### 1.1 CI/CD 時間線

| 階段 | 建立時機 | 內容 | 對應任務 |
|------|---------|------|---------|
| **CI 基礎建設** | M1（T-104） | Lint → Type Check → Unit Test → Build | `ci.yml` |
| **E2E 擴充** | M4（T-401） | 補充 Playwright E2E 測試 Job | 更新 `ci.yml` |
| **容器化部署** | M4（T-401） | Docker + docker-compose | `Dockerfile`、`docker-compose.yml` |

### 1.2 品質閘門 (Quality Gates)

| Gate | 檢查項目 | 觸發時機 | 失敗處理 | 備註 |
|------|---------|---------|---------|------|
| **Gate 1** | ESLint 靜態分析 | 每次 PR / push to main | 阻擋合併 | M1 起生效 |
| **Gate 2** | TypeScript Type Check (`tsc --noEmit`) | 每次 PR / push to main | 阻擋合併 | M1 起生效 |
| **Gate 3** | Unit Test (Vitest) | 每次 PR / push to main | 阻擋合併 | M1 起生效 |
| **Gate 4** | Build Check (`npm run build`) | 每次 PR / push to main | 阻擋合併 | M1 起生效 |
| **Gate 5** | E2E Test (Playwright) | 每次 PR / push to main | 阻擋合併 | **M4 起生效** |

---

## 2. Workflow 定義

### 2.1 CI Workflow — `ci.yml`

**建立時機**：M1 T-104
**檔案路徑**：`.github/workflows/ci.yml`

#### 觸發條件

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

#### Job 結構

前端與後端 CI **並行執行**，互不阻擋：

```
┌─────────────────────┐    ┌──────────────────────┐
│   ci-backend        │    │   ci-frontend        │
│                     │    │                      │
│  1. Checkout        │    │  1. Checkout         │
│  2. Setup Node 20   │    │  2. Setup Node 20    │
│  3. npm ci          │    │  3. npm ci           │
│  4. ESLint          │    │  4. ESLint           │
│  5. tsc --noEmit    │    │  5. tsc --noEmit     │
│  6. Vitest          │    │  6. Vitest           │
│  7. npm run build   │    │  7. npm run build    │
└─────────────────────┘    └──────────────────────┘
```

#### 參考 YAML

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci-backend:
    name: Backend CI
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: backend/package-lock.json
      - run: npm ci
      - name: Lint
        run: npm run lint
      - name: Type Check
        run: npx tsc --noEmit
      - name: Unit Test
        run: npm test
      - name: Build
        run: npm run build

  ci-frontend:
    name: Frontend CI
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci
      - name: Lint
        run: npm run lint
      - name: Type Check
        run: npx tsc --noEmit
      - name: Unit Test
        run: npm test
      - name: Build
        run: npm run build
```

### 2.2 E2E Job（M4 擴充）

**建立時機**：M4 T-401（更新既有 `ci.yml`）

在 `ci.yml` 中新增 `e2e` Job，依賴 `ci-backend` 與 `ci-frontend` 皆通過後執行：

```yaml
  e2e:
    name: E2E Tests
    needs: [ci-backend, ci-frontend]
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: vibe_money_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install backend dependencies
        run: npm ci --prefix backend
      - name: Install frontend dependencies
        run: npm ci --prefix frontend
      - name: Run DB migrations
        run: npx prisma migrate deploy --prefix backend
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/vibe_money_test
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
        working-directory: tests
      - name: Start backend
        run: npm run start --prefix backend &
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/vibe_money_test
          JWT_SECRET: ci-test-secret
      - name: Start frontend
        run: npm run preview --prefix frontend &
      - name: Wait for services
        run: npx wait-on http://localhost:3000/health http://localhost:4173
      - name: Run E2E tests
        run: npx playwright test
        working-directory: tests
```

---

## 3. GitHub Repository 設定

### 3.1 Branch Protection Rules（建議）

對 `main` 分支設定以下保護規則：

| 規則 | 設定值 |
|------|-------|
| Require status checks to pass | `ci-backend`, `ci-frontend` |
| Require branches to be up to date | ✅ |
| Require pull request reviews | 至少 1 位 (H-Director) |
| Dismiss stale reviews on new pushes | ✅ |

### 3.2 所需 Secrets

| Secret 名稱 | 用途 | 設定時機 |
|-------------|------|---------|
| _（M1 CI 無需額外 Secrets）_ | — | — |
| `DATABASE_URL` | E2E 測試用（如使用外部 DB） | M4（若不使用 service container） |

> **注意**：LLM API Key（OpenAI / Gemini）**不納入 CI**。LLM 相關測試一律使用 Mock Provider。

---

## 4. 測試策略與 CI 的關係

| 測試類型 | 工具 | 在 CI 中執行 | Mock 策略 |
|---------|------|-------------|----------|
| **單元測試** | Vitest | ✅ 每次 PR | DB: in-memory / mock；LLM: Mock Provider |
| **E2E 測試** | Playwright | ✅ M4 起 | LLM: Mock Provider；DB: PostgreSQL service container |
| **整合測試（LLM）** | 手動 | ❌ | 需真實 API Key，僅在 staging 環境手動驗證 |
| **視覺驗證** | 手動 | ❌ | H-Director 於 Milestone 驗收時目視確認 |

---

## 5. CI 流程圖

```mermaid
flowchart LR
    PR["開發者提交 PR"] --> LINT["Gate 1<br/>ESLint"]
    LINT --> TSC["Gate 2<br/>tsc --noEmit"]
    TSC --> TEST["Gate 3<br/>Unit Test"]
    TEST --> BUILD["Gate 4<br/>Build"]
    BUILD --> E2E{"Gate 5<br/>E2E Test<br/>(M4 起)"}
    E2E -->|通過| REVIEW["A-Main 初審<br/>→ H-Director 終審"]
    E2E -->|失敗| FIX["開發者修復"]
    BUILD -->|失敗| FIX
    TEST -->|失敗| FIX
    TSC -->|失敗| FIX
    LINT -->|失敗| FIX
    FIX --> PR
```
