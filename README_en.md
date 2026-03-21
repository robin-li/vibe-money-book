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

<p align="center">
  <a href="https://moneybook.smart-codings.com/" target="_blank"><strong>Live Demo</strong></a> ·
  <a href="#-features">Features</a> ·
  <a href="#-quick-start">Quick Start</a> ·
  <a href="#-screenshots">Screenshots</a>
</p>

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

### Voice & Text Bookkeeping

- Integrated Web Speech API with Push-to-Talk support
- Natural language input, e.g.: "午餐吃拉麵 180 元" (Ramen for lunch, 180 TWD), "在阿貓阿狗幫狗子買狗糧 1500" (Bought dog food at pet store for 1500)
- LLM automatically extracts amount, category, merchant, and date; parsed results displayed as a card
- Automatically detects new spending categories and interactively asks whether to add them

### Personalized AI Coach

| Persona | Style | Example |
|---------|-------|---------|
| 🔥 Roast Mode | Sharp & biting | "650 元買壽司？你準備靠光合作用過活嗎？" (650 TWD on sushi? Planning to survive on photosynthesis?) |
| 💖 Gentle Mode | Warm & encouraging | "辛苦了～偶爾犒賞自己也很重要呢" (You've worked hard~ treating yourself once in a while matters too) |
| 🥺 Guilt-Trip Mode | Well-meaning guilt | "這個月已經超支了...我好擔心你啊..." (You've already overspent this month... I'm so worried about you...) |

### AI Semantic Search

Query transactions in natural language — no need to remember category names. AI auto-matches and summarizes:

> "阿貓阿狗這家店花了多少" (How much did I spend at that pet store), "最近一個月毛小孩的開銷" (Pet expenses in the last month), "吃的方面花了多少" (How much on food)

- Two-stage AI processing: time range parsing → transaction matching analysis
- AI generates a summary in the selected persona style and filters matching entries
- Manual filters (date/category) and AI search are mutually exclusive; "Clear Filters" resets everything at once

### More Features

| Feature | Description |
|---------|-------------|
| 📊 Budget Health Bar | Visualize monthly budget consumption with automatic overspending alerts |
| 🥧 Spending Analysis | Pie chart overview of spending by category (income/expenses tracked separately) |
| 🔄 Dual AI Engine | Supports Gemini / OpenAI, switch freely |
| 📱 PWA Support | Add to your phone's home screen, track expenses anytime, anywhere |
| 🏷️ Custom Categories | Default + custom spending categories (up to 50), with individual budgets per category |
| 📅 Smart Date | Automatically recognizes semantic dates like "last Friday", "White Day", "Women's Day" |

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
| **Frontend** | React 19 · TypeScript · Vite 8 · Tailwind CSS 4 · Zustand · React Router 7 · Recharts · Web Speech API · PWA |
| **Backend** | Node.js · Express 5 · TypeScript · Prisma 6 · Zod 4 · JWT · bcrypt · express-rate-limit |
| **AI / LLM** | Google Gemini (default) · OpenAI — dual engine, switch freely |
| **Testing** | Vitest · Testing Library · Supertest · Playwright |
| **Deployment** | Docker · Docker Compose · Cloudflare Tunnel · PostgreSQL / SQLite |

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
| `DATABASE_URL` | Database connection string | `file:./data/dev.db` (SQLite) |
| `JWT_SECRET` | JWT signing secret | — (required) |
| `JWT_EXPIRE` | Token expiration time | `7d` |
| `GEMINI_MODEL` | Gemini model name | `gemini-3-flash-preview` |
| `OPENAI_MODEL` | OpenAI model name | `gpt-5.4-mini` |
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
