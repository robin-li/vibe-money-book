<p align="center">
  <a href="README_en.md">English</a> |
  <a href="README.md"><strong>繁體中文</strong></a> |
  <a href="README_zh-CN.md">简体中文</a> |
  <a href="README_vi.md">Tiếng Việt</a>
</p>

<h1 align="center">Vibe Money Book</h1>

<p align="center">
  <strong>一句話記帳</strong> — 用語音或文字，輕鬆搞定每一筆消費。<br/>
  AI 不只幫你記帳，還會用毒舌 🔥、溫柔 💖、情勒 🥺 三種人設即時點評你的消費！
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-22+-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License" />
</p>

<div align="center">

[**Live Demo**](#-live-demo) · [功能特色](#-功能特色) · [快速開始](#-快速開始) · [截圖展示](#-截圖展示)

</div>

<p align="center">
  <img src="docs/screenshots/01-home-dashboard.jpg" alt="Vibe Money Book 首頁儀表板" width="300" />
</p>

---

## 目錄

- [功能特色](#-功能特色)
- [Live Demo](#-live-demo)
- [截圖展示](#-截圖展示)
- [技術棧](#️-技術棧)
- [快速開始](#-快速開始)
- [專案結構](#-專案結構)
- [環境變數](#-環境變數)
- [API 概覽](#-api-概覽)
- [部署](#-部署)
- [開發指南](#-開發指南)
- [開發流程](#-開發流程)
- [License](#-license)
- [致謝](#-致謝)

---

## ✨ 功能特色

### 🎙️ 一句話記帳 — 說完就記好

> 「午餐吃拉麵 180 元」「在阿貓阿狗幫狗子買狗糧 1500」「上週五和同事聚餐 AA 制，我付了 650」

別再手動輸入金額、選類別、挑日期。**按住說話，AI 全部搞定。**

- 🗣️ **語音 + 文字雙輸入**：整合 Web Speech API，按住說話或直接打字
- 🧠 **AI 智慧解析**：LLM 自動萃取金額、類別、商家、日期，一張卡片搞定
- 📂 **自動分類**：遇到新類別？AI 主動建議，一鍵新增
- 📅 **語義日期辨識**：說「上週五」「白色情人節」「38 節」都能精準識別

### 🔍 用說的查帳 — 語音 / 語義查詢

> 「這個月花在阿貓阿狗多少錢？」「最近毛小孩的開銷」「吃的方面花了多少」

不用記分類名稱，不用手動篩選，**開口問就有答案。**

- 🎯 **兩階段 AI 分析**：時間範圍解析 → 交易智慧匹配
- 💬 **人設風格回饋**：AI 教練用你選的風格（毒舌 / 溫柔 / 情勒）總結花費
- 🔗 **查詢 + 篩選互斥**：手動篩選器（日期／類別）與 AI 查詢自動切換，「清除篩選」一鍵重置

### 🤖 個性化 AI 教練 — 你的專屬財務評論員

每一筆消費，AI 教練都會即時點評。三種人設，選你喜歡的：

| 人設 | 風格 | 範例 |
|------|------|------|
| 🔥 毒舌模式 | 尖銳犀利 | 「650 元買壽司？你準備靠光合作用過活嗎？」 |
| 💖 溫柔模式 | 溫暖鼓勵 | 「辛苦了～偶爾犒賞自己也很重要呢」 |
| 🥺 情勒模式 | 善意愧疚 | 「這個月已經超支了...我好擔心你啊...」 |

### 📝 AI 指示 — 教 AI 按你的規矩分類

透過「AI 指示」功能，自訂專屬的分類邏輯，AI 會優先遵循你的規則：

> **範例指示：**
> - 還錢給他人，應歸類在：支出 / 還款
> - 收到他人的還款，應歸類在：收入 / 還款
> - 借錢給他人，應歸類在：支出 / 借款
> - 向他人借款，應歸類在：收入 / 借款

搭配「自訂類別」功能，建立你自己的分類體系。同名類別還能同時存在於收入和支出！

### 🌍 四語言完整支援

🇹🇼 繁體中文 · 🇺🇸 English · 🇨🇳 简体中文 · 🇻🇳 Tiếng Việt

- UI、錯誤訊息、AI 回饋全部跟隨語言設定
- 登入前就能切換語言，語音辨識自動跟隨
- 三層持久化：DB → localStorage → 瀏覽器偵測

### ⚡ 更多亮點

| 功能 | 說明 |
|------|------|
| 📊 預算血條 | 視覺化預算消耗，超支即時警示，紅到你不敢再花 |
| 🥧 消費分析 | 圓餅圖 + 條狀圖交互展開，點擊類別查看明細，收入支出分開統計 |
| 🔄 四 AI 引擎 | Gemini / OpenAI / Anthropic / xAI 自由切換，每個供應商獨立 API Key 管理 |
| 📱 PWA 支援 | 加入手機桌面，秒開即記，離線也能用 |
| 🏷️ 自訂類別 | 最多 50 個自訂類別，同名可分收入/支出，各設獨立預算 |
| 🛡️ 隱私優先 | API Key 只存瀏覽器，後端用後即棄，不留痕跡 |

---

## 🌐 Live Demo

<table>
  <tr>
    <td><strong>演示地址</strong></td>
    <td><a href="https://moneybook.smart-codings.com/" target="_blank">https://moneybook.smart-codings.com</a></td>
  </tr>
  <tr>
    <td><strong>演示帳號</strong></td>
    <td>Email: <code>test@a.b.com</code> ／ 密碼: <code>Aaa@123456</code></td>
  </tr>
  <tr>
    <td><strong>註冊新帳號</strong></td>
    <td><a href="https://moneybook.smart-codings.com/register">前往註冊</a></td>
  </tr>
</table>

---

## 📸 截圖展示

<details>
<summary><strong>首頁 — 語音記帳與 AI 回饋</strong></summary>

**語音／自然語言記帳**

<img src="docs/screenshots/02-1-talk-input.jpg" alt="語音輸入" width="300" />

**毒舌教練幫你省錢**

<img src="docs/screenshots/02-3-roasting-ai.jpg" alt="毒舌教練" width="300" />

**直接詢問花錢狀況**

<img src="docs/screenshots/02-2-talk-ask.jpg" alt="語音詢問" width="300" />

</details>

<details>
<summary><strong>智慧解析 — 自動分類與日期識別</strong></summary>

**自動分類** — 沒有合適的分類時自動提供建議

<img src="docs/screenshots/03-1-auto-new-catagory-1.jpg" alt="自動分類 1" width="300" />
<img src="docs/screenshots/03-1-auto-new-catagory-2.jpg" alt="自動分類 2" width="300" />

**智慧日期** — 自動識別「上週五」「10 日時」

<img src="docs/screenshots/03-2-auto-date.jpg" alt="智慧日期" width="300" />

**節日識別** — 自動識別「白色情人節」「38 節」

<img src="docs/screenshots/03-2-auto-date-2.jpg" alt="節日識別" width="300" />

</details>

<details>
<summary><strong>統計與記錄 — 消費分析與語義查詢</strong></summary>

**統計頁面** — 依收入／支出分別加總與統計

<img src="docs/screenshots/04-summary.jpg" alt="統計頁面" width="300" />

**記錄頁面** — 支援篩選與 AI 語義查詢

<img src="docs/screenshots/04-records-1.jpg" alt="記錄頁面" width="300" />

**語義查詢** — 例如「花在老婆大人身上多少錢」

<img src="docs/screenshots/04-records-2.jpg" alt="語義查詢" width="300" />

</details>

<details>
<summary><strong>設定頁面 — AI 人設與預算管理</strong></summary>

**AI 人設與指示設定**

<img src="docs/screenshots/05-settings.jpg" alt="設定頁面" width="300" />

**預算、API Key、類別管理**

<img src="docs/screenshots/05-settings-2.jpg" alt="設定頁面 2" width="300" />

</details>

---

## 🛠️ 技術棧

| 層級 | 技術 |
|------|------|
| **前端** | React 19 · TypeScript · Vite 8 · Tailwind CSS 4 · Zustand · React Router 7 · Recharts · Web Speech API · PWA · react-i18next |
| **後端** | Node.js · Express 5 · TypeScript · Prisma 6 · Zod 4 · JWT · bcrypt · express-rate-limit · i18next |
| **AI / LLM** | OpenAI（預設）· Google Gemini · Anthropic Claude · xAI Grok — 四引擎自由切換 |
| **測試** | Vitest · Testing Library · Supertest · Playwright |
| **部署** | Docker · Docker Compose · Cloudflare Tunnel · PostgreSQL |

<details>
<summary><strong>可用 AI 模型列表</strong></summary>

#### Google Gemini

| 模型 | 特點 | 價格 (per 1M tokens) |
|------|------|---------------------|
| `gemini-3-flash-preview` ⭐ | 比 2.5 Pro 更強、3x 更快（推薦） | $0.50 / $3.00 |
| `gemini-3.1-flash-lite-preview` | 最快最便宜 | $0.25 / $1.50 |
| `gemini-2.5-flash` | 穩定、有推理能力 | — |
| `gemini-2.5-pro` | 最強推理 | — |
| `gemini-2.0-flash` | 快速、穩定 | — |

#### OpenAI

| 模型 | 特點 | 價格 (per 1M tokens) |
|------|------|---------------------|
| `gpt-5.4-mini` ⭐ | 比 GPT-5 mini 更強、2x 更快、400k context（推薦） | $0.75 / $4.50 |
| `gpt-5.4-nano` | 最低成本 | $0.20 / $1.25 |
| `gpt-5.4` | 旗艦模型，複雜推理 | — |
| `gpt-5.4-pro` | 最高品質 | — |
| `gpt-4.1` | 上一代，支援 fine-tuning | — |
| `gpt-4.1-mini` | 上一代快速版 | — |

#### Anthropic Claude

| 模型 | 特點 | 價格 (per 1M tokens) |
|------|------|---------------------|
| `claude-haiku-4-5-20251001` ⭐ | 最快，適合日常任務（推薦） | $1.00 / $5.00 |
| `claude-sonnet-4-6` | 速度與智能最佳平衡 | $3.00 / $15.00 |
| `claude-opus-4-6` | 最強智能，適合代理與編碼 | $5.00 / $25.00 |

#### xAI Grok

| 模型 | 特點 | 價格 (per 1M tokens) |
|------|------|---------------------|
| `grok-3-mini-fast` ⭐ | 最快最經濟（推薦） | — |
| `grok-3-mini` | 平衡型，推理能力佳 | — |
| `grok-3` | xAI 最強模型 | — |

</details>

---

## ⚡ 快速開始

### 環境需求

- **Node.js** >= 22 ／ **npm** >= 10
- **Docker** + **Docker Compose**（選用，用於容器化部署）

### 方式一：Docker 一鍵啟動

```bash
git clone https://github.com/robin-li/vibe-money-book.git
cd vibe-money-book
cp backend/.env.example backend/.env   # 編輯 .env 填入必要設定
docker compose up -d --build
```

啟動後：前端 `http://localhost:80` ／ 後端 API `http://localhost:3000`

### 方式二：本地開發

```bash
git clone https://github.com/robin-li/vibe-money-book.git
cd vibe-money-book

# 後端
cd backend
npm install
cp .env.example .env                   # 編輯 .env 填入必要設定
npx prisma migrate dev
npx prisma db seed
npm run dev                            # http://localhost:3000

# 前端（另開終端機）
cd frontend
npm install
npm run dev                            # http://localhost:5173
```

---

## 📁 專案結構

```
vibe-money-book/
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
├── scripts/
│   ├── start.sh             # 一鍵啟動（Docker + Cloudflare Tunnel）
│   └── stop.sh              # 一鍵停止
├── docker-compose.yml
└── playwright.config.ts
```

---

## 🔐 環境變數

在 `backend/.env` 中設定（可從 `.env.example` 複製）：

| 變數 | 說明 | 預設值 |
|------|------|--------|
| `DATABASE_URL` | 資料庫連線字串 | `postgresql://vibe:vibe_password@postgres:5432/vibe_money_book` |
| `JWT_SECRET` | JWT 簽名密鑰 | — (必填) |
| `JWT_EXPIRE` | Token 過期時間 | `7d` |
| `GEMINI_MODEL` | Gemini 模型名稱 | `gemini-3-flash-preview` |
| `OPENAI_MODEL` | OpenAI 模型名稱 | `gpt-5.4-mini` |
| `ANTHROPIC_MODEL` | Anthropic 模型名稱 | `claude-haiku-4-5-20251001` |
| `XAI_MODEL` | xAI 模型名稱 | `grok-3-mini-fast` |
| `{PROVIDER}_MODEL_INCLUDE` | 模型包含過濾正則（如 `GEMINI_MODEL_INCLUDE`） | — |
| `{PROVIDER}_MODEL_EXCLUDE` | 模型排除過濾正則 | — |
| `LLM_TIMEOUT_MS` | LLM 請求逾時 | `30000` |
| `PORT` | 伺服器連接埠 | `3000` |
| `NODE_ENV` | 執行環境 | `development` |
| `CORS_ORIGIN` | CORS 允許來源 | — |
| `VITE_API_BASE_URL` | 前端 API Base URL | — |
| `RATE_LIMIT_LLM_PER_MIN` | LLM API 限流 | `20` |
| `RATE_LIMIT_API_PER_MIN` | 一般 API 限流 | `100` |
| `RATE_LIMIT_AUTH_PER_MIN` | 認證 API 限流 | `10` |

> **注意**：`.env` 檔案包含敏感資訊，**嚴禁** commit 至版本控制。使用者的 LLM API Key 僅儲存於前端 localStorage，透過 `X-LLM-API-Key` Header 傳遞，後端用後即棄。

---

## 📡 API 概覽

所有 API 皆以 `/api/v1` 為前綴，回應格式統一為 JSON。

| 模組 | 方法 | 端點 | 說明 |
|------|------|------|------|
| **Auth** | POST | `/auth/register` | 使用者註冊 |
| | POST | `/auth/login` | 使用者登入 |
| **User** | GET | `/users/me` | 取得個人資料 |
| | PUT | `/users/me` | 更新設定（人設、預算、AI 引擎） |
| **Transactions** | GET | `/transactions` | 查詢交易列表（支援分頁、篩選） |
| | POST | `/transactions` | 新增交易記錄 |
| | DELETE | `/transactions/:id` | 刪除交易記錄 |
| **Budget** | GET | `/budgets` | 查詢類別預算 |
| | PUT | `/budgets` | 更新類別預算 |
| **Stats** | GET | `/stats/summary` | 月度消費摘要 |
| | GET | `/stats/categories` | 各類別消費統計 |
| **AI** | POST | `/ai/parse` | 自然語言解析（萃取 + 回饋） |
| | POST | `/ai/query` | 語義查詢交易記錄 |
| | GET | `/ai/providers` | 取得支援的 AI 供應商列表 |
| | GET | `/ai/models` | 取得指定供應商的可用模型列表 |

---

## 🐳 部署

### 方案一：本地部署 + Cloudflare Tunnel（推薦）

透過 Docker Compose 在本地執行，搭配 Cloudflare Tunnel 對外提供 HTTPS 存取，零成本、完全掌控。

```
使用者 → Cloudflare Edge (HTTPS + CDN)
            ↓ Cloudflare Tunnel
       本地主機
       ├─ frontend (:80)  → moneybook.smart-codings.com
       └─ backend  (:3000) → moneybook-api.smart-codings.com
```

```bash
# 一鍵啟動（Docker 容器 + Cloudflare Tunnel）
./scripts/start.sh

# 一鍵停止
./scripts/stop.sh
```

| 服務 | 本地位址 | 公開網址 |
|------|---------|---------|
| 前端 | `http://localhost:80` | `https://moneybook.smart-codings.com` |
| 後端 API | `http://localhost:3000` | `https://moneybook-api.smart-codings.com` |

<details>
<summary><strong>Cloudflare Tunnel 首次設定</strong></summary>

**前置需求**：[Docker](https://docs.docker.com/get-docker/) + Docker Compose、[cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/) (`brew install cloudflared`)、已在 Cloudflare 管理的網域

```bash
# 1. 登入 Cloudflare
cloudflared tunnel login

# 2. 建立 Tunnel
cloudflared tunnel create vibe-money-book

# 3. 建立設定檔 (~/.cloudflared/config-moneybook.yml)
# tunnel: <TUNNEL_ID>
# credentials-file: ~/.cloudflared/<TUNNEL_ID>.json
# ingress:
#   - hostname: moneybook.your-domain.com
#     service: http://localhost:80
#   - hostname: moneybook-api.your-domain.com
#     service: http://localhost:3000
#   - service: http_status:404

# 4. 設定 DNS 路由
cloudflared tunnel --config ~/.cloudflared/config-moneybook.yml route dns vibe-money-book moneybook.your-domain.com
cloudflared tunnel --config ~/.cloudflared/config-moneybook.yml route dns vibe-money-book moneybook-api.your-domain.com
```

</details>

### 方案二：雲端部署

| 層級 | 推薦服務 |
|------|---------|
| 全端 (Docker) | Railway / Render / Fly.io |
| 前端 | Vercel / Netlify |
| 後端 | Railway / Render / Fly.io |
| 資料庫 | Supabase PostgreSQL / Railway PostgreSQL |

---

## 🧑‍💻 開發指南

<details>
<summary><strong>常用指令</strong></summary>

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

</details>

### 頁面路由

| 路由 | 頁面 | 說明 |
|------|------|------|
| `/` | DashboardPage | 首頁儀表板，含記帳輸入 |
| `/stats` | StatsPage | 消費統計圖表 |
| `/history` | HistoryPage | 交易記錄列表 + AI 語義查詢 |
| `/settings` | SettingsPage | 人設 / 預算 / AI 引擎設定 |
| `/login` | LoginPage | 使用者登入 |
| `/register` | RegisterPage | 使用者註冊 |

---

## 🤖 開發流程

本專案採用 [**Vibe-SDLC**](https://github.com/robin-li/Vibe-SDLC) 軟體開發流程，由 AI 輔助完成規格撰寫、任務拆分與開發循環。

詳細開發過程請參考：
- [開發日誌 1](docs/worklog/Vibe-Money-Book-Worklog-1.md)
- [開發日誌 2](docs/worklog/Vibe-Money-Book-Worklog-2.md)
- [開發日誌 3](docs/worklog/Vibe-Money-Book-Worklog-3.md)

---

## 📄 License

本專案採用 [MIT License](LICENSE) 授權。

---

## 🙏 致謝

- [**Vibe-SDLC**](https://github.com/robin-li/Vibe-SDLC) — AI 輔助軟體開發流程
- [**Claude Code**](https://claude.ai/code) — 開發過程中的 AI 協作夥伴
- UI 設計遵循 **Mobile-First** 原則，以手機使用場景為優先考量
