# 💰 Vibe Money Book

> **一句話記帳** — 用語音或文字，輕鬆搞定每一筆消費。

![Node.js](https://img.shields.io/badge/Node.js-22+-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ✨ 專案亮點

- 🎤 **語音記帳** — 按住說話，AI 自動解析金額、類別、商家
- 🤖 **個性化 AI 教練** — 毒舌 🔥 / 溫柔 💖 / 情勒 🥺，三種人設即時財務評論
- 📊 **預算血條** — 視覺化本月預算消耗，超支自動警示
- 🥧 **消費分析** — 圓餅圖一覽各類別消費佔比
- 🔄 **雙 AI 引擎** — 支援 Gemini / OpenAI，自由切換
- 📱 **PWA 支援** — 加入手機桌面，隨時隨地記帳

---

## 🚀 功能特色

### 語音與文字輸入
- 整合 Web Speech API，支援「按住說話」(Push-to-Talk)
- 文字輸入支援自然語言，例如：「午餐吃拉麵 180 元」、「星巴克咖啡 150」

### AI 智慧解析
- LLM 自動萃取金額、類別、商家、日期
- 解析結果以卡片呈現，使用者確認後儲存
- 自動偵測新消費類別，互動式詢問是否新增

### 個性化 AI 人設
| 人設 | 風格 | 範例 |
|------|------|------|
| 🔥 毒舌模式 | 尖銳犀利 | 「650 元買壽司？你準備靠光合作用過活嗎？」 |
| 💖 溫柔模式 | 溫暖鼓勵 | 「辛苦了～偶爾犒賞自己也很重要呢」 |
| 🥺 情勒模式 | 善意愧疚 | 「這個月已經超支了...我好擔心你啊...」 |

### 預算管理
- 月度總預算設定與即時追蹤
- 8 種預設消費類別 + 自訂類別（上限 20 個）
- 各類別獨立預算限額與警示

### 統計分析
- 消費分佈圓餅圖（Recharts）
- 交易記錄列表，支援類別與日期篩選

---

## 🛠️ 技術棧

### 前端

| 技術 | 用途 |
|------|------|
| React 19 + TypeScript | UI 框架 |
| Vite 8 | 建構工具 |
| Tailwind CSS 4 | 樣式框架 |
| Zustand | 狀態管理 |
| React Router 7 | 路由管理 |
| Recharts | 圖表視覺化 |
| Axios | HTTP 客戶端 |
| Web Speech API | 語音辨識 |
| vite-plugin-pwa | PWA 支援 |

### 後端

| 技術 | 用途 |
|------|------|
| Node.js + Express 5 | API 框架 |
| TypeScript | 語言 |
| Prisma 6 | ORM |
| Zod 4 | 請求驗證 |
| JWT + bcrypt | 認證與加密 |
| express-rate-limit | API 限流 |

### AI / LLM

| 引擎 | 模型 |
|------|------|
| Google Gemini (預設) | gemini-2.0-flash-lite |
| OpenAI | gpt-4o-mini |

### 測試

| 工具 | 用途 |
|------|------|
| Vitest | 單元測試（前後端） |
| Testing Library | React 元件測試 |
| Supertest | API 整合測試 |
| Playwright | E2E 測試 |

### 部署

| 工具 | 用途 |
|------|------|
| Docker + Docker Compose | 容器化部署 |
| PostgreSQL / SQLite | 資料庫（生產 / 開發） |

---

## ⚡ 快速開始

### 環境需求

- **Node.js** >= 22
- **npm** >= 10
- **Docker** + **Docker Compose**（選用，用於容器化部署）

### 安裝步驟

```bash
# 1. 複製專案
git clone https://github.com/robin-li/vibe-money-book2.git
cd vibe-money-book2

# 2. 安裝後端依賴
cd backend
npm install

# 3. 設定環境變數
cp .env.example .env
# 編輯 .env，填入必要設定（見「環境變數」章節）

# 4. 初始化資料庫
npx prisma migrate dev
npx prisma db seed

# 5. 安裝前端依賴
cd ../frontend
npm install
```

### 啟動開發環境

```bash
# 終端機 1：啟動後端（預設 http://localhost:3000）
cd backend
npm run dev

# 終端機 2：啟動前端（預設 http://localhost:5173）
cd frontend
npm run dev
```

### Docker 一鍵啟動

```bash
docker compose up --build
```

啟動後：
- 前端：`http://localhost:80`
- 後端 API：`http://localhost:3000`

---

## 📁 專案結構

```
vibe-money-book2/
├── backend/                 # 後端 API
│   ├── src/
│   │   ├── controllers/     # 控制層
│   │   ├── services/        # 業務邏輯（含 LLM 整合）
│   │   ├── routes/          # API 路由定義
│   │   ├── middlewares/     # 中間件（認證、限流、錯誤處理）
│   │   ├── validators/      # Zod 驗證 Schema
│   │   ├── prompts/         # LLM Prompt 模板
│   │   ├── config/          # 設定檔
│   │   ├── types/           # TypeScript 型別
│   │   ├── app.ts           # Express App
│   │   └── server.ts        # 啟動入口
│   ├── prisma/              # Prisma Schema & Migrations
│   └── Dockerfile
├── frontend/                # 前端 SPA
│   ├── src/
│   │   ├── pages/           # 頁面元件
│   │   ├── components/      # 可複用元件
│   │   ├── hooks/           # 自訂 Hooks
│   │   ├── stores/          # Zustand Store
│   │   ├── lib/             # 工具函數 / API 呼叫
│   │   ├── types/           # TypeScript 型別
│   │   ├── App.tsx          # 根元件
│   │   └── main.tsx         # 入口
│   └── Dockerfile
├── tests/                   # E2E 測試（Playwright）
├── docs/                    # 規格文件（PRD、SRD、Dev Plan 等）
├── docker-compose.yml
└── playwright.config.ts
```

---

## 🔐 環境變數

在 `backend/` 目錄下建立 `.env` 檔案：

```ini
# 資料庫連線
DATABASE_URL=postgresql://user:password@localhost:5432/vibe_money_book
# 開發環境可使用 SQLite：
# DATABASE_URL=file:./data/dev.db

# JWT 設定
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRE=7d

# LLM 模型設定（API Key 由使用者在前端自行輸入，不儲存於伺服器）
OPENAI_MODEL=gpt-4o-mini
GEMINI_MODEL=gemini-2.0-flash-lite

# 伺服器設定
PORT=3000
NODE_ENV=development

# 速率限制
RATE_LIMIT_LLM_PER_MIN=20
RATE_LIMIT_API_PER_MIN=100
RATE_LIMIT_AUTH_PER_MIN=10
```

> ⚠️ **注意**：`.env` 檔案包含敏感資訊，**嚴禁** commit 至版本控制。使用者的 LLM API Key 僅儲存於前端 localStorage，透過 `X-LLM-API-Key` Header 傳遞，後端用後即棄。

---

## 📡 API 概覽

所有 API 皆以 `/api/v1` 為前綴，回應格式統一為 JSON。

### 認證 (Auth)
| 方法 | 端點 | 說明 |
|------|------|------|
| POST | `/auth/register` | 使用者註冊 |
| POST | `/auth/login` | 使用者登入 |

### 使用者 (User)
| 方法 | 端點 | 說明 |
|------|------|------|
| GET | `/users/me` | 取得個人資料 |
| PUT | `/users/me` | 更新設定（人設、預算、AI 引擎） |

### 交易記錄 (Transactions)
| 方法 | 端點 | 說明 |
|------|------|------|
| GET | `/transactions` | 查詢交易列表（支援分頁、篩選） |
| POST | `/transactions` | 新增交易記錄 |
| DELETE | `/transactions/:id` | 刪除交易記錄 |

### 預算 (Budget)
| 方法 | 端點 | 說明 |
|------|------|------|
| GET | `/budgets` | 查詢類別預算 |
| PUT | `/budgets` | 更新類別預算 |

### 統計 (Stats)
| 方法 | 端點 | 說明 |
|------|------|------|
| GET | `/stats/summary` | 月度消費摘要 |
| GET | `/stats/categories` | 各類別消費統計 |

### AI (AI)
| 方法 | 端點 | 說明 |
|------|------|------|
| POST | `/ai/parse` | 自然語言解析（萃取 + 回饋） |

---

## 🧑‍💻 開發指南

### 常用指令

```bash
# 後端
cd backend
npm run dev              # 啟動開發伺服器（hot reload）
npm run build            # 編譯 TypeScript
npm run lint             # ESLint 檢查
npm run test             # 執行單元測試
npm run test:watch       # 測試 watch 模式
npm run prisma:migrate   # 執行資料庫遷移
npm run prisma:seed      # 植入種子資料
npm run prisma:generate  # 生成 Prisma Client

# 前端
cd frontend
npm run dev              # 啟動 Vite 開發伺服器
npm run build            # 建構生產版本
npm run lint             # ESLint 檢查
npm run test             # 執行單元測試
npm run preview          # 預覽生產版本

# E2E 測試（根目錄）
npm run test:e2e         # 執行 Playwright E2E 測試
npm run test:e2e:headed  # 有瀏覽器畫面的 E2E 測試
npm run test:e2e:ui      # Playwright UI 模式
```

### 頁面路由

| 路由 | 頁面 | 說明 |
|------|------|------|
| `/` | DashboardPage | 首頁儀表板，含記帳輸入 |
| `/stats` | StatsPage | 消費統計圖表 |
| `/history` | HistoryPage | 交易記錄列表 |
| `/settings` | SettingsPage | 人設 / 預算 / AI 引擎設定 |
| `/login` | LoginPage | 使用者登入 |
| `/register` | RegisterPage | 使用者註冊 |

---

## 🐳 部署

### Docker Compose 部署

```bash
# 1. 設定環境變數
export JWT_SECRET=your-production-secret
export DATABASE_URL=file:/app/data/dev.db
export NODE_ENV=production

# 2. 建構並啟動
docker compose up -d --build

# 3. 確認服務狀態
docker compose ps
```

### 服務配置

| 服務 | 連接埠 | 說明 |
|------|-------|------|
| frontend | 80 | Nginx 靜態資源伺服器 |
| backend | 3000 | Express API 伺服器 |

### 推薦的雲端部署方案

| 層級 | 推薦服務 |
|------|---------|
| 前端 | Vercel / Netlify |
| 後端 | Railway / Render / Fly.io |
| 資料庫 | Supabase PostgreSQL / Railway PostgreSQL |

---

## 📸 截圖 / Demo

> 🚧 即將推出 — 敬請期待

<!--
![首頁儀表板](docs/screenshots/dashboard.png)
![統計頁面](docs/screenshots/stats.png)
![設定頁面](docs/screenshots/settings.png)
-->

---

## 📄 License

本專案採用 [MIT License](LICENSE) 授權。

---

## 🙏 致謝

- 本專案採用 **Vibe-SDLC** 開發流程，由 AI 輔助完成規格撰寫、任務拆分與開發循環
- 感謝 [Claude Code](https://claude.ai/code) 在開發過程中的協助
- UI 設計遵循 Mobile-First 原則，以手機使用場景為優先考量
