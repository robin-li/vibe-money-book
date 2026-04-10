# 01-6 UI/UX 設計規格文件

> **專案名稱**：Vibe Money Book — 語音記帳應用
> **版本**：v1.4
> **最後更新**：2026-04-11

---

## 目錄

1. [設計原則](#1-設計原則)
2. [Design Tokens](#2-design-tokens)
3. [頁面佈局與元件](#3-頁面佈局與元件)
4. [互動狀態與動畫](#4-互動狀態與動畫)
5. [PRD-F-012 新類別對話流 UI](#5-prd-f-012-新類別對話流-ui)
6. [PRD-F-013 + PRD-F-017 AI 引擎選擇 UI](#6-prd-f-013--prd-f-017-ai-引擎選擇-ui)
7. [響應式設計](#7-響應式設計)
8. [無障礙設計 (Accessibility)](#8-無障礙設計-accessibility)

---

## 關聯文件

| 文件 | 關係 |
|------|------|
| [`01-1-PRD.md`](./01-1-PRD.md) | 產品功能需求（本文件的 UI 規格依據） |
| [`01-2-SRD.md`](./01-2-SRD.md) | 技術架構與資料模型（前端技術棧、API 設計） |
| [`01-5-API_Spec.md`](./01-5-API_Spec.md) | API 端點規格（前端串接依據） |
| [`API_Spec.yaml`](./API_Spec.yaml) | OpenAPI 合約 |

---

## 1. 設計原則

| 原則 | 說明 |
|------|------|
| **Mobile-first** | 以手機螢幕（375px）為基準設計，向上擴展至平板與桌面 |
| **低摩擦互動** | 核心操作（記帳）在 1–2 步內完成，減少選單深度 |
| **情緒化介面** | 透過 AI 人設回饋、色彩與動畫傳遞情緒，讓記帳不再枯燥 |
| **資訊層級清晰** | 利用字體大小、粗細、色彩建立視覺層級，重要數字一眼可見 |
| **一致性** | 統一圓角、陰影、間距規範，確保元件視覺風格一致 |

---

## 2. Design Tokens

### 2.1 色彩系統 (Color Palette)

#### 主色 (Primary)

| Token | 色碼 | 用途 |
|-------|------|------|
| `--color-primary` | `#00C896` | 主按鈕、進度條、icon 背景、AI 回饋卡片標題 |
| `--color-primary-light` | `#E6FAF3` | AI 回饋卡片背景（主色 10% opacity） |
| `--color-primary-dark` | `#00A67A` | 主按鈕 hover/pressed 狀態 |

#### 警示色 (Semantic)

| Token | 色碼 | 用途 |
|-------|------|------|
| `--color-danger` | `#FF4757` | 支出金額、刪除操作、超支警告 |
| `--color-danger-light` | `#FFE8EA` | 支出 icon 背景（紅色圓角方塊） |
| `--color-warning` | `#FFA502` | 預算 20%–50% 剩餘時進度條 |
| `--color-success` | `#00C896` | 預算 ≥50% 剩餘時進度條（同主色） |

#### 中性色 (Neutral)

| Token | 色碼 | 用途 |
|-------|------|------|
| `--color-bg` | `#F5F5F5` | 頁面整體背景 |
| `--color-surface` | `#FFFFFF` | 卡片、輸入框背景 |
| `--color-text-primary` | `#1A1A2E` | 主文字（標題、金額） |
| `--color-text-secondary` | `#8E8E93` | 次要文字（標籤、說明、時間戳） |
| `--color-text-tertiary` | `#C7C7CC` | placeholder、分隔線 |
| `--color-border` | `#E5E5EA` | 輸入框邊框、分隔線 |

### 2.2 字體系統 (Typography)

| Token | 大小 | 粗細 | 行高 | 用途 |
|-------|------|------|------|------|
| `--font-display` | 36px | 700 (Bold) | 1.2 | 預算百分比主數字 |
| `--font-headline` | 24px | 700 (Bold) | 1.3 | 支出金額（如 $250） |
| `--font-title` | 18px | 600 (Semi-bold) | 1.4 | 區塊標題（最近帳目） |
| `--font-body` | 16px | 400 (Regular) | 1.5 | AI 回饋內文、交易描述 |
| `--font-caption` | 14px | 400 (Regular) | 1.4 | 標籤文字（預算剩餘、本月支出） |
| `--font-small` | 12px | 400 (Regular) | 1.3 | 時間戳、footer 文字 |

**字體家族**：`-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang TC", "Microsoft JhengHei", sans-serif`

### 2.3 間距系統 (Spacing)

基礎單位：`4px`

| Token | 值 | 用途 |
|-------|------|------|
| `--space-xs` | 4px | 最小間距（icon 與文字間距） |
| `--space-sm` | 8px | 緊湊元件內間距 |
| `--space-md` | 12px | 標籤間距、列表項目間距 |
| `--space-lg` | 16px | 卡片內 padding、區塊間距 |
| `--space-xl` | 20px | 卡片間距 |
| `--space-2xl` | 24px | 頁面左右 padding |
| `--space-3xl` | 32px | 大區塊間距 |

### 2.4 圓角 (Border Radius)

| Token | 值 | 用途 |
|-------|------|------|
| `--radius-sm` | 8px | 標籤（類別 badge）、小按鈕 |
| `--radius-md` | 12px | 輸入框、交易列表項目 icon |
| `--radius-lg` | 16px | 卡片（預算卡片、AI 回饋卡片） |
| `--radius-xl` | 20px | 對話泡泡 |
| `--radius-full` | 50% | 圓形按鈕（發送、麥克風）、頭像 |

### 2.5 陰影 (Elevation / Shadow)

| Token | 值 | 用途 |
|-------|------|------|
| `--shadow-card` | `0 2px 8px rgba(0,0,0,0.06)` | 一般卡片 |
| `--shadow-card-hover` | `0 4px 16px rgba(0,0,0,0.10)` | 卡片 hover 狀態 |
| `--shadow-input` | `0 1px 4px rgba(0,0,0,0.04)` | 輸入框 |
| `--shadow-fab` | `0 4px 12px rgba(0,200,150,0.30)` | 浮動操作按鈕（發送按鈕） |

### 2.6 動畫 (Animation)

| Token | 值 | 用途 |
|-------|------|------|
| `--transition-fast` | `150ms ease-out` | 按鈕 hover/active 狀態 |
| `--transition-normal` | `250ms ease-in-out` | 卡片展開、元件切換 |
| `--transition-slow` | `400ms ease-in-out` | 頁面轉場 |

---

## 3. 頁面佈局與元件

### 3.1 首頁 `/`（記帳主頁）

> 視覺參考：[ui/home.html](./ui/home.html)（當前保真度：wireframe）
>
> 元件 anchor：[Header](./ui/home.html#header) · [預算卡片](./ui/home.html#budget-card) · [AI 回饋卡片](./ui/home.html#ai-feedback) · [最近帳目](./ui/home.html#recent-transactions) · [輸入區](./ui/home.html#input-bar) · [Footer](./ui/home.html#footer) · [底部 Tab Bar](./ui/home.html#tab-bar)

首頁為應用核心頁面，採用垂直堆疊佈局，從上至下分為五個區域。

#### 整體結構

```
┌──────────────────────────────────────┐
│  Header                              │
├──────────────────────────────────────┤
│  預算卡片 (Budget Card)               │
├──────────────────────────────────────┤
│  AI 回饋卡片 (AI Feedback Card)       │
├──────────────────────────────────────┤
│  最近帳目列表 (Recent Transactions)    │
│  (可滾動區域)                          │
├──────────────────────────────────────┤
│  輸入區 (Input Bar) - 固定於 Tab Bar 上方│
├──────────────────────────────────────┤
│  底部 Tab Bar - 固定底部              │
└──────────────────────────────────────┘
```

> **佈局說明**：首頁同時顯示底部 Tab Bar 與輸入區。Tab Bar 固定於螢幕最底部（含 safe-area），輸入區固定於 Tab Bar 正上方（`bottom` = Tab Bar 高度）。可滾動區域的底部 padding 需預留兩者的總高度。

#### 3.1.1 Header

> 視覺參考：[ui/home.html#header](./ui/home.html#header)

```
┌──────────────────────────────────────┐
│ [🟢 icon] Vibe Money Book     [⚙️]  │
│           語音記帳教練                │
└──────────────────────────────────────┘
```

| 元素 | 規格 |
|------|------|
| 容器 | 高度 56px、padding `0 --space-2xl`、背景 `--color-surface` |
| App icon | 32×32px 綠色圓角方塊（radius `--radius-sm`）、內含白色錢包圖示 |
| 主標題 | `--font-title`、`--color-text-primary`、文字「Vibe Money Book」 |
| 副標題 | `--font-small`、`--color-text-secondary`、文字「語音記帳教練」、letter-spacing 2px |
| 設定按鈕 | 24×24px 齒輪 icon、`--color-text-secondary`、點擊跳轉 `/settings` |

#### 3.1.2 預算卡片 (Budget Card)

> 視覺參考：[ui/home.html#budget-card](./ui/home.html#budget-card)

```
┌──────────────────────────────────────┐
│ 預算剩餘                 本月支出       │
│ 99%                      $250        │
│ ████████████████████░░  ← 進度條      │
│ $0                    目標：$20,000   │
└──────────────────────────────────────┘
```

| 元素 | 規格 |
|------|------|
| 容器 | 背景 `--color-surface`、radius `--radius-lg`、shadow `--shadow-card`、padding `--space-lg`、margin `0 --space-2xl` |
| 「預算剩餘」標籤 | `--font-caption`、`--color-text-secondary`、左上角 |
| 百分比主數字 | `--font-display`、`--color-text-primary`、左側 |
| 「本月支出」標籤 | `--font-caption`、`--color-text-secondary`、右上角 |
| 支出金額 | `--font-headline`、`--color-danger`、右側 |
| 進度條 | 高度 8px、radius `--radius-full`、背景 `--color-border`、填充色依預算剩餘比例變化（見 PRD-F-007） |
| 進度條左側 | `--font-small`、`--color-text-secondary`、文字「$0」 |
| 進度條右側 | `--font-small`、`--color-text-secondary`、文字「目標：$XX,XXX」 |

**進度條顏色規則**（對應 PRD-F-007）：

| 剩餘預算 | 填充色 | 附加效果 |
|---------|--------|---------|
| ≥ 50% | `--color-success` (#00C896) | 無 |
| 20%–50% | `--color-warning` (#FFA502) | 無 |
| < 20% | `--color-danger` (#FF4757) | 呼吸燈脈衝動畫（1.5s 週期） |

#### 3.1.3 AI 回饋卡片 (AI Feedback Card)

> 視覺參考：[ui/home.html#ai-feedback](./ui/home.html#ai-feedback)

```
┌──────────────────────────────────────┐
│ [💬]  溫柔管家 的即時回饋                │
│       「享受美味是很重要的。預算目前仍     │
│        很充裕，請繼續保持...」           │
└──────────────────────────────────────┘
```

| 元素 | 規格 |
|------|------|
| 容器 | 背景 `--color-primary-light`、radius `--radius-lg`、padding `--space-lg`、margin `0 --space-2xl`、無陰影 |
| 人設 icon | 36×36px 圓形（`--radius-full`）、背景 `--color-primary`、內含白色對話泡泡 icon |
| 人設標籤 | `--font-caption`、`--color-text-secondary`、格式「{人設名稱} 的即時回饋」 |
| 回饋引號 | `--font-body`、`--color-primary-dark`、左右加綠色引號裝飾 |

**人設名稱對應**：

| Persona 值 | 顯示名稱 | Icon 變體 |
|------------|---------|----------|
| `gentle` | 溫柔管家 💖 | 對話泡泡 |
| `sarcastic` | 毒舌教練 🔥 | 火焰 |
| `guilt_trip` | 心疼天使 🥺 | 愛心 |

#### 3.1.4 最近帳目列表 (Recent Transactions)

> 視覺參考：[ui/home.html#recent-transactions](./ui/home.html#recent-transactions)

```
┌──────────────────────────────────────┐
│ 🕐 最近帳目                          │
├──────────────────────────────────────┤
│ [🔴↓] 拉麵                    -$250  │
│       飲食 · 上午01:07               │
├──────────────────────────────────────┤
│ [🔴↓] 捷運                    -$35   │
│       交通 · 上午08:30               │
└──────────────────────────────────────┘
```

| 元素 | 規格 |
|------|------|
| 標題列 | flex、justify-content: space-between、padding `--space-lg --space-2xl` |
| 「最近帳目」 | `--font-title`、`--color-text-primary`、前綴 🕐 emoji |
| 交易項目容器 | padding `--space-md --space-2xl`、底部分隔線 `--color-border` 1px |
| 類別 icon 區 | 40×40px 圓角方塊（radius `--radius-md`）、背景 `--color-danger-light`、內含紅色向下箭頭 icon |
| 商家名稱 | `--font-body`、font-weight 600、`--color-text-primary` |
| 類別標籤 | `--font-small`、`--color-text-secondary`、背景 `#F0F0F0`、radius `--radius-sm`、padding `2px 8px` |
| 時間戳 | `--font-small`、`--color-text-secondary`、格式「上午/下午 HH:MM」 |
| 金額 | `--font-title`、`--color-danger`、右對齊、格式「-$XXX」 |
| 左滑操作 | 左滑顯示紅色刪除按鈕（Mobile 手勢） |

#### 3.1.5 輸入區 (Input Bar) — 固定底部

> 視覺參考：[ui/home.html#input-bar](./ui/home.html#input-bar)

```
┌──────────────────────────────────────┐
│ [例如：中午吃拉麵 280 元    ] [🎤] [➤]│
└──────────────────────────────────────┘
```

| 元素 | 規格 |
|------|------|
| 容器 | position: fixed、bottom: **Tab Bar 高度（56px + safe-area-inset-bottom）**、背景 `--color-surface`、padding `--space-md --space-2xl`、shadow `0 -2px 8px rgba(0,0,0,0.06)` |
| 文字輸入框 | flex: 1、高度 44px、radius `--radius-xl`、背景 `--color-bg`、border 1px `--color-border`、padding `0 --space-lg`、`--font-body` |
| Placeholder | `--color-text-tertiary`、文字「例如：中午吃拉麵 280 元」 |
| 麥克風按鈕 | 36×36px、`--color-text-secondary`、無背景、點擊觸發語音輸入 |
| 發送按鈕 | 40×40px 圓形、背景 `--color-primary`、白色箭頭 icon、shadow `--shadow-fab` |

#### 3.1.6 Footer

> 視覺參考：[ui/home.html#footer](./ui/home.html#footer)

```
┌──────────────────────────────────────┐
│ POWERED BY AI · 精準記帳 · 情緒滿分        │
└──────────────────────────────────────┘
```

| 元素 | 規格 |
|------|------|
| 容器 | padding `--space-sm 0`、text-align: center |
| 文字 | `--font-small`、`--color-text-tertiary`、letter-spacing 1px、文字「POWERED BY AI · 精準記帳 · 情緒滿分」（不綁定特定 LLM 廠牌） |

---

### 3.2 統計頁 `/stats`

> 視覺參考：[ui/stats.html](./ui/stats.html)（當前保真度：wireframe）
>
> 元件 anchor：[時間篩選](./ui/stats.html#time-filter) · [總支出摘要](./ui/stats.html#summary-card) · [消費分佈圓餅圖](./ui/stats.html#pie-chart) · [類別排行](./ui/stats.html#category-ranking)

#### 整體結構

```
┌──────────────────────────────────────┐
│  Header（含返回按鈕 + 標題「統計」）    │
├──────────────────────────────────────┤
│  時間篩選列                           │
│  [本週] [本月✓] [自訂]                │
├──────────────────────────────────────┤
│  總支出摘要卡片                       │
│  本月總支出 $12,580 / $20,000         │
├──────────────────────────────────────┤
│  消費分佈圓餅圖 (Recharts)            │
│       ┌──────┐                       │
│       │  🥧  │                       │
│       └──────┘                       │
│  飲食 40% │ 交通 15% │ 娛樂 20% ...   │
├──────────────────────────────────────┤
│  類別排行列表                         │
│  1. 飲食  $5,032  ████████           │
│  2. 娛樂  $2,516  ████               │
│  3. 交通  $1,887  ███                │
├──────────────────────────────────────┤
│  底部 Tab Bar                        │
└──────────────────────────────────────┘
```

| 元素 | 規格 |
|------|------|
| 時間篩選 | 膠囊按鈕群組（Segmented Control）、選中狀態：背景 `--color-primary`、文字白色 |
| 總支出摘要 | 卡片樣式同預算卡片、含進度條 |
| 圓餅圖 | Recharts `<PieChart>`、尺寸 200×200px、中央顯示總金額 |
| 圖例 | 圓餅圖下方橫向排列、每項含色塊 + 類別名 + 百分比 |
| 類別排行 | 垂直列表、每項含排名 + 類別名 + 金額 + 水平比例條 |
| 比例條 | 高度 6px、radius `--radius-full`、顏色依類別色彩表 |
| 空狀態 | 當月無消費記錄時（total_spent = 0）：圓餅圖區域顯示灰色虛線圓圈 + 居中文字「本月尚無消費記錄」、`--font-body`、`--color-text-tertiary`；類別排行列表隱藏 |

**類別色彩表**：

| 類別 | 色碼 |
|------|------|
| 飲食 | `#FF6B6B` |
| 交通 | `#4ECDC4` |
| 娛樂 | `#45B7D1` |
| 購物 | `#F9CA24` |
| 日用品 | `#A29BFE` |
| 醫療 | `#FD79A8` |
| 教育 | `#6C5CE7` |
| 其他 | `#B2BEC3` |

**自訂類別色彩策略**：使用者新增的自訂類別（如「寵物」）從以下備用色彩池依序取用，避免與預設類別色碼重複：

| 順序 | 色碼 |
|------|------|
| 1 | `#E17055` |
| 2 | `#00B894` |
| 3 | `#FDCB6E` |
| 4 | `#E84393` |
| 5 | `#0984E3` |
| 6 | `#6C5CE7` |
| 7 | `#FAB1A0` |
| 8 | `#55EFC4` |
| 9 | `#74B9FF` |
| 10 | `#A29BFE` |
| 11 | `#FD79A8` |
| 12 | `#FFEAA7` |

> 自訂類別按建立順序從色彩池取色。若超過 12 個自訂類別（含預設共 20 個上限），循環使用。

---

### 3.3 記錄頁 `/history`

> 視覺參考：[ui/history.html](./ui/history.html)(當前保真度：wireframe)
>
> 元件 anchor：[篩選區](./ui/history.html#filter-bar) · [記錄列表](./ui/history.html#history-list) · [交易詳情展開](./ui/history.html#transaction-detail)

#### 整體結構

```
┌──────────────────────────────────────┐
│  Header（「記錄」+ 搜尋 icon）         │
├──────────────────────────────────────┤
│  篩選區                              │
│  [全部類別 ▼]  [本月 ▼]               │
├──────────────────────────────────────┤
│  日期分組標題 — 2026/03/17（今天）     │
│  ┌────────────────────────────────┐  │
│  │ [🍽️] 拉麵                -$250 │  │
│  │      飲食 · 01:07              │  │
│  ├────────────────────────────────┤  │
│  │ [🚌] 捷運                -$35  │  │
│  │      交通 · 08:30              │  │
│  └────────────────────────────────┘  │
│  日期分組標題 — 2026/03/16（昨天）     │
│  ┌────────────────────────────────┐  │
│  │ ...                            │  │
│  └────────────────────────────────┘  │
├──────────────────────────────────────┤
│  底部 Tab Bar                        │
└──────────────────────────────────────┘
```

| 元素 | 規格 |
|------|------|
| 篩選下拉 | 圓角膠囊樣式、背景 `--color-bg`、radius `--radius-xl`、下拉選單出現 |
| 日期分組標題 | `--font-caption`、`--color-text-secondary`、padding `--space-md --space-2xl`、sticky 定位 |
| 交易項目 | 同首頁最近帳目列表的交易項目樣式 |
| 空狀態 | 居中顯示插畫 + 文字「還沒有記帳紀錄，開始記帳吧！」 |
| 點擊交易項目 | 展開交易詳情（含 AI 評論、原始輸入文字） |
| 左滑操作 | 顯示紅色「刪除」按鈕 |

**交易詳情展開面板**：

```
┌──────────────────────────────────────┐
│  拉麵                         -$250  │
│  飲食 · 2026/03/17 01:07             │
│  ──────────────────────────────────  │
│  原始輸入：「半夜吃拉麵 250」          │
│  AI 評論：「享受美味是很重要的...」     │
│  情緒標籤：[鼓勵]                     │
│  ──────────────────────────────────  │
│  [刪除此筆記錄]                       │
└──────────────────────────────────────┘
```

---

### 3.4 設定頁 `/settings`

> 視覺參考：[ui/settings.html](./ui/settings.html)（當前保真度：wireframe）
>
> 元件 anchor：[Header](./ui/settings.html#header) · [使用者資訊](./ui/settings.html#user-info) · [語言設定](./ui/settings.html#language) · [人設選擇](./ui/settings.html#persona-select) · [AI 指示](./ui/settings.html#ai-instructions) · [月預算](./ui/settings.html#monthly-budget) · [AI 引擎](./ui/settings.html#ai-engine) · [類別管理](./ui/settings.html#category-management) · [登出](./ui/settings.html#logout)

設定頁依序堆疊使用者設定區塊，由上至下分為九個 section，支援垂直滾動，底部留白預留 Tab Bar 高度。每個 section 為卡片樣式的獨立容器，彼此以 `--space-xl` 間隔。

#### 整體結構

```
┌──────────────────────────────────────┐
│  Header「⚙️ 設定」                     │
├──────────────────────────────────────┤
│  使用者資訊區                         │
│  [👤] 使用者名稱 / email              │
├──────────────────────────────────────┤
│  語言設定 (PRD-F-015)                 │
│  [🇹🇼 繁體中文                    ▼]   │
├──────────────────────────────────────┤
│  AI 人設選擇                          │
│  ┌──────┐ ┌──────┐ ┌──────┐         │
│  │ 🔥   │ │ 💖✓  │ │ 🥺   │         │
│  │毒舌   │ │溫柔   │ │情勒   │         │
│  └──────┘ └──────┘ └──────┘         │
├──────────────────────────────────────┤
│  AI 指示 (User Prompt)                │
│  ┌──────────────────────────────┐    │
│  │ 讓 AI 了解你的個性與偏好...    │    │
│  │                              │    │
│  └──────────────────────────────┘    │
│  0/1000                     [儲存]    │
├──────────────────────────────────────┤
│  月預算設定                           │
│  $ [20,000                    ]       │
├──────────────────────────────────────┤
│  AI 引擎設定 (PRD-F-013 + PRD-F-017)  │
│  ┌────────┐ ┌────────┐                │
│  │🤖 OpenAI│ │✨ Gemini│               │
│  │ (預設) │ │         │                │
│  └────────┘ └────────┘                │
│  ┌────────┐ ┌────────┐                │
│  │🧠 Anth. │ │⚡ xAI   │               │
│  └────────┘ └────────┘                │
│  API Key  [••••••••••]  [👁] [測試]    │
│  ✅ 金鑰有效                           │
│  模型  [gpt-4o-mini (推薦)       ▼]    │
│        Fast, cheap, good for chat    │
├──────────────────────────────────────┤
│  類別管理                             │
│  支出類別                             │
│  [飲食] [交通] [娛樂] [寵物 ✕]        │
│  收入類別                             │
│  [薪資] [獎金] [副業 ✕]               │
│  ────────────────────────────────    │
│  新增  [支出 ▼] [類別名稱...] [+ 新增] │
├──────────────────────────────────────┤
│  [           登出            ]        │
├──────────────────────────────────────┤
│  底部 Tab Bar                        │
└──────────────────────────────────────┘
```

> **重大變更說明**：v1.4 起此章節全面對齊 M6（PRD-F-015 i18n）與 M7（PRD-F-017 多供應商 + 模型選擇）的實作現況。相較 v1.3 以前：（1）新增 §3.4.3 語言設定、§3.4.5 AI 指示；（2）§3.4.7 AI 引擎由 2 供應商擴展為 4 供應商 + 模型下拉 + 獨立測試按鈕；（3）§3.4.8 原「類別預算管理」更正為「類別管理」（純增刪，無金額）；（4）移除已廢棄的「其他設定 / 幣別」。

#### 3.4.1 Header

> 視覺參考：[ui/settings.html#header](./ui/settings.html#header)

| 元素 | 規格 |
|------|------|
| 容器 | 高度 56px、margin-bottom `--space-lg`、flex 垂直對齊置中 |
| 標題 | `--font-title`、font-weight 600、`--color-text-primary`、前綴 ⚙️、i18n key `settings:title` |
| 儲存中指示器 | 條件渲染：`saving === true` 時顯示；右側靠齊、`--font-small`、`--color-text-secondary`、i18n key `common:saving` |

#### 3.4.2 使用者資訊區

> 視覺參考：[ui/settings.html#user-info](./ui/settings.html#user-info)

顯示當前登入使用者的基本資訊，唯讀（資料來自後端 `GET /users/profile`）。

**呈現**：

| 元素 | 規格 |
|------|------|
| 容器 | 卡片樣式、背景 `--color-surface`、radius `--radius-lg`、shadow `--shadow-card`、padding `--space-lg` |
| 頭像 | 40×40px 圓形、背景 `--color-bg`、內含 👤 emoji |
| 使用者名稱 | `--font-body`、font-weight 600、`--color-text-primary` |
| Email | `--font-small`、`--color-text-secondary` |

**顯示邏輯**：`userName` 為空時顯示 i18n key `settings:userInfo.defaultName`（預設名稱）。`userEmail` 為空時顯示佔位 `user@email.com`。

#### 3.4.3 語言設定 (PRD-F-015)

> 視覺參考：[ui/settings.html#language](./ui/settings.html#language)
>
> 對應任務：T-606 語言設定與偏好持久化

允許使用者切換介面語言，切換後即時生效（全頁面字串重渲染）、寫入 user profile `language` 欄位與 localStorage，下次啟動自動載入。

**呈現**：

| 元素 | 規格 |
|------|------|
| 容器 | 卡片樣式同 §3.4.2 |
| 標題 | `--font-caption`、`--color-text-secondary`、margin-bottom `--space-md`、i18n key `settings:language.title` |
| 下拉選單 | 全寬、padding `--space-lg --space-sm`、radius `--radius-lg`、border 2px `--color-primary`、背景 `--color-surface`、`--font-body`、`appearance: none`、cursor pointer |
| 選項文字格式 | `{國旗 emoji} {i18n 語言名稱}` |

**欄位**：

| 選項 value | i18n key | 國旗 | 說明 |
|-----------|---------|------|------|
| `zh-TW` | `settings:language.zhTW` | 🇹🇼 | 繁體中文（預設） |
| `en` | `settings:language.en` | 🇺🇸 | 英文 |
| `zh-CN` | `settings:language.zhCN` | 🇨🇳 | 簡體中文 |
| `vi` | `settings:language.vi` | 🇻🇳 | 越南文 |

**互動**：

| 操作 | 行為 |
|------|------|
| 變更選項 | 1. 呼叫 `useSettingsStore.setLanguage(lang)`；2. 切換 `i18next` 當前語言；3. PUT `/users/profile` `language` 欄位；4. 寫入 localStorage 供下次啟動；5. 觸發全頁面 React tree 重渲染，所有 `useTranslation` 字串即時更新 |

#### 3.4.4 AI 人設選擇

> 視覺參考：[ui/settings.html#persona-select](./ui/settings.html#persona-select)

使用者選擇 AI 記帳教練的語氣，共三種人設。

**呈現**：

| 元素 | 規格 |
|------|------|
| 容器 | 卡片樣式同 §3.4.2 |
| 標題 | `--font-caption`、`--color-text-secondary`、margin-bottom `--space-md`、i18n key `settings:persona.title` |
| 卡片排列容器 | `flex gap-md` |
| 人設卡片 | 100×100px、radius `--radius-lg`、垂直排列 emoji + 名稱、cursor pointer、`aria-pressed` 反映選中狀態 |
| 人設卡片（default） | 背景 `--color-surface`、shadow `--shadow-card`、hover `--shadow-card-hover` |
| 人設卡片（selected） | 背景 `--color-primary-light`、border 2px `--color-primary` |
| 人設卡片（disabled） | `disabled` 於 `saving === true` 時 |
| 人設 emoji | `text-2xl` 尺寸 |
| 人設名稱 | `--font-caption`、margin-top `--space-xs` |

**欄位**：

| value | emoji | i18n key |
|-------|-------|----------|
| `sarcastic` | 🔥 | `settings:persona.sarcastic` |
| `gentle` | 💖 | `settings:persona.gentle` |
| `guilt_trip` | 🥺 | `settings:persona.guilt_trip` |

**互動**：點擊卡片即時 `updatePersona(value)`，對應 PUT `/users/profile` `persona` 欄位。

#### 3.4.5 AI 指示 (User Prompt)

> 視覺參考：[ui/settings.html#ai-instructions](./ui/settings.html#ai-instructions)

提供自由文字欄位，讓使用者輸入偏好、背景或指引，作為 LLM 的 User-level prompt 前置。最多 1000 字，儲存後所有 AI 互動（記帳、查詢、回饋）都會自動帶入此內容。

**呈現**：

| 元素 | 規格 |
|------|------|
| 容器 | 卡片樣式同 §3.4.2 |
| 標題 | `--font-caption`、`--color-text-secondary`、margin-bottom `--space-md`、i18n key `settings:aiInstructions.title` |
| textarea | 全寬、5 行、radius `--radius-md`、border 1px `--color-border`、background `--color-bg`、padding `--space-lg --space-md`、`--font-body`、`--color-text-primary`、focus border `--color-primary`、`resize: none` |
| Placeholder | `--color-text-tertiary`、i18n key `settings:aiInstructions.placeholder` |
| 字數計數 | 左下角、`--font-small`、`--color-text-secondary`、格式 `{current}/1000` |
| 儲存按鈕 | 條件渲染：`editing === true` 時顯示於右下角；高度 36px、padding `--space-lg`、radius `--radius-md`、背景 `--color-primary`、文字白色、`--font-caption`、font-weight 600、disabled opacity 0.5 |

**欄位**：

| 名稱 | 類型 | 必填 | 驗證規則 | 錯誤訊息 | 說明 |
|------|------|------|----------|---------|------|
| `ai_instructions` | `text (textarea)` | ❌ | 長度 0–1000 字元 | 前端 `maxLength=1000` 硬限制 | 可選欄位，儲存至 user profile；空值表示不帶 User prompt |

**互動**：

| 操作 | 行為 |
|------|------|
| 輸入 | 標記 `editing = true`、更新本地 state、即時顯示字數計數 |
| 點擊儲存按鈕 或 失焦（onBlur） | 若內容相較 store 有變動：呼叫 `updateAIInstructions(value)` → PUT `/users/profile` `ai_instructions`；清除 `editing` state |

#### 3.4.6 月預算設定

> 視覺參考：[ui/settings.html#monthly-budget](./ui/settings.html#monthly-budget)

設定使用者每月總預算，用於首頁預算卡片與統計頁的進度條計算（對應 PRD-F-007）。

**呈現**：

| 元素 | 規格 |
|------|------|
| 容器 | 卡片樣式同 §3.4.2 |
| 標題 | `--font-caption`、`--color-text-secondary`、margin-bottom `--space-md`、i18n key `settings:budget.title` |
| 輸入列容器 | `flex items-center gap-sm` |
| 前綴符號 | `--font-body`、font-weight 600、`--color-text-primary`、文字 `$`（依 locale 可調整） |
| 數字輸入框 | flex-1、高度 48px、`type=number`、`inputMode=numeric`、`min=0`、radius `--radius-md`、border 1px `--color-border`、background `--color-bg`、padding `--space-lg`、右對齊、focus border `--color-primary` |
| 當前設定提示 | 條件渲染：`monthlyBudget > 0 && !editing` 時顯示於下方；`--font-small`、`--color-text-secondary`、格式 `{settings:budget.currentSetting}：{formatCurrency(value)}` |

**欄位**：

| 名稱 | 類型 | 必填 | 驗證規則 | 錯誤訊息 | 說明 |
|------|------|------|----------|---------|------|
| `monthly_budget` | `number (integer)` | ❌ | `>= 0`、非 NaN | — | 單位視 locale，預設 TWD |

**互動**：

| 操作 | 行為 |
|------|------|
| 輸入數字 | 標記 `editing = true`、更新本地 state |
| 失焦（onBlur）或按 Enter | 驗證 `val >= 0 && !isNaN`；通過則呼叫 `updateBudget(val)` → PUT `/users/profile` `monthly_budget`；清除 `editing` state |
| 輸入無效 | 還原為 store 最新值，不呼叫 API |

#### 3.4.7 AI 引擎設定

> 視覺參考：[ui/settings.html#ai-engine](./ui/settings.html#ai-engine)
>
> **詳細規格見 §6 PRD-F-013 + PRD-F-017 AI 引擎選擇 UI**

此 section 為 AI 引擎所有子元件的根容器，含供應商選擇、API Key 輸入與測試、動態模型選擇下拉。本小節僅標示佈局位置，元件細節與互動行為請見 §6。

#### 3.4.8 類別管理

> 視覺參考：[ui/settings.html#category-management](./ui/settings.html#category-management)

讓使用者檢視所有類別（分支出 / 收入兩區），刪除自訂類別，以及新增自訂類別。

> **重要**：此區域為「類別增刪管理」，不含每類別的預算金額設定。類別僅儲存 `name` 與 `type`（income / expense），不綁定預算金額。（相較 v1.3 的「類別預算管理」已更正）

**呈現**：

| 元素 | 規格 |
|------|------|
| 容器 | 卡片樣式同 §3.4.2 |
| 區塊標題 | `--font-caption`、`--color-text-secondary`、margin-bottom `--space-md`、i18n key `settings:categories.title` |
| 支出區塊標題 | `--font-body`、font-weight 600、`--color-danger`、margin-bottom `--space-sm`、i18n key `settings:categories.expenseCategories` |
| 收入區塊標題 | `--font-body`、font-weight 600、`--color-success`、margin-bottom `--space-sm`、i18n key `settings:categories.incomeCategories` |
| 類別標籤容器 | `flex flex-wrap gap-sm`、margin-bottom `--space-lg` |
| 支出類別標籤 | 圓角膠囊、`--font-caption`、padding `--space-xs --space-md`、radius `--radius-md`、背景 `#FFF0F0`、文字 `--color-danger` |
| 收入類別標籤 | 同上但背景 `#F0FFF0`、文字 `--color-success` |
| 自訂類別刪除按鈕 | 類別標籤內部追加 ✕ icon、`--color-danger`、font-bold、hover 變深紅；僅 `isCustom === true` 時顯示 |
| 預設類別 | 無刪除按鈕（只能刪除自訂類別） |
| 新增區分隔線 | `border-top 1px --color-border`、padding-top `--space-md` |
| 類型選擇下拉 | 高度 36px、flex-shrink-0、radius `--radius-md`、border 1px `--color-border`、padding `--space-sm`、`--font-caption`；選項 `expense` / `income`，i18n key `common:expense` / `common:income` |
| 類別名稱輸入框 | flex-1、min-w-0、高度 36px、radius `--radius-md`、border 1px `--color-border`、padding `--space-sm`、`--font-body` |
| 新增按鈕 | 高度 36px、min-w-[80px]、padding `--space-lg`、flex-shrink-0、whitespace-nowrap、radius `--radius-md`、背景 `--color-primary`、文字白色、`--font-caption`、font-weight 600；disabled 條件：`adding \|\| !name.trim()` |

**欄位**：

| 名稱 | 類型 | 必填 | 驗證規則 | 錯誤訊息 | 說明 |
|------|------|------|----------|---------|------|
| `newCategoryType` | `select` | ✅ | `expense \| income` | — | 新類別類型 |
| `newCategoryName` | `text` | ✅ | 長度 1–50 字元、trim 後非空、同類型下唯一 | 後端回傳的 `message`（顯示為 `window.alert`） | 類別顯示名稱 |

**互動**：

| 操作 | 行為 |
|------|------|
| 點擊自訂類別的 ✕ | 1. `window.confirm(settings:categories.deleteConfirm)`；2. 確認後 `deleteCategory(category, type)` → DELETE `/categories/{id}` |
| 輸入類別名稱 | 更新本地 state；按 Enter 觸發新增 |
| 點擊「新增」按鈕 | 1. trim 名稱；2. 標記 `adding = true`；3. `createCategory(name.trim(), type)` → POST `/categories`；4. 成功清空輸入框；5. 失敗顯示後端 `err.response.data.message`（alert）；6. finally 清除 `adding` |

#### 3.4.9 登出按鈕

> 視覺參考：[ui/settings.html#logout](./ui/settings.html#logout)

**呈現**：

| 元素 | 規格 |
|------|------|
| 按鈕 | 全寬、高度 48px、radius `--radius-md`、背景 `--color-surface`、shadow `--shadow-card`、文字 `--color-danger`、`--font-body`、font-weight 600、hover shadow 加深 |
| 文字 | i18n key `common:logout` |

**互動**：點擊後呼叫 `authStore.logout()`，導航至 `/login`。

---

### 3.5 底部 Tab Bar

> **視覺參考**：底部 Tab Bar 為**共享元件**，已整合在各頁面 wireframe 底部（見 [ui/home.html#tab-bar](./ui/home.html#tab-bar)、[ui/stats.html#tab-bar](./ui/stats.html#tab-bar)、[ui/history.html#tab-bar](./ui/history.html#tab-bar)、[ui/settings.html#tab-bar](./ui/settings.html#tab-bar)）。實作時應抽離為單一共用元件，各頁面透過 `aria-current="page"` 與 `data-active` 標記當前 tab。

```
┌──────────────────────────────────────┐
│  [🏠 首頁]  [📊 統計]  [📋 記錄]  [⚙️ 設定] │
└──────────────────────────────────────┘
```

| 元素 | 規格 |
|------|------|
| 容器 | position: fixed、bottom: 0、高度 56px + safe-area-inset-bottom、背景 `--color-surface`、border-top 1px `--color-border` |
| Tab 項目 | flex: 1、垂直排列（icon + 文字）、點擊區域 minimum 44×44px |
| 未選中 | icon + 文字 `--color-text-secondary` |
| 選中 | icon + 文字 `--color-primary`、icon 上方加 2px 圓點指示器 |

**Tab 項目對應**：

| Tab | Icon | 文字 | 路由 |
|-----|------|------|------|
| 首頁 | 🏠 house | 首頁 | `/` |
| 統計 | 📊 chart | 統計 | `/stats` |
| 記錄 | 📋 list | 記錄 | `/history` |
| 設定 | ⚙️ gear | 設定 | `/settings` |

---

### 3.6 登入頁 `/login` 與註冊頁 `/register`

> 視覺參考：[ui/login.html](./ui/login.html) · [ui/register.html](./ui/register.html)（當前保真度：wireframe）
>
> 元件 anchor：[Logo](./ui/login.html#logo) · [認證表單（登入）](./ui/login.html#auth-form) · [認證表單（註冊）](./ui/register.html#auth-form)

#### 整體結構

```
┌──────────────────────────────────────┐
│                                      │
│         [🟢 App Icon 64×64]          │
│         Vibe Money Book               │
│         語音記帳教練                   │
│                                      │
│  Email    [                    ]      │
│  密碼     [                    ]      │
│                                      │
│  [        登入 / 註冊         ]       │
│                                      │
│  還沒有帳號？立即註冊                  │
│  （或：已有帳號？返回登入）             │
└──────────────────────────────────────┘
```

| 元素 | 規格 |
|------|------|
| Logo 區 | 居中、margin-top 20% 螢幕高度 |
| 輸入框 | 全寬、高度 48px、radius `--radius-md`、padding `--space-lg`、border 1px `--color-border` |
| 主按鈕 | 全寬、高度 48px、背景 `--color-primary`、文字白色、radius `--radius-md`、font-weight 600 |
| 切換連結 | `--font-caption`、`--color-primary`、text-decoration: underline |

---

## 4. 互動狀態與動畫

### 4.1 語音錄音中 (Voice Recording)

> 對應 PRD-F-001
>
> 視覺參考：[ui/home.html#input-bar](./ui/home.html#input-bar)（麥克風按鈕與輸入框載體）

| 狀態 | UI 變化 |
|------|---------|
| **閒置** | 麥克風 icon 為 `--color-text-secondary`，無動畫 |
| **按住錄音中** | 麥克風 icon 變為 `--color-primary`；輸入框背景變為 `--color-primary-light`；麥克風 icon 外圈顯示**脈衝動畫**（2 圈同心圓以 0.8s 週期向外擴散並淡出）；輸入框 placeholder 替換為「正在聆聽...」 |
| **辨識中** | 脈衝動畫停止；輸入框顯示辨識中文字（即時更新）；placeholder 替換為「辨識中...」 |
| **辨識完成** | 辨識結果填入輸入框；自動觸發送出（或等待使用者確認） |
| **辨識失敗** | 輸入框顯示紅色提示「語音辨識失敗，請重試或改用文字輸入」、自動消失（3 秒後） |

### 4.2 AI 解析結果確認卡片 (Parsed Result Card)

> 對應 PRD-F-004
>
> 視覺參考：[ui/home.html#recent-transactions](./ui/home.html#recent-transactions)（卡片插入於此區塊頂部）

使用者輸入送出後，AI 解析完成時在「最近帳目」區域頂部以卡片形式顯示結構化結果，使用者可確認或修改。

```
┌──────────────────────────────────────┐
│  ✨ AI 幫你整理好了                    │
│  ──────────────────────────────────  │
│  金額    $180                        │
│  類別    🍽️ 飲食                     │
│  商家    拉麵店                       │
│  日期    2026/03/17                  │
│  ──────────────────────────────────  │
│  [修改]                   [✓ 確認記帳]│
└──────────────────────────────────────┘
```

| 元素 | 規格 |
|------|------|
| 容器 | 背景 `--color-surface`、radius `--radius-lg`、shadow `--shadow-card`、border-left 4px `--color-primary`、padding `--space-lg`、margin `--space-md --space-2xl` |
| 標題 | `--font-body`、font-weight 600、`--color-text-primary`、前綴 ✨ |
| 欄位標籤 | `--font-caption`、`--color-text-secondary`、寬度 60px |
| 欄位值 | `--font-body`、`--color-text-primary`、金額使用 `--color-danger` |
| [確認記帳] 按鈕 | 背景 `--color-primary`、文字白色、radius `--radius-sm`、高度 40px、font-weight 600 |
| [修改] 按鈕 | 背景透明、border 1px `--color-border`、文字 `--color-text-secondary`、radius `--radius-sm`、高度 40px |

**修改模式**：點擊 [修改] 後，欄位值變為可編輯的輸入框，類別變為下拉選單，[修改] 按鈕變為 [取消]，[確認記帳] 維持不變。修改完成後點擊 [確認記帳] 提交修改後的資料。

> **設計說明**：PRD-F-004 的「確認/修改」操作在前端本地完成，修改後的資料直接提交至 `POST /transactions`，無需額外的修改 API。

### 4.3 AI 處理中 (AI Processing)

> 對應 PRD-F-004、PRD-F-006
>
> 視覺參考：[ui/home.html#ai-feedback](./ui/home.html#ai-feedback)（typing indicator 出現位置）、[ui/home.html#recent-transactions](./ui/home.html#recent-transactions)（skeleton loading 出現位置）

| 狀態 | UI 變化 |
|------|---------|
| **送出後** | 輸入框清空；最近帳目區域頂部出現 skeleton loading 動畫（shimmer 效果） |
| **AI 解析中** | AI 回饋卡片顯示載入狀態：三個圓點跳動動畫（typing indicator）、文字「AI 正在分析...」 |
| **AI 回覆完成** | 載入動畫淡出（200ms）；新交易項目以 slide-down 動畫（300ms）插入列表頂部；AI 回饋卡片內文以 fade-in（300ms）更新 |
| **AI 處理失敗** | 顯示 toast 提示「記帳失敗，請稍後重試」、背景 `--color-danger` |

### 4.4 預算警示 (Budget Alert)

> 對應 PRD-F-007
>
> 視覺參考：[ui/home.html#budget-card](./ui/home.html#budget-card)（進度條與百分比數字所在位置）

| 預算狀態 | 視覺效果 |
|---------|---------|
| ≥ 50% 剩餘 | 進度條綠色，無額外效果 |
| 20%–50% 剩餘 | 進度條黃色；預算百分比數字變為 `--color-warning` |
| < 20% 剩餘 | 進度條紅色；百分比數字變為 `--color-danger`；進度條觸發**呼吸燈脈衝動畫**（opacity 在 0.6–1.0 之間循環、1.5s 週期） |
| 超支（0%） | 進度條滿紅且超出視覺（overflow 動畫）；百分比顯示「超支」；卡片 border 變 `--color-danger` 2px |

### 4.5 刪除操作

> 視覺參考：[ui/home.html#recent-transactions](./ui/home.html#recent-transactions)（首頁最近帳目項目）、[ui/history.html#history-list](./ui/history.html#history-list)（記錄頁列表項目）

| 操作 | UI 行為 |
|------|---------|
| 左滑交易項目 | 項目右側滑出紅色「刪除」區塊（寬 80px）、背景 `--color-danger`、白色垃圾桶 icon |
| 點擊刪除 | 彈出確認對話框：「確定要刪除這筆記錄嗎？」、[取消] / [刪除]（紅色） |
| 確認刪除 | 項目以 slide-out-left（300ms）動畫移除；下方項目上移填補空間 |

### 4.6 頁面轉場

> 視覺參考：跨頁全域動畫規範，不綁定單一 wireframe。實作時可觀察各頁面 wireframe 的 `<main>` 容器作為轉場目標區域：[ui/home.html](./ui/home.html) · [ui/stats.html](./ui/stats.html) · [ui/history.html](./ui/history.html) · [ui/settings.html](./ui/settings.html)

| 轉場 | 動畫 |
|------|------|
| Tab 切換 | 內容區 fade-in（200ms），無水平滑動 |
| 進入詳情頁 | slide-in-from-right（300ms） |
| 返回 | slide-in-from-left（300ms） |
| Modal / Sheet | 底部滑入（slide-up、300ms）+ 背景 overlay fade-in |

---

## 5. PRD-F-012 新類別對話流 UI

> 對應 PRD-F-012：AI 自動偵測並新增消費類別
>
> 視覺參考：對話流 UI 寄生於首頁 AI 回饋區（[ui/home.html#ai-feedback](./ui/home.html#ai-feedback)）與底部 Sheet。現行 wireframe 為靜態版，對話泡泡的動態切換與 Sheet 彈出僅以本規格書文字描述為準；未來升級為 mockup 時應於 `ui/home.html` 追加對話泡泡與 Sheet 的結構性 `<section>`。

### 5.1 對話流程

> 視覺參考：[ui/home.html#ai-feedback](./ui/home.html#ai-feedback)（AI 建議泡泡出現於回饋卡片區域）

當 AI 偵測到使用者的消費無法歸入現有類別時，觸發以下對話流程：

```
使用者：「帶毛毛去看獸醫 1200」

                    ┌─ AI 解析 ─┐
                    │ is_new_category: true
                    │ suggested_category: "寵物"
                    └────────────┘

AI（對話泡泡）：
┌──────────────────────────────────────┐
│ [💖] 我覺得這筆消費屬於「寵物」🐾，   │
│      但你的類別中沒有這項。            │
│                                      │
│      要新增「寵物」類別嗎？            │
│                                      │
│  ┌──────┐  ┌──────────┐  ┌────────┐ │
│  │ 確認  │  │ 修改名稱  │  │ 選現有 │ │
│  └──────┘  └──────────┘  └────────┘ │
└──────────────────────────────────────┘
```

### 5.2 三個操作分支

> 視覺參考：[ui/home.html#ai-feedback](./ui/home.html#ai-feedback)（操作按鈕組渲染於 AI 回饋泡泡下緣；Sheet 從 [ui/home.html#tab-bar](./ui/home.html#tab-bar) 上方彈入）

#### 分支 A：確認新增

```
使用者點擊 [確認]
  ↓
系統新增「寵物」類別（is_custom: true）
  ↓
AI 回覆：
┌──────────────────────────────────────┐
│ [💖] 已新增「寵物」類別 🐾             │
│      這筆 $1,200 已記入寵物類別。      │
│      「毛毛的醫療費辛苦了，           │
│       希望毛毛健健康康的！」           │
└──────────────────────────────────────┘
```

#### 分支 B：修改名稱

```
使用者點擊 [修改名稱]
  ↓
底部彈出輸入 Sheet：
┌──────────────────────────────────────┐
│  修改類別名稱                         │
│  ┌──────────────────────────────┐    │
│  │ 寵物醫療                      │    │
│  └──────────────────────────────┘    │
│  ⚠️ 類別名稱 2–50 字元                 │
│                                      │
│  [取消]              [確認新增]       │
└──────────────────────────────────────┘
  ↓
系統新增修改後的類別名稱並完成記帳
```

#### 分支 C：選擇現有類別

```
使用者點擊 [選現有]
  ↓
底部彈出選擇 Sheet：
┌──────────────────────────────────────┐
│  選擇類別                             │
│                                      │
│  [🍽️ 飲食] [🚌 交通] [🎬 娛樂]       │
│  [🛍️ 購物] [🧴 日用品] [🏥 醫療]     │
│  [📚 教育] [📦 其他]                  │
│                                      │
│  [取消]                               │
└──────────────────────────────────────┘
  ↓
使用者選擇「醫療」→ 系統以「醫療」類別完成記帳
```

### 5.3 對話泡泡設計規格

> 視覺參考：[ui/home.html#ai-feedback](./ui/home.html#ai-feedback)（對話泡泡容器沿用 AI 回饋卡片的 `--color-primary-light` 底色與圓角樣式）

| 元素 | 規格 |
|------|------|
| AI 泡泡容器 | 最大寬度 85%、背景 `--color-primary-light`、radius `--radius-xl`、padding `--space-lg`、左對齊 |
| AI 頭像 | 28×28px 圓形、背景依人設色彩、左上角 |
| 建議類別名稱 | font-weight 600、背景 `--color-primary` 20% opacity、radius `--radius-sm`、padding `2px 8px` |
| 操作按鈕組 | 橫向排列、gap `--space-sm` |
| [確認] 按鈕 | 背景 `--color-primary`、文字白色、radius `--radius-sm`、高度 36px |
| [修改名稱] 按鈕 | 背景透明、border 1px `--color-primary`、文字 `--color-primary`、radius `--radius-sm` |
| [選現有] 按鈕 | 背景透明、border 1px `--color-border`、文字 `--color-text-secondary`、radius `--radius-sm` |

### 5.4 相似類別合併提示

> 視覺參考：[ui/home.html#ai-feedback](./ui/home.html#ai-feedback)（相似類別提示泡泡共用 AI 回饋卡片樣式）

當 AI 偵測到建議的新類別與現有類別相似時（如「咖啡」vs「飲食」）：

```
┌──────────────────────────────────────┐
│ [💖] 這筆消費可能屬於「咖啡」，       │
│      不過你已經有「飲食」類別了。      │
│                                      │
│      建議歸入「飲食」，               │
│      還是要新增「咖啡」？             │
│                                      │
│  ┌──────────┐  ┌──────────┐         │
│  │ 歸入飲食  │  │ 新增咖啡  │         │
│  └──────────┘  └──────────┘         │
└──────────────────────────────────────┘
```

### 5.5 類別上限提示

> 視覺參考：[ui/home.html#ai-feedback](./ui/home.html#ai-feedback)（上限提示泡泡渲染於 AI 回饋區，按鈕跳轉 [ui/settings.html#category-management](./ui/settings.html#category-management)）

當使用者已達 20 個類別上限時：

```
┌──────────────────────────────────────┐
│ [💖] 類別數量已達上限（50 個），       │
│      這筆消費已歸入「其他」。          │
│      你可以到設定頁整理類別喔～        │
│                                      │
│  ┌──────────────┐                    │
│  │ 前往設定整理   │                    │
│  └──────────────┘                    │
└──────────────────────────────────────┘
```

---

## 6. PRD-F-013 + PRD-F-017 AI 引擎選擇 UI

> 對應 PRD-F-013（M3 基礎版）：使用者可選擇偏好的 AI 引擎並輸入 API Key
>
> 對應 PRD-F-017（M7 擴展）：**多供應商**（OpenAI / Gemini / Anthropic / xAI）、**動態模型選擇**、**API Key 測試驗證按鈕**、**預設 Key 後備機制**
>
> 視覺參考：[ui/settings.html#ai-engine](./ui/settings.html#ai-engine)
>
> 對應任務：T-701（多供應商 LLM 引擎擴展）、T-702（AI 供應商與模型 API）、T-704（設定頁 AI 引擎進階設定 UI）

### 6.1 設定頁 AI 引擎區塊

> 視覺參考：[ui/settings.html#ai-engine](./ui/settings.html#ai-engine)

位於設定頁「月預算設定（§3.4.6）」與「類別管理（§3.4.8）」之間，為 AI 引擎所有子元件的根容器。

```
┌──────────────────────────────────────┐
│  AI 引擎設定                          │
│                                      │
│  供應商選擇                           │
│  ┌──────────┐ ┌──────────┐            │
│  │ 🤖 OpenAI │ │ ✨ Gemini │           │
│  │ (預設) ✓ │ │          │            │
│  └──────────┘ └──────────┘            │
│  ┌──────────┐ ┌──────────┐            │
│  │ 🧠 Anthropic│ │ ⚡ xAI   │          │
│  └──────────┘ └──────────┘            │
│                                      │
│  OpenAI API Key                      │
│  ┌────────────────────┐ [👁] [測試]   │
│  │ sk-••••••••••••    │              │
│  └────────────────────┘              │
│  ✅ 金鑰有效                           │
│  （或）「已使用系統預設金鑰」            │
│                                      │
│  模型                                │
│  ┌──────────────────────────────┐    │
│  │ gpt-4o-mini (推薦)        ▼  │    │
│  └──────────────────────────────┘    │
│  Fast, cheap, good for chat          │
└──────────────────────────────────────┘
```

### 6.2 供應商選擇 (PRD-F-017)

> 視覺參考：[ui/settings.html#ai-engine](./ui/settings.html#ai-engine)（供應商卡片網格位於 section 頂部）

**呈現**：

| 元素 | 規格 |
|------|------|
| 區塊標題 | `--font-caption`、`--color-text-secondary`、margin-bottom `--space-md`、i18n key `settings:aiEngine.title` |
| 卡片網格容器 | `grid grid-cols-2 gap-md mb-lg` |
| 供應商卡片 | 高度 80px、radius `--radius-lg`、垂直排列 emoji + 名稱、cursor pointer、`aria-pressed` 反映選中狀態 |
| 卡片（default） | 背景 `--color-surface`、shadow `--shadow-card`、hover `--shadow-card-hover` |
| 卡片（selected） | 背景 `--color-primary-light`、border 2px `--color-primary` |
| 卡片（disabled） | `disabled` 於 `saving === true` 時 |
| 供應商 emoji | `text-lg` 尺寸 |
| 供應商名稱 | `--font-body`、font-weight 600 |
| 「(預設)」標籤 | 條件渲染：`value === 'openai'` 時顯示；`--font-small`、`--color-text-secondary`、i18n key `settings:aiEngine.default` |

**供應商對應**：

| value | emoji | 顯示名稱 | 系統預設 |
|-------|-------|---------|---------|
| `openai` | 🤖 | OpenAI | ✅ |
| `gemini` | ✨ | Gemini | — |
| `anthropic` | 🧠 | Anthropic | — |
| `xai` | ⚡ | xAI | — |

> **備註**：v1.5 起預設引擎由 Gemini 改為 OpenAI（對應 PR #197、PRD v1.5）。四個供應商的選擇邏輯詳見 PRD-F-017 與 SDD ADR-007。

**互動**：

| 操作 | 行為 |
|------|------|
| 點擊卡片 | 觸發 `handleEngineChange(value)` 流程：<br>1. 呼叫 `updateAIEngine(engine)` → PUT `/users/profile` `ai_engine`<br>2. 重置 `keyValidationStatus` 為 `idle`<br>3. 若該供應商有 user-supplied key 或 `hasDefaultKey[engine] === true`，呼叫 `fetchModels(engine, key?)` 取得動態模型清單<br>4. 從新模型清單挑出 `isDefault === true` 的模型，自動呼叫 `updateAIModel(model.id)` 寫入 user profile |

### 6.3 API Key 輸入與測試 (PRD-F-017)

> 視覺參考：[ui/settings.html#ai-engine](./ui/settings.html#ai-engine)（API Key 輸入列位於供應商卡片下方）

**呈現**：

| 元素 | 規格 |
|------|------|
| 標籤 | `--font-caption`、`--color-text-secondary`、margin-bottom `--space-sm`、i18n key `settings:aiEngine.apiKeyLabel`（含 `engine` 變數內插） |
| 輸入列容器 | `flex items-center gap-sm` |
| Key 輸入框容器 | `relative flex-1` |
| Key 輸入框 | 全寬、高度 48px、type=password（預設）/ text（切換）、radius `--radius-md`、border 1px `--color-border`、background `--color-bg`、padding `--space-lg` + 右側預留 48px、`--font-body`、focus border `--color-primary` |
| 顯示/隱藏按鈕 | 絕對定位右側居中、`--color-text-secondary`、hover `--color-text-primary`、icon 切換 👁️ ↔ 🙈 |
| 測試按鈕 | 高度 48px、padding `--space-lg`、radius `--radius-md`、背景 `--color-primary`、文字白色、`--font-caption`、font-weight 600、hover 變深、disabled 條件：`!currentApiKey \|\| status === 'validating'`；i18n key `settings:aiEngine.validate` |
| Key 狀態文字 | `--font-caption`、margin-top `--space-sm`、`role="status"`；依狀態變色（見下表） |
| 預設 Key 提示 | 條件渲染：`!currentApiKey && hasDefaultKey[engine]` 時顯示；`--font-caption`、margin-top `--space-sm`、`text-green-600`、i18n key `settings:aiEngine.defaultKeyConfigured` |

**Key 驗證狀態**：

| 狀態 | 視覺 | i18n key | 觸發時機 |
|------|------|---------|---------|
| `idle` | 不顯示狀態文字 | — | 初始載入 / 切換供應商後 |
| `validating` | `--color-text-secondary` | `settings:aiEngine.validating` | 點擊測試按鈕、`POST /ai/validate-key` 等待中 |
| `valid` | `--color-success` | `settings:aiEngine.valid` | 驗證回傳 `{ ok: true }` |
| `invalid` | `--color-danger` | `settings:aiEngine.invalid` 或 `keyValidationMessage` | 驗證回傳 `{ ok: false }`，後端區分：Key 格式錯誤 / Key 無效 / Model 不支援 |

**欄位**：

| 名稱 | 類型 | 必填 | 驗證規則 | 錯誤訊息 | 說明 |
|------|------|------|----------|---------|------|
| `api_key` | `password` | ❌（若後端 `hasDefaultKey[engine] === true`） | 長度與格式依供應商而定（例：OpenAI `sk-` 前綴） | 來自後端 `keyValidationMessage` | 儲存於 localStorage `llm_api_keys.{engine}`，**不上傳至後端**；後端驗證時臨時傳送 |

**互動**：

| 操作 | 行為 |
|------|------|
| 切換顯示 / 隱藏 | 切換 input `type` |
| 輸入 Key | 即時寫入 state + localStorage `llm_api_keys.{engine}` |
| 點擊測試按鈕 | 1. `saveApiKeys(apiKeys)`（確保已持久化）<br>2. 呼叫 `validateApiKey(key, engine, selectedModel)` → `POST /ai/validate-key`<br>3. 驗證成功後 `fetchModels(engine, key)` 重新載入可用模型（可能擴增） |
| 清空 Key 並失焦 | localStorage 同步清空、狀態回到 `idle`；若 `hasDefaultKey[engine] === true` 則顯示「使用系統預設金鑰」綠色提示 |

> **安全約定**：API Key **僅儲存在使用者裝置的 localStorage**，不會 commit 至後端資料庫。後端驗證端點 `POST /ai/validate-key` 為無狀態 proxy，僅 in-memory 轉發至 LLM 供應商後即丟棄。詳見 SDD ADR-003。

### 6.4 模型選擇下拉 (PRD-F-017)

> 視覺參考：[ui/settings.html#ai-engine](./ui/settings.html#ai-engine)（模型下拉選單位於 API Key 區塊下方）

動態從當前供應商取得可用模型清單，使用者可從下拉選單選擇具體模型。清單透過 `GET /ai/models?engine={engine}&api_key={key?}` 動態載入，支援 `MODEL_INCLUDE` / `MODEL_EXCLUDE` 環境變數過濾（詳見 PRD-F-017）。

**呈現**：

| 元素 | 規格 |
|------|------|
| 容器 | 條件渲染：僅 `currentProviderModels.length > 0` 時出現；margin-top `--space-lg` |
| 標籤 | `--font-caption`、`--color-text-secondary`、margin-bottom `--space-sm`、i18n key `settings:aiEngine.modelLabel` |
| 載入指示 | 條件渲染：`modelsLoading === true` 時顯示於標籤右側；`--color-text-tertiary`、inline、i18n key `settings:loading` |
| 下拉選單 | 全寬、高度 48px、radius `--radius-md`、border 1px `--color-border`、background `--color-bg`、padding `--space-lg`、`--font-body`、`--color-text-primary`、focus border `--color-primary`；disabled 條件：`saving \|\| modelsLoading` |
| 模型選項文字 | 格式 `{model.name} {isDefault ? t('settings:aiEngine.recommended') : ''}` |
| 模型說明 | 條件渲染：有選中模型且 `description` 非空時顯示於下拉下方；margin-top `--space-sm`、`--font-small`、`--color-text-secondary` |

**模型資料結構**（來自 `GET /ai/models`）：

| 欄位 | 類型 | 說明 |
|------|------|------|
| `id` | `string` | 模型 ID，例：`gpt-4o-mini`、`claude-sonnet-4-5-20250514` |
| `name` | `string` | 顯示名稱 |
| `description` | `string?` | 簡短描述（選用） |
| `isDefault` | `boolean` | 是否為該供應商的推薦預設模型 |

**選擇策略**：

| 條件 | 選中模型 |
|------|---------|
| `aiModel` 存在且在 `currentProviderModels` 清單中 | 使用 `aiModel` |
| `aiModel` 不在清單中或為空 | 使用 `isDefault === true` 的模型 |
| 清單中無 `isDefault` | 使用清單第一個模型 |
| 清單為空 | 整個模型下拉區段**不渲染** |

**互動**：

| 操作 | 行為 |
|------|------|
| 切換模型 | 1. 呼叫 `updateAIModel(modelId)` → PUT `/users/profile` `ai_model`<br>2. 若當前供應商有 user-supplied key，自動呼叫 `validateApiKey(key, engine, modelId)` 以新模型重新驗證（Key 對 Model A 有效不等於對 Model B 有效） |
| 無 Key 但 `hasDefaultKey[engine]` | 下拉仍可用（`fetchModels` 使用 server 端 fallback key 取得清單） |
| 後端 `MODEL_INCLUDE/EXCLUDE` 過濾 | 清單內容自動依環境變數過濾，前端無需額外處理 |

### 6.5 錯誤提示（記帳時）

> 視覺參考：[ui/home.html#input-bar](./ui/home.html#input-bar)（錯誤提示浮動於輸入區上方，按鈕跳轉 [ui/settings.html#ai-engine](./ui/settings.html#ai-engine)）

當使用者送出記帳請求但當前引擎無可用 Key（既無 user Key 也無 server 預設 Key）或 Key 驗證失敗時，在記帳流程中顯示提示：

```
┌──────────────────────────────────────┐
│ ⚠️ 請先在設定頁輸入 AI 引擎的 API Key    │
│    才能使用記帳功能。                   │
│                                      │
│    [前往設定]                         │
└──────────────────────────────────────┘
```

---

## 7. 響應式設計

### 7.1 斷點定義

| 斷點 | 寬度範圍 | 目標裝置 |
|------|---------|---------|
| `xs` | < 375px | 小螢幕手機（SE 系列） |
| `sm` | 375px – 428px | 標準手機（iPhone 12/13/14） |
| `md` | 429px – 768px | 大螢幕手機、小平板 |
| `lg` | 769px – 1024px | 平板（iPad） |
| `xl` | > 1024px | 桌面瀏覽器 |

### 7.2 佈局適配規則

| 斷點 | 佈局調整 |
|------|---------|
| `xs` / `sm` | 單欄佈局、卡片全寬（margin `0 --space-lg`）、底部 Tab Bar 顯示 |
| `md` | 單欄佈局、卡片最大寬度 480px 居中 |
| `lg` | 雙欄佈局：左側為記帳輸入 + AI 回饋（60%）、右側為預算 + 交易列表（40%）；底部 Tab Bar 切換為左側 Sidebar |
| `xl` | 同 `lg`、容器最大寬度 1200px 居中、增加 padding |

### 7.3 安全區域

- iOS 需適配 safe-area-inset-bottom（底部輸入區與 Tab Bar）
- 頁面頂部需適配 safe-area-inset-top（含 notch/Dynamic Island）
- CSS：`padding-bottom: env(safe-area-inset-bottom)`

### 7.4 觸控優化

| 項目 | 規格 |
|------|------|
| 最小點擊區域 | 44×44px（Apple HIG 標準） |
| 按鈕間距 | ≥ 8px、避免誤觸 |
| 左滑手勢 | 觸發閾值 40px、滑動速度感應 |
| 長按 | 暫不使用長按操作，避免與系統手勢衝突 |

---

## 8. 無障礙設計 (Accessibility)

| 項目 | 規範 |
|------|------|
| 色彩對比度 | 文字與背景對比度 ≥ 4.5:1（WCAG AA） |
| 語意化標籤 | 使用 `<header>`, `<nav>`, `<main>`, `<section>`, `<button>` 等語意標籤 |
| ARIA 標籤 | 按鈕附加 `aria-label`（如：麥克風按鈕 → `aria-label="語音輸入"`） |
| 焦點指示 | 鍵盤 Tab 瀏覽時顯示焦點環（outline 2px `--color-primary`） |
| 動畫偏好 | 尊重 `prefers-reduced-motion`，關閉脈衝與呼吸燈動畫 |
| 螢幕閱讀器 | 預算百分比與金額使用 `aria-live="polite"` 即時播報更新 |

---

**文檔版本**: v1.2
**最後修訂**: 2026-04-10

---

## 版本修訂說明

| 版本 | 日期 | 修訂內容 |
|------|------|---------|
| v1.0 | 2026-03-17 | 初版定稿（M1-M4 UI/UX 設計規格、Design Tokens、頁面佈局、互動動畫、響應式設計、無障礙設計） |
| v1.1 | 2026-04-09 | 規格文件改名對齊新版 vibe-sdlc-spec：本檔由 `01-4-UI_UX_Design.md` 改名為 `01-6-UI_UX_Design.md`、關聯文件表更新 API Spec 連結為 `01-5-API_Spec.md`、標題同步更新；首次建立完整版本修訂說明區塊 |
| v1.2 | 2026-04-10 | 對齊 vibe-sdlc-spec UI/UX Writing Guidelines §9：為 §3.1–§3.6 全部頁面章節補上 `ui/*.html` wireframe 視覺參考與元件層級 anchor link；新增 `/docs/ui/` 目錄含 6 個低保真 HTML + Tailwind wireframe（home/stats/history/settings/login/register）。markdown 規格書仍為實作權威，HTML wireframe 為視覺輔助（issue #209） |
| v1.3 | 2026-04-11 | 完整對齊 UI/UX Writing Guidelines §9.6 元件層級 anchor 規範：(1) §3.1.1–3.1.6 首頁各子元件章節補上獨立 `ui/home.html#xxx` 視覺參考；(2) §4 互動狀態與動畫（§4.1–4.6）各子章節補上視覺參考，指向對應承載元件的 wireframe anchor；(3) §5 PRD-F-012 新類別對話流（§5.1–5.5）補上視覺參考，對話流渲染於 `ui/home.html#ai-feedback`；(4) §6 PRD-F-013 AI 引擎選擇 UI（§6.1–6.4）補上視覺參考，全部指向 `ui/settings.html#ai-engine`；(5) 修正文件開頭版本號與日期同步（前次 v1.2 升版時 header 未同步更新） |
| v1.4 | 2026-04-11 | **§3.4 設定頁與 §6 AI 引擎選擇 UI 對齊 M6/M7 實作**（issue #216）：(1) §3.4 全章重寫為九個子元件（§3.4.1 Header ~ §3.4.9 登出），新增**語言設定**（§3.4.3 PRD-F-015）、**AI 指示 User Prompt**（§3.4.5）兩個章節；(2) §3.4.8「類別預算管理」更正為「類別管理」（純增刪，無金額欄位）；(3) 移除已廢棄的「其他設定 / 幣別」章節；(4) §6 標題由 "PRD-F-013 AI 引擎選擇 UI" 改為 "PRD-F-013 + PRD-F-017 AI 引擎選擇 UI"；(5) §6.2 供應商由 2 個（Gemini/OpenAI）擴展為 4 個（OpenAI/Gemini/Anthropic/xAI），預設引擎改為 OpenAI；(6) §6.3 API Key 輸入新增**獨立測試按鈕**與 `hasDefaultKey` 預設 Key 後備機制；(7) 新增 §6.4 **模型選擇下拉**（PRD-F-017，含動態模型清單、選擇策略、驗證觸發）；(8) §3.4 / §6 內所有子章節依 Writing Guidelines §9.6 補上獨立 `ui/settings.html#xxx` 視覺參考；(9) 同步更新 TOC 與 `ui/settings.html` wireframe（新增 `#language`、`#ai-instructions`、`#model-select`，`#category-budget` 重新命名為 `#category-management`，移除 `#other-settings`） |
