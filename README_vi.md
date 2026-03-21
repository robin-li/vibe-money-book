<p align="center">
  <a href="README_en.md">English</a> |
  <a href="README.md">繁體中文</a> |
  <a href="README_zh-CN.md">简体中文</a> |
  <a href="README_vi.md"><strong>Tiếng Việt</strong></a>
</p>

<h1 align="center">Vibe Money Book</h1>

<p align="center">
  <strong>Ghi sổ bằng một câu nói</strong> — Dùng giọng nói hoặc văn bản, dễ dàng ghi lại mọi khoản chi tiêu.<br/>
  AI không chỉ giúp bạn ghi sổ, mà còn nhận xét chi tiêu theo thời gian thực với ba tính cách: Chế độ Cay độc 🔥, Chế độ Dịu dàng 💖, Chế độ Tội lỗi 🥺!
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
  <a href="#-demo-trực-tuyến"><strong>Demo trực tuyến</strong></a> ·
  <a href="#-tính-năng">Tính năng</a> ·
  <a href="#-bắt-đầu-nhanh">Bắt đầu nhanh</a> ·
  <a href="#-ảnh-chụp-màn-hình">Ảnh chụp màn hình</a>
</p>

<p align="center">
  <img src="docs/screenshots/01-home-dashboard.jpg" alt="Bảng điều khiển trang chủ Vibe Money Book" width="300" />
</p>

---

## Mục lục

