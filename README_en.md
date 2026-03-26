<p align="center">
  <a href="README_en.md"><strong>English</strong></a> |
  <a href="README.md">繁體中文</a> |
  <a href="README_zh-CN.md">简体中文</a> |
  <a href="README_vi.md">Tiếng Việt</a>
</p>

<h1 align="center">Vibe Money Book</h1>

<p align="center">
  <strong>One-Sentence Bookkeeping</strong> — Effortlessly track every expense with voice or text.<br/>
  AI doesn't just log your spending — it delivers real-time financial commentary in three personas: Roast 🔥, Gentle 💖, and Guilt-Trip 🥺!
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

[**Live Demo**](#-live-demo) · [Features](#-features) · [Quick Start](#-quick-start) · [Screenshots](#-screenshots)

</div>

<p align="center">
  <img src="docs/screenshots/01-home-dashboard.jpg" alt="Vibe Money Book Home Dashboard" width="300" />
</p>

---

## Table of Contents

- [Features](#-features)
- [Live Demo](#-live-demo)
- [Screenshots](#-screenshots)
- [Tech Stack](#️-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [API Overview](#-api-overview)
- [Deployment](#-deployment)
- [Development Guide](#-development-guide)
- [Development Process](#-development-process)
- [License](#-license)
- [Acknowledgements](#-acknowledgements)

---

## ✨ Features

### 🎙️ One-Liner Accounting — Just Say It

> "Ramen for lunch, 180 TWD" "Bought dog food at the pet store for 1500" "Split dinner with coworkers last Friday, I paid 650"

Stop manually entering amounts, picking categories, and selecting dates. **Hold to speak, AI handles the rest.**

- 🗣️ **Voice + Text dual input**: Integrated Web Speech API — hold to speak or just type
- 🧠 **AI Smart Parsing**: LLM auto-extracts amount, category, merchant, and date — all in one card
- 📂 **Auto-Categorization**: New category detected? AI suggests it, one tap to add
- 📅 **Semantic Date Recognition**: Say "last Friday", "White Day", or "Women's Day" — AI nails it

### 🔍 Ask Your Expenses — Voice / Semantic Search

> "How much did I spend at the pet store this month?" "Recent pet expenses" "How much on food?"

No need to remember category names. No manual filtering. **Just ask, and get answers.**

- 🎯 **Two-stage AI Analysis**: Time range parsing → smart transaction matching
- 💬 **Persona-styled Feedback**: AI coach summarizes your spending in your chosen style (Roast / Gentle / Guilt-Trip)
- 🔗 **Query & Filter are mutually exclusive**: Manual filters (date/category) and AI search auto-switch; "Clear Filters" resets everything at once

### 🤖 Personalized AI Coach — Your Financial Commentator

Every expense gets an instant review from your AI coach. Three personas — pick your favorite:

| Persona | Style | Example |
|---------|-------|---------|
| 🔥 Roast Mode | Sharp & biting | "650 TWD on sushi? Planning to survive on photosynthesis?" |
| 💖 Gentle Mode | Warm & encouraging | "You've worked hard~ treating yourself once in a while matters too" |
| 🥺 Guilt-Trip Mode | Well-meaning guilt | "You've already overspent this month... I'm so worried about you..." |

### 📝 AI Instructions — Your Rules, AI Follows

With "AI Instructions", define your own classification logic — AI will prioritize your rules:

> **Example instructions:**
> - Paying someone back → Expense / Repayment
> - Receiving repayment → Income / Repayment
> - Lending money → Expense / Loan
> - Borrowing money → Income / Loan

Combined with "Custom Categories", build your own classification system. Same category name can exist under both income and expense!

### 🌍 Four Languages, Fully Supported

🇹🇼 繁體中文 · 🇺🇸 English · 🇨🇳 简体中文 · 🇻🇳 Tiếng Việt

- UI, error messages, and AI feedback all follow the language setting
- Switch language before login — voice recognition auto-follows
- Three-layer persistence: DB → localStorage → browser detection

### ⚡ More Highlights

| Feature | Description |
|---------|-------------|
| 📊 Budget Health Bar | Visualize budget consumption — overspending alerts turn red so you think twice |
| 🥧 Spending Analysis | Pie chart + interactive bar chart drill-down, tap a category to see details, income/expenses tracked separately |
| 🔄 Four AI Engines | Gemini / OpenAI / Anthropic / xAI, switch freely — per-provider API Key management |
| 📱 PWA Support | Add to home screen, instant launch, works offline too |
| 🏷️ Custom Categories | Up to 50 custom categories, same name for income/expense, each with its own budget |
| 🛡️ Privacy First | API Key stays in your browser only — backend uses it and forgets it, zero trace |

---

## 🌐 Live Demo

<table>
  <tr>
    <td><strong>Demo URL</strong></td>
    <td><a href="https://moneybook.smart-codings.com/" target="_blank">https://moneybook.smart-codings.com</a></td>
  </tr>
  <tr>
    <td><strong>Demo Account</strong></td>
    <td>Email: <code>test@a.b.com</code> / Password: <code>Aaa@123456</code></td>
  </tr>
  <tr>
    <td><strong>Register New Account</strong></td>
    <td><a href="https://moneybook.smart-codings.com/register">Go to Registration</a></td>
  </tr>
</table>

---

## 📸 Screenshots

<details>
<summary><strong>Home — Voice Bookkeeping & AI Feedback</strong></summary>

**Voice / Natural Language Bookkeeping**

<img src="docs/screenshots/02-1-talk-input.jpg" alt="Voice Input" width="300" />

**Roast Mode Coach Helps You Save Money**

<img src="docs/screenshots/02-3-roasting-ai.jpg" alt="Roast Mode Coach" width="300" />

**Directly Ask About Spending Habits**

<img src="docs/screenshots/02-2-talk-ask.jpg" alt="Voice Query" width="300" />

</details>

<details>
<summary><strong>Smart Parsing — Auto-Categorization & Date Recognition</strong></summary>

**Auto-Categorization** — Automatically suggests a new category when no existing one fits

<img src="docs/screenshots/03-1-auto-new-catagory-1.jpg" alt="Auto-Categorization 1" width="300" />
<img src="docs/screenshots/03-1-auto-new-catagory-2.jpg" alt="Auto-Categorization 2" width="300" />

**Smart Date** — Automatically recognizes "last Friday", "the 10th"

<img src="docs/screenshots/03-2-auto-date.jpg" alt="Smart Date" width="300" />

**Holiday Recognition** — Automatically recognizes "White Day", "Women's Day"

<img src="docs/screenshots/03-2-auto-date-2.jpg" alt="Holiday Recognition" width="300" />

</details>

<details>
<summary><strong>Statistics & Records — Spending Analysis & Semantic Search</strong></summary>

**Statistics Page** — Totals and statistics by income/expenses

<img src="docs/screenshots/04-summary.jpg" alt="Statistics Page" width="300" />

**Records Page** — Supports filtering and AI Semantic Search

<img src="docs/screenshots/04-records-1.jpg" alt="Records Page" width="300" />

**Semantic Search** — e.g., "花在老婆大人身上多少錢" (How much did I spend on my wife)

<img src="docs/screenshots/04-records-2.jpg" alt="Semantic Search" width="300" />

</details>

<details>
<summary><strong>Settings Page — AI Persona & Budget Management</strong></summary>

**AI Persona & Instruction Settings**

<img src="docs/screenshots/05-settings.jpg" alt="Settings Page" width="300" />

**Budget, API Key & Category Management**

<img src="docs/screenshots/05-settings-2.jpg" alt="Settings Page 2" width="300" />

</details>

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19 · TypeScript · Vite 8 · Tailwind CSS 4 · Zustand · React Router 7 · Recharts · Web Speech API · PWA · react-i18next |
| **Backend** | Node.js · Express 5 · TypeScript · Prisma 6 · Zod 4 · JWT · bcrypt · express-rate-limit · i18next |
| **AI / LLM** | OpenAI (default) · Google Gemini · Anthropic Claude · xAI Grok — four engines, switch freely |
| **Testing** | Vitest · Testing Library · Supertest · Playwright |
| **Deployment** | Docker · Docker Compose · Cloudflare Tunnel · PostgreSQL |

<details>
<summary><strong>Available AI Model List</strong></summary>

#### Google Gemini

| Model | Features | Price (per 1M tokens) |
|-------|----------|---------------------|
| `gemini-3-flash-preview` ⭐ | Stronger than 2.5 Pro, 3x faster (recommended) | $0.50 / $3.00 |
| `gemini-3.1-flash-lite-preview` | Fastest & cheapest | $0.25 / $1.50 |
| `gemini-2.5-flash` | Stable, with reasoning capability | — |
| `gemini-2.5-pro` | Strongest reasoning | — |
| `gemini-2.0-flash` | Fast & stable | — |

#### OpenAI

| Model | Features | Price (per 1M tokens) |
|-------|----------|---------------------|
| `gpt-5.4-mini` ⭐ | Stronger than GPT-5 mini, 2x faster, 400k context (recommended) | $0.75 / $4.50 |
| `gpt-5.4-nano` | Lowest cost | $0.20 / $1.25 |
| `gpt-5.4` | Flagship model, complex reasoning | — |
| `gpt-5.4-pro` | Highest quality | — |
| `gpt-4.1` | Previous generation, supports fine-tuning | — |
| `gpt-4.1-mini` | Previous generation, fast version | — |

#### Anthropic Claude

| Model | Features | Price (per 1M tokens) |
|-------|----------|---------------------|
| `claude-haiku-4-5-20251001` ⭐ | Fastest, ideal for everyday tasks (recommended) | $1.00 / $5.00 |
| `claude-sonnet-4-6` | Best speed-intelligence balance | $3.00 / $15.00 |
| `claude-opus-4-6` | Most intelligent, best for agents and coding | $5.00 / $25.00 |

#### xAI Grok

| Model | Features | Price (per 1M tokens) |
|-------|----------|---------------------|
| `grok-3-mini-fast` ⭐ | Fastest and most cost-effective (recommended) | — |
| `grok-3-mini` | Balanced with good reasoning | — |
| `grok-3` | Most capable xAI model | — |

</details>

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** >= 22 / **npm** >= 10
- **Docker** + **Docker Compose** (optional, for containerized deployment)

### Option 1: Docker One-Click Start

```bash
git clone https://github.com/robin-li/vibe-money-book.git
cd vibe-money-book
cp backend/.env.example backend/.env   # Edit .env and fill in required settings
docker compose up -d --build
```

After startup: Frontend `http://localhost:80` / Backend API `http://localhost:3000`

### Option 2: Local Development

```bash
git clone https://github.com/robin-li/vibe-money-book.git
cd vibe-money-book

# Backend
cd backend
npm install
cp .env.example .env                   # Edit .env and fill in required settings
npx prisma migrate dev
npx prisma db seed
npm run dev                            # http://localhost:3000

# Frontend (open another terminal)
cd frontend
npm install
npm run dev                            # http://localhost:5173
```

---

## 📁 Project Structure

```
vibe-money-book/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── controllers/     # Controller Layer
│   │   ├── services/        # Business Logic (incl. LLM integration)
│   │   ├── routes/          # API Route Definitions
│   │   ├── middlewares/     # Middleware (auth, rate limiting, error handling)
│   │   ├── validators/      # Zod Validation Schemas
│   │   ├── prompts/         # LLM Prompt Templates
│   │   ├── config/          # Configuration Files
│   │   ├── types/           # TypeScript Types
│   │   ├── app.ts           # Express App
│   │   └── server.ts        # Entry Point
│   ├── prisma/              # Prisma Schema & Migrations
│   └── Dockerfile
├── frontend/                # Frontend SPA
│   ├── src/
│   │   ├── pages/           # Page Components
│   │   ├── components/      # Reusable Components
│   │   ├── hooks/           # Custom Hooks
│   │   ├── stores/          # Zustand Store
│   │   ├── lib/             # Utility Functions / API Calls
│   │   ├── types/           # TypeScript Types
│   │   ├── App.tsx          # Root Component
│   │   └── main.tsx         # Entry Point
│   └── Dockerfile
├── tests/                   # E2E Tests (Playwright)
├── docs/                    # Specification Documents (PRD, SRD, Dev Plan, etc.)
├── scripts/
│   ├── start.sh             # One-Click Start (Docker + Cloudflare Tunnel)
│   └── stop.sh              # One-Click Stop
├── docker-compose.yml
└── playwright.config.ts
```

---

## 🔐 Environment Variables

Set in `backend/.env` (copy from `.env.example`):

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `postgresql://vibe:vibe_password@postgres:5432/vibe_money_book` (PostgreSQL) |
| `JWT_SECRET` | JWT signing secret | — (required) |
| `JWT_EXPIRE` | Token expiration time | `7d` |
| `GEMINI_MODEL` | Gemini model name | `gemini-3-flash-preview` |
| `OPENAI_MODEL` | OpenAI model name | `gpt-5.4-mini` |
| `ANTHROPIC_MODEL` | Anthropic model name | `claude-haiku-4-5-20251001` |
| `XAI_MODEL` | xAI model name | `grok-3-mini-fast` |
| `{PROVIDER}_MODEL_INCLUDE` | Model include filter regex (e.g. `GEMINI_MODEL_INCLUDE`) | — |
| `{PROVIDER}_MODEL_EXCLUDE` | Model exclude filter regex | — |
| `LLM_TIMEOUT_MS` | LLM request timeout | `30000` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Runtime environment | `development` |
| `CORS_ORIGIN` | CORS allowed origin | — |
| `VITE_API_BASE_URL` | Frontend API Base URL | — |
| `RATE_LIMIT_LLM_PER_MIN` | LLM API rate limit | `20` |
| `RATE_LIMIT_API_PER_MIN` | General API rate limit | `100` |
| `RATE_LIMIT_AUTH_PER_MIN` | Auth API rate limit | `10` |

> **Note**: The `.env` file contains sensitive information and must **never** be committed to version control. Users' LLM API Keys are stored only in the frontend's localStorage, passed via the `X-LLM-API-Key` header, and discarded by the backend after use.

---

## 📡 API Overview

All APIs are prefixed with `/api/v1` and return responses in JSON format.

| Module | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| **Auth** | POST | `/auth/register` | User Registration |
| | POST | `/auth/login` | User Login |
| **User** | GET | `/users/me` | Get Profile |
| | PUT | `/users/me` | Update Settings (persona, budget, AI engine) |
| **Transactions** | GET | `/transactions` | Query Transaction List (supports pagination & filtering) |
| | POST | `/transactions` | Create Transaction Record |
| | DELETE | `/transactions/:id` | Delete Transaction Record |
| **Budget** | GET | `/budgets` | Query Category Budgets |
| | PUT | `/budgets` | Update Category Budgets |
| **Stats** | GET | `/stats/summary` | Monthly Spending Summary |
| | GET | `/stats/categories` | Spending Statistics by Category |
| **AI** | POST | `/ai/parse` | Natural Language Parsing (extraction + feedback) |
| | POST | `/ai/query` | Semantic Search for Transaction Records |
| | GET | `/ai/providers` | List supported AI providers |
| | GET | `/ai/models` | List available models for a provider |

---

## 🐳 Deployment

### Option 1: Local Deployment + Cloudflare Tunnel (Recommended)

Run locally via Docker Compose with Cloudflare Tunnel for external HTTPS access — zero cost, full control.

```
User → Cloudflare Edge (HTTPS + CDN)
            ↓ Cloudflare Tunnel
       Local Machine
       ├─ frontend (:80)  → moneybook.smart-codings.com
       └─ backend  (:3000) → moneybook-api.smart-codings.com
```

```bash
# One-click start (Docker containers + Cloudflare Tunnel)
./scripts/start.sh

# One-click stop
./scripts/stop.sh
```

| Service | Local Address | Public URL |
|---------|--------------|------------|
| Frontend | `http://localhost:80` | `https://moneybook.smart-codings.com` |
| Backend API | `http://localhost:3000` | `https://moneybook-api.smart-codings.com` |

<details>
<summary><strong>Cloudflare Tunnel First-Time Setup</strong></summary>

**Prerequisites**: [Docker](https://docs.docker.com/get-docker/) + Docker Compose, [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/) (`brew install cloudflared`), a domain managed by Cloudflare

```bash
# 1. Log in to Cloudflare
cloudflared tunnel login

# 2. Create Tunnel
cloudflared tunnel create vibe-money-book

# 3. Create config file (~/.cloudflared/config-moneybook.yml)
# tunnel: <TUNNEL_ID>
# credentials-file: ~/.cloudflared/<TUNNEL_ID>.json
# ingress:
#   - hostname: moneybook.your-domain.com
#     service: http://localhost:80
#   - hostname: moneybook-api.your-domain.com
#     service: http://localhost:3000
#   - service: http_status:404

# 4. Set up DNS routing
cloudflared tunnel --config ~/.cloudflared/config-moneybook.yml route dns vibe-money-book moneybook.your-domain.com
cloudflared tunnel --config ~/.cloudflared/config-moneybook.yml route dns vibe-money-book moneybook-api.your-domain.com
```

</details>

### Option 2: Cloud Deployment

| Layer | Recommended Services |
|-------|---------------------|
| Full-stack (Docker) | Railway / Render / Fly.io |
| Frontend | Vercel / Netlify |
| Backend | Railway / Render / Fly.io |
| Database | Supabase PostgreSQL / Railway PostgreSQL |

---

## 🧑‍💻 Development Guide

<details>
<summary><strong>Common Commands</strong></summary>

```bash
# Backend
cd backend
npm run dev              # Start dev server (hot reload)
npm run build            # Compile TypeScript
npm run lint             # ESLint check
npm run test             # Run unit tests
npm run test:watch       # Test watch mode
npm run prisma:migrate   # Run database migrations
npm run prisma:seed      # Seed the database
npm run prisma:generate  # Generate Prisma Client

# Frontend
cd frontend
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run lint             # ESLint check
npm run test             # Run unit tests
npm run preview          # Preview production build

# E2E Tests (from project root)
npm run test:e2e         # Run Playwright E2E tests
npm run test:e2e:headed  # E2E tests with browser UI
npm run test:e2e:ui      # Playwright UI mode
```

</details>

### Page Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | DashboardPage | Home dashboard with bookkeeping input |
| `/stats` | StatsPage | Spending statistics charts |
| `/history` | HistoryPage | Transaction record list + AI Semantic Search |
| `/settings` | SettingsPage | Persona / Budget / AI engine settings |
| `/login` | LoginPage | User Login |
| `/register` | RegisterPage | User Registration |

---

## 🤖 Development Process

This project follows the [**Vibe-SDLC**](https://github.com/robin-li/Vibe-SDLC) software development lifecycle, with AI assisting in specification writing, task decomposition, and development cycles.

For detailed development logs, see:
- [Development Log 1](docs/worklog/Vibe-Money-Book-Worklog-1.md)
- [Development Log 2](docs/worklog/Vibe-Money-Book-Worklog-2.md)
- [Development Log 3](docs/worklog/Vibe-Money-Book-Worklog-3.md)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙏 Acknowledgements

- [**Vibe-SDLC**](https://github.com/robin-li/Vibe-SDLC) — AI-assisted software development lifecycle
- [**Claude Code**](https://claude.ai/code) — AI collaboration partner throughout the development process
- UI design follows **Mobile-First** principles, prioritizing mobile usage scenarios