- [Tính năng](#-tính-năng)
- [Demo trực tuyến](#-demo-trực-tuyến)
- [Ảnh chụp màn hình](#-ảnh-chụp-màn-hình)
- [Công nghệ](#️-công-nghệ)
- [Bắt đầu nhanh](#-bắt-đầu-nhanh)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Biến môi trường](#-biến-môi-trường)
- [Tổng quan API](#-tổng-quan-api)
- [Triển khai](#-triển-khai)
- [Hướng dẫn phát triển](#-hướng-dẫn-phát-triển)
- [Quy trình phát triển](#-quy-trình-phát-triển)
- [License](#-license)
- [Lời cảm ơn](#-lời-cảm-ơn)

---

## ✨ Tính năng

### Ghi sổ bằng giọng nói và văn bản

- Tích hợp Web Speech API, hỗ trợ "Nhấn giữ để nói" (Push-to-Talk)
- Nhập bằng ngôn ngữ tự nhiên, ví dụ: 「午餐吃拉麵 180 元」(Ăn trưa mì ramen 180 đồng), 「在阿貓阿狗幫狗子買狗糧 1500」(Mua thức ăn cho chó ở cửa hàng thú cưng 1500)
- LLM tự động trích xuất số tiền, danh mục, cửa hàng, ngày tháng, kết quả phân tích hiển thị dạng thẻ
- Tự động phát hiện danh mục chi tiêu mới, hỏi tương tác có thêm không

### Huấn luyện viên AI cá nhân hóa

| Tính cách | Phong cách | Ví dụ |
|------|------|------|
| 🔥 Chế độ Cay độc | Sắc bén châm biếm | 「650 元買壽司？你準備靠光合作用過活嗎？」(650 đồng mua sushi? Bạn định sống bằng quang hợp à?) |
| 💖 Chế độ Dịu dàng | Ấm áp khích lệ | 「辛苦了～偶爾犒賞自己也很重要呢」(Vất vả rồi~ thỉnh thoảng thưởng cho bản thân cũng quan trọng lắm) |
| 🥺 Chế độ Tội lỗi | Áy náy thiện chí | 「這個月已經超支了...我好擔心你啊...」(Tháng này đã vượt ngân sách rồi... tôi lo cho bạn quá...) |

### Tìm kiếm ngữ nghĩa AI

Tra cứu chi tiêu bằng ngôn ngữ tự nhiên, không cần nhớ tên danh mục, AI tự động khớp và tổng kết:

> 「阿貓阿狗這家店花了多少」(cửa hàng thú cưng tiêu bao nhiêu) 「最近一個月毛小孩的開銷」(chi phí thú cưng tháng vừa rồi) 「吃的方面花了多少」(ăn uống tốn bao nhiêu)

- Xử lý AI hai giai đoạn: Phân tích phạm vi thời gian → Phân tích khớp giao dịch
- AI tạo nhận xét tổng kết theo phong cách tính cách, đồng thời lọc ra các khoản khớp
- Bộ lọc thủ công (ngày/danh mục) và truy vấn AI loại trừ lẫn nhau, "Xóa bộ lọc" xóa tất cả cùng lúc

### Thêm tính năng

| Tính năng | Mô tả |
|------|------|
| 📊 Thanh máu ngân sách | Trực quan hóa mức tiêu dùng ngân sách tháng, tự động cảnh báo khi vượt mức |
| 🥧 Phân tích chi tiêu | Biểu đồ tròn tổng quan tỷ lệ chi tiêu theo từng danh mục (thu nhập/chi tiêu thống kê riêng) |
| 🔄 Dual AI Engine | Hỗ trợ Gemini / OpenAI, tự do chuyển đổi |
| 📱 Hỗ trợ PWA | Thêm vào màn hình chính điện thoại, ghi sổ mọi lúc mọi nơi |
| 🏷️ Danh mục tùy chỉnh | Danh mục mặc định + tùy chỉnh (tối đa 50), mỗi danh mục có ngân sách riêng |
| 📅 Ngày thông minh | Tự động nhận diện ngày ngữ nghĩa như 「上週五」(thứ Sáu tuần trước), 「白色情人節」(Valentine Trắng), 「38 節」(Ngày Quốc tế Phụ nữ) |

---

## 🌐 Demo trực tuyến

<table>
  <tr>
    <td><strong>Địa chỉ demo</strong></td>
    <td><a href="https://moneybook.smart-codings.com/" target="_blank">https://moneybook.smart-codings.com</a></td>
  </tr>
  <tr>
    <td><strong>Tài khoản demo</strong></td>
    <td>Email: <code>test@a.b.com</code> ／ Mật khẩu: <code>Aaa@123456</code></td>
  </tr>
  <tr>
    <td><strong>Đăng ký tài khoản mới</strong></td>
    <td><a href="https://moneybook.smart-codings.com/register">Đăng ký tại đây</a></td>
  </tr>
</table>

---

## 📸 Ảnh chụp màn hình

<details>
<summary><strong>Trang chủ — Ghi sổ bằng giọng nói và phản hồi AI</strong></summary>

**Ghi sổ bằng giọng nói / ngôn ngữ tự nhiên**

<img src="docs/screenshots/02-1-talk-input.jpg" alt="Nhập liệu giọng nói" width="300" />

**Huấn luyện viên Cay độc giúp bạn tiết kiệm**

<img src="docs/screenshots/02-3-roasting-ai.jpg" alt="Huấn luyện viên Cay độc" width="300" />

**Trực tiếp hỏi tình hình chi tiêu**

<img src="docs/screenshots/02-2-talk-ask.jpg" alt="Hỏi bằng giọng nói" width="300" />

</details>

<details>
<summary><strong>Phân tích thông minh — Tự động phân loại và nhận diện ngày</strong></summary>

**Tự động phân loại** — Khi không có danh mục phù hợp, tự động đề xuất danh mục

<img src="docs/screenshots/03-1-auto-new-catagory-1.jpg" alt="Tự động phân loại 1" width="300" />
<img src="docs/screenshots/03-1-auto-new-catagory-2.jpg" alt="Tự động phân loại 2" width="300" />

**Ngày thông minh** — Tự động nhận diện 「上週五」(thứ Sáu tuần trước), 「10 日時」(ngày 10)

<img src="docs/screenshots/03-2-auto-date.jpg" alt="Ngày thông minh" width="300" />

**Nhận diện ngày lễ** — Tự động nhận diện 「白色情人節」(Valentine Trắng), 「38 節」(Ngày Quốc tế Phụ nữ)

<img src="docs/screenshots/03-2-auto-date-2.jpg" alt="Nhận diện ngày lễ" width="300" />

</details>

<details>
<summary><strong>Thống kê và lịch sử — Phân tích chi tiêu và tìm kiếm ngữ nghĩa</strong></summary>

**Trang thống kê** — Tổng hợp và thống kê riêng theo thu nhập/chi tiêu

<img src="docs/screenshots/04-summary.jpg" alt="Trang thống kê" width="300" />

**Trang lịch sử** — Hỗ trợ lọc và tìm kiếm ngữ nghĩa AI

<img src="docs/screenshots/04-records-1.jpg" alt="Trang lịch sử" width="300" />

**Tìm kiếm ngữ nghĩa** — Ví dụ 「花在老婆大人身上多少錢」(chi bao nhiêu tiền cho vợ)

<img src="docs/screenshots/04-records-2.jpg" alt="Tìm kiếm ngữ nghĩa" width="300" />

</details>

<details>
<summary><strong>Trang cài đặt — Tính cách AI và quản lý ngân sách</strong></summary>

**Cài đặt tính cách AI và chỉ dẫn**

<img src="docs/screenshots/05-settings.jpg" alt="Trang cài đặt" width="300" />

**Ngân sách, API Key, quản lý danh mục**

<img src="docs/screenshots/05-settings-2.jpg" alt="Trang cài đặt 2" width="300" />

</details>

---

## 🛠️ Công nghệ

| Tầng | Công nghệ |
|------|------|
| **Frontend** | React 19 · TypeScript · Vite 8 · Tailwind CSS 4 · Zustand · React Router 7 · Recharts · Web Speech API · PWA |
| **Backend** | Node.js · Express 5 · TypeScript · Prisma 6 · Zod 4 · JWT · bcrypt · express-rate-limit |
| **AI / LLM** | Google Gemini (mặc định) · OpenAI — Dual engine tự do chuyển đổi |
| **Testing** | Vitest · Testing Library · Supertest · Playwright |
| **Triển khai** | Docker · Docker Compose · Cloudflare Tunnel · PostgreSQL / SQLite |

<details>
<summary><strong>Danh sách model AI khả dụng</strong></summary>

#### Google Gemini

| Model | Đặc điểm | Giá (per 1M tokens) |
|------|------|---------------------|
| `gemini-3-flash-preview` ⭐ | Mạnh hơn 2.5 Pro, nhanh gấp 3x (khuyên dùng) | $0.50 / $3.00 |
| `gemini-3.1-flash-lite-preview` | Nhanh nhất, rẻ nhất | $0.25 / $1.50 |
| `gemini-2.5-flash` | Ổn định, có khả năng suy luận | — |
| `gemini-2.5-pro` | Suy luận mạnh nhất | — |
| `gemini-2.0-flash` | Nhanh, ổn định | — |

#### OpenAI

| Model | Đặc điểm | Giá (per 1M tokens) |
|------|------|---------------------|
| `gpt-5.4-mini` ⭐ | Mạnh hơn GPT-5 mini, nhanh gấp 2x, 400k context (khuyên dùng) | $0.75 / $4.50 |
| `gpt-5.4-nano` | Chi phí thấp nhất | $0.20 / $1.25 |
| `gpt-5.4` | Model flagship, suy luận phức tạp | — |
| `gpt-5.4-pro` | Chất lượng cao nhất | — |
| `gpt-4.1` | Thế hệ trước, hỗ trợ fine-tuning | — |
| `gpt-4.1-mini` | Phiên bản nhanh thế hệ trước | — |

</details>

---

## ⚡ Bắt đầu nhanh

### Yêu cầu môi trường

- **Node.js** >= 22 ／ **npm** >= 10
- **Docker** + **Docker Compose** (tùy chọn, dùng để triển khai container)

### Cách 1: Docker khởi động một lệnh

```bash
git clone https://github.com/robin-li/vibe-money-book.git
cd vibe-money-book
cp backend/.env.example backend/.env   # Chỉnh sửa .env điền các cấu hình cần thiết
docker compose up -d --build
```

Sau khi khởi động: Frontend `http://localhost:80` ／ Backend API `http://localhost:3000`

### Cách 2: Phát triển local

```bash
git clone https://github.com/robin-li/vibe-money-book.git
cd vibe-money-book

# Backend
cd backend
npm install
cp .env.example .env                   # Chỉnh sửa .env điền các cấu hình cần thiết
npx prisma migrate dev
npx prisma db seed
npm run dev                            # http://localhost:3000

# Frontend (mở terminal khác)
cd frontend
npm install
npm run dev                            # http://localhost:5173
```

---

## 📁 Cấu trúc dự án

```
vibe-money-book/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── controllers/     # Tầng điều khiển
│   │   ├── services/        # Logic nghiệp vụ (bao gồm tích hợp LLM)
│   │   ├── routes/          # Định nghĩa API route
│   │   ├── middlewares/     # Middleware (xác thực, giới hạn tốc độ, xử lý lỗi)
│   │   ├── validators/      # Zod validation Schema
│   │   ├── prompts/         # LLM Prompt template
│   │   ├── config/          # File cấu hình
│   │   ├── types/           # TypeScript type
│   │   ├── app.ts           # Express App
│   │   └── server.ts        # Entry point
│   ├── prisma/              # Prisma Schema & Migrations
│   └── Dockerfile
├── frontend/                # Frontend SPA
│   ├── src/
│   │   ├── pages/           # Component trang
│   │   ├── components/      # Component tái sử dụng
│   │   ├── hooks/           # Custom Hooks
│   │   ├── stores/          # Zustand Store
│   │   ├── lib/             # Hàm tiện ích / API call
│   │   ├── types/           # TypeScript type
│   │   ├── App.tsx          # Root component
│   │   └── main.tsx         # Entry point
│   └── Dockerfile
├── tests/                   # E2E test (Playwright)
├── docs/                    # Tài liệu đặc tả (PRD, SRD, Dev Plan, v.v.)
├── scripts/
│   ├── start.sh             # Khởi động một lệnh (Docker + Cloudflare Tunnel)
│   └── stop.sh              # Dừng một lệnh
├── docker-compose.yml
└── playwright.config.ts
```

---

## 🔐 Biến môi trường

Cấu hình trong `backend/.env` (có thể sao chép từ `.env.example`):

| Biến | Mô tả | Giá trị mặc định |
|------|------|--------|
| `DATABASE_URL` | Chuỗi kết nối cơ sở dữ liệu | `file:./data/dev.db` (SQLite) |
| `JWT_SECRET` | Khóa ký JWT | — (bắt buộc) |
| `JWT_EXPIRE` | Thời gian hết hạn Token | `7d` |
| `GEMINI_MODEL` | Tên model Gemini | `gemini-3-flash-preview` |
| `OPENAI_MODEL` | Tên model OpenAI | `gpt-5.4-mini` |
| `LLM_TIMEOUT_MS` | Thời gian chờ yêu cầu LLM | `30000` |
| `PORT` | Cổng server | `3000` |
| `NODE_ENV` | Môi trường chạy | `development` |
| `CORS_ORIGIN` | CORS nguồn được phép | — |
| `VITE_API_BASE_URL` | Frontend API Base URL | — |
| `RATE_LIMIT_LLM_PER_MIN` | Giới hạn tốc độ LLM API | `20` |
| `RATE_LIMIT_API_PER_MIN` | Giới hạn tốc độ API chung | `100` |
| `RATE_LIMIT_AUTH_PER_MIN` | Giới hạn tốc độ API xác thực | `10` |

> **Lưu ý**: File `.env` chứa thông tin nhạy cảm, **nghiêm cấm** commit vào version control. API Key LLM của người dùng chỉ lưu tại frontend localStorage, truyền qua Header `X-LLM-API-Key`, backend dùng xong là xóa ngay.

---

## 📡 Tổng quan API

Tất cả API đều có prefix `/api/v1`, định dạng phản hồi thống nhất là JSON.

| Module | Phương thức | Endpoint | Mô tả |
|------|------|------|------|
| **Auth** | POST | `/auth/register` | Đăng ký người dùng |
| | POST | `/auth/login` | Đăng nhập người dùng |
| **User** | GET | `/users/me` | Lấy thông tin cá nhân |
| | PUT | `/users/me` | Cập nhật cài đặt (tính cách AI, ngân sách, AI engine) |
| **Transactions** | GET | `/transactions` | Truy vấn danh sách giao dịch (hỗ trợ phân trang, lọc) |
| | POST | `/transactions` | Thêm giao dịch mới |
| | DELETE | `/transactions/:id` | Xóa giao dịch |
| **Budget** | GET | `/budgets` | Truy vấn ngân sách theo danh mục |
| | PUT | `/budgets` | Cập nhật ngân sách theo danh mục |
| **Stats** | GET | `/stats/summary` | Tổng kết chi tiêu hàng tháng |
| | GET | `/stats/categories` | Thống kê chi tiêu theo danh mục |
| **AI** | POST | `/ai/parse` | Phân tích ngôn ngữ tự nhiên (trích xuất + phản hồi) |
| | POST | `/ai/query` | Tìm kiếm ngữ nghĩa giao dịch |

---

## 🐳 Triển khai

### Phương án 1: Triển khai local + Cloudflare Tunnel (khuyên dùng)

Chạy qua Docker Compose trên máy local, kết hợp Cloudflare Tunnel cung cấp truy cập HTTPS ra bên ngoài, không mất chi phí, toàn quyền kiểm soát.

```
Người dùng → Cloudflare Edge (HTTPS + CDN)
            ↓ Cloudflare Tunnel
       Máy chủ local
       ├─ frontend (:80)  → moneybook.smart-codings.com
       └─ backend  (:3000) → moneybook-api.smart-codings.com
```

```bash
# Khởi động một lệnh (Docker container + Cloudflare Tunnel)
./scripts/start.sh

# Dừng một lệnh
./scripts/stop.sh
```

| Dịch vụ | Địa chỉ local | URL công khai |
|------|---------|---------|
| Frontend | `http://localhost:80` | `https://moneybook.smart-codings.com` |
| Backend API | `http://localhost:3000` | `https://moneybook-api.smart-codings.com` |

<details>
<summary><strong>Cấu hình Cloudflare Tunnel lần đầu</strong></summary>

**Yêu cầu tiên quyết**: [Docker](https://docs.docker.com/get-docker/) + Docker Compose, [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/) (`brew install cloudflared`), tên miền đã được quản lý trên Cloudflare

```bash
# 1. Đăng nhập Cloudflare
cloudflared tunnel login

# 2. Tạo Tunnel
cloudflared tunnel create vibe-money-book

# 3. Tạo file cấu hình (~/.cloudflared/config-moneybook.yml)
# tunnel: <TUNNEL_ID>
# credentials-file: ~/.cloudflared/<TUNNEL_ID>.json
# ingress:
#   - hostname: moneybook.your-domain.com
#     service: http://localhost:80
#   - hostname: moneybook-api.your-domain.com
#     service: http://localhost:3000
#   - service: http_status:404

# 4. Thiết lập DNS routing
cloudflared tunnel --config ~/.cloudflared/config-moneybook.yml route dns vibe-money-book moneybook.your-domain.com
cloudflared tunnel --config ~/.cloudflared/config-moneybook.yml route dns vibe-money-book moneybook-api.your-domain.com
```

</details>

### Phương án 2: Triển khai đám mây

| Tầng | Dịch vụ khuyên dùng |
|------|---------|
| Full-stack (Docker) | Railway / Render / Fly.io |
| Frontend | Vercel / Netlify |
| Backend | Railway / Render / Fly.io |
| Cơ sở dữ liệu | Supabase PostgreSQL / Railway PostgreSQL |

---

## 🧑‍💻 Hướng dẫn phát triển

<details>
<summary><strong>Các lệnh thường dùng</strong></summary>

```bash
# Backend
cd backend
npm run dev              # Khởi động server phát triển (hot reload)
npm run build            # Biên dịch TypeScript
npm run lint             # Kiểm tra ESLint
npm run test             # Chạy unit test
npm run test:watch       # Chế độ watch test
npm run prisma:migrate   # Chạy database migration
npm run prisma:seed      # Chèn dữ liệu seed
npm run prisma:generate  # Tạo Prisma Client

# Frontend
cd frontend
npm run dev              # Khởi động Vite dev server
npm run build            # Build phiên bản production
npm run lint             # Kiểm tra ESLint
npm run test             # Chạy unit test
npm run preview          # Xem trước phiên bản production

# E2E test (thư mục gốc)
npm run test:e2e         # Chạy Playwright E2E test
npm run test:e2e:headed  # E2E test có giao diện trình duyệt
npm run test:e2e:ui      # Playwright UI mode
```

</details>

### Route trang

| Route | Trang | Mô tả |
|------|------|------|
| `/` | DashboardPage | Bảng điều khiển trang chủ, bao gồm nhập liệu ghi sổ |
| `/stats` | StatsPage | Biểu đồ thống kê chi tiêu |
| `/history` | HistoryPage | Danh sách giao dịch + Tìm kiếm ngữ nghĩa AI |
| `/settings` | SettingsPage | Cài đặt tính cách AI / Ngân sách / AI engine |
| `/login` | LoginPage | Đăng nhập |
| `/register` | RegisterPage | Đăng ký |

---

## 🤖 Quy trình phát triển

Dự án này áp dụng quy trình phát triển phần mềm [**Vibe-SDLC**](https://github.com/robin-li/Vibe-SDLC), do AI hỗ trợ hoàn thành viết đặc tả, phân tách nhiệm vụ và vòng lặp phát triển.

Xem chi tiết quá trình phát triển:
- [Nhật ký phát triển 1](docs/worklog/Vibe-Money-Book-Worklog-1.md)
- [Nhật ký phát triển 2](docs/worklog/Vibe-Money-Book-Worklog-2.md)
- [Nhật ký phát triển 3](docs/worklog/Vibe-Money-Book-Worklog-3.md)

---

## 📄 License

Dự án này được cấp phép theo [MIT License](LICENSE).

---

## 🙏 Lời cảm ơn

- [**Vibe-SDLC**](https://github.com/robin-li/Vibe-SDLC) — Quy trình phát triển phần mềm hỗ trợ bởi AI
- [**Claude Code**](https://claude.ai/code) — Đối tác AI trong quá trình phát triển
- Thiết kế UI tuân theo nguyên tắc **Mobile-First**, ưu tiên trải nghiệm sử dụng trên điện thoại
