# 01-3 API 規範文件

> **專案名稱**：Vibe Money Book — 語音記帳應用
> **API 版本**：v1.0
> **文檔版本**：v1.5
> **最後更新**：2026-03-27

---

## 目錄

1. [API 總覽](#1-api-總覽)
2. [認證與授權](#2-認證與授權)
3. [通用規範](#3-通用規範)
4. [API 端點清單](#4-api-端點清單)
5. [詳細端點規範](#5-詳細端點規範)
6. [錯誤處理](#6-錯誤處理)

---

## 1. API 總覽

### 1.1 基礎資訊

| 項目 | 說明 |
|------|------|
| **API 基礎 URL** | `http://localhost:3000/api/v1` (開發) |
| **API 版本** | v1.0 |
| **協議** | HTTPS（生產環境） |
| **資料格式** | JSON |
| **字元編碼** | UTF-8 |

### 1.2 請求格式

```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>  # 需認證端點
Accept-Language: zh-TW             # 語言偏好（PRD-F-015，可選，預設 zh-TW）
```

> **Accept-Language**（PRD-F-015）：前端在所有 API 請求中附加此 Header，後端依此回傳對應語言的錯誤訊息與系統文字。支援值：`zh-TW`（預設）、`en`、`zh-CN`、`vi`。

### 1.3 響應格式

**成功響應**：
```json
{
  "code": 200,
  "message": "success",
  "data": { },
  "timestamp": "2026-03-16T12:00:00Z"
}
```

**錯誤響應**：
```json
{
  "code": 400,
  "message": "驗證失敗",
  "errors": [{ "field": "amount", "reason": "金額必須為正數" }],
  "timestamp": "2026-03-16T12:00:00Z"
}
```

---

## 2. 認證與授權

### 2.1 JWT Token

- **算法**：HS256
- **有效期**：7 天
- **傳遞方式**：`Authorization: Bearer <token>`

### 2.2 登出策略

登出操作由前端處理（清除 localStorage 中的 JWT Token 與 LLM API Key），無需後端端點。

### 2.3 Token Payload

```json
{
  "sub": "user_uuid",
  "email": "user@example.com",
  "iat": 1678416000,
  "exp": 1679020800
}
```

---

## 3. 通用規範

### 3.1 HTTP 狀態碼

| 狀態碼 | 含義 | 使用場景 |
|--------|------|--------|
| 200 | OK | 請求成功 |
| 201 | Created | 資源建立成功 |
| 204 | No Content | 刪除成功 |
| 400 | Bad Request | 參數驗證失敗 |
| 401 | Unauthorized | 未認證或 Token 過期 |
| 404 | Not Found | 資源不存在 |
| 429 | Too Many Requests | 超出速率限制（含 `X-RateLimit-Limit`、`X-RateLimit-Remaining`、`X-RateLimit-Reset`、`Retry-After` Response Headers） |
| 500 | Internal Server Error | 伺服器內部錯誤 |

### 3.2 時間格式

所有時間戳使用 ISO 8601：`2026-03-16T12:00:00Z`

日期欄位使用：`2026-03-16`

### 3.3 分頁參數

```
?page=1&limit=20
```

---

## 4. API 端點清單

### 4.1 認證模組

| 方法 | 端點 | 描述 | 認證 |
|------|------|------|------|
| POST | /auth/register | 使用者註冊 | ✗ |
| POST | /auth/login | 使用者登入 | ✗ |

### 4.2 使用者模組

| 方法 | 端點 | 描述 | 認證 |
|------|------|------|------|
| GET | /users/profile | 取得個人資料 | ✓ |
| PUT | /users/profile | 更新個人資料（人設、預算、AI 引擎偏好、AI 模型、語言） | ✓ |

### 4.3 AI 記帳模組

| 方法 | 端點 | 描述 | 認證 |
|------|------|------|------|
| POST | /ai/validate-key | 驗證使用者提供的 LLM API Key 是否有效（PRD-F-013, PRD-F-017） | ✓ |
| POST | /ai/parse | 解析自然語言輸入（資料萃取 + 人設回饋） | ✓ |
| POST | /ai/query | 自然語言篩選查詢交易記錄（PRD-F-014） | ✓ |
| GET | /ai/config | 查詢 AI 配置（預設 API Key 可用狀態，PRD-F-017 擴展） | ✓ |
| GET | /ai/providers | 取得支援的 AI 供應商與可用模型列表（PRD-F-017） | ✓ |
| GET | /ai/models | 取得指定供應商的可用模型列表（PRD-F-017） | ✓ |

### 4.4 交易模組

| 方法 | 端點 | 描述 | 認證 |
|------|------|------|------|
| POST | /transactions | 建立交易記錄 | ✓ |
| GET | /transactions | 查詢交易列表（支援分頁/篩選） | ✓ |
| GET | /transactions/:id | 取得單筆交易詳情（含 AI 回饋） | ✓ |
| DELETE | /transactions/:id | 刪除交易記錄 | ✓ |

### 4.5 預算模組

| 方法 | 端點 | 描述 | 認證 |
|------|------|------|------|
| GET | /budget/summary | 取得本月預算摘要 | ✓ |
| GET | /budget/categories | 取得類別預算列表 | ✓ |
| POST | /budget/categories | 新增自訂類別（PRD-F-012） | ✓ |
| PUT | /budget/categories | 批量更新類別預算 | ✓ |
| DELETE | /budget/categories/:category | 刪除自訂類別（PRD-F-012） | ✓ |

### 4.6 統計模組

| 方法 | 端點 | 描述 | 認證 |
|------|------|------|------|
| GET | /stats/distribution | 取得消費類別分佈 | ✓ |

---

## 5. 詳細端點規範

### 5.1 認證模組

#### POST /auth/register — 使用者註冊

**請求**：
```json
{
  "name": "小明",
  "email": "ming@example.com",
  "password": "MyP@ssw0rd"
}
```

**驗證**：
- `name`：必填，2-50 字元
- `email`：必填，有效 email 格式
- `password`：必填，8-100 字元

**成功響應 (201)**：
```json
{
  "code": 201,
  "message": "註冊成功",
  "data": {
    "user": {
      "id": "uuid-xxx",
      "name": "小明",
      "email": "ming@example.com",
      "persona": "gentle",
      "ai_engine": "gemini",
      "ai_model": null,
      "language": "zh-TW",
      "monthly_budget": 30000.00,
      "currency": "TWD"
    },
    "token": "eyJhbGci..."
  },
  "timestamp": "2026-03-16T12:00:00Z"
}
```

**錯誤**：
- 400：參數驗證失敗
- 409：Email 已被註冊

#### POST /auth/login — 使用者登入

**請求**：
```json
{
  "email": "ming@example.com",
  "password": "MyP@ssw0rd"
}
```

**成功響應 (200)**：
```json
{
  "code": 200,
  "message": "登入成功",
  "data": {
    "user": {
      "id": "uuid-xxx",
      "name": "小明",
      "email": "ming@example.com",
      "persona": "sarcastic",
      "ai_engine": "gemini",
      "ai_model": null,
      "language": "zh-TW",
      "monthly_budget": 30000.00,
      "currency": "TWD"
    },
    "token": "eyJhbGci..."
  },
  "timestamp": "2026-03-16T12:00:00Z"
}
```

**錯誤**：
- 401：帳號或密碼錯誤

---

### 5.2 使用者模組

#### GET /users/profile — 取得個人資料

**成功響應 (200)**：
```json
{
  "code": 200,
  "data": {
    "id": "uuid-xxx",
    "name": "小明",
    "email": "ming@example.com",
    "persona": "sarcastic",
    "ai_engine": "gemini",
    "ai_model": null,
    "language": "zh-TW",
    "monthly_budget": 30000.00,
    "currency": "TWD",
    "created_at": "2026-03-01T00:00:00Z"
  }
}
```

#### PUT /users/profile — 更新個人資料

**請求**：
```json
{
  "name": "小明",
  "persona": "sarcastic",
  "ai_engine": "openai",
  "ai_model": "gpt-4o-mini",
  "language": "en",
  "monthly_budget": 35000.00
}
```

**驗證**：
- `persona`：可選，必須為 `sarcastic` / `gentle` / `guilt_trip`
- `ai_engine`：可選，必須為 `gemini` / `openai` / `anthropic` / `xai`（PRD-F-013, PRD-F-017）
- `ai_model`：可選，字串，所選供應商的模型名稱（PRD-F-017）
- `language`：可選，必須為 `zh-TW` / `en` / `zh-CN` / `vi`（PRD-F-015）
- `monthly_budget`：可選，> 0，≤ 10000000

**成功響應 (200)**：回傳更新後的完整 profile。

---

### 5.3 AI 記帳模組

#### POST /ai/validate-key — 驗證 LLM API Key（PRD-F-013, PRD-F-017）

**描述**：驗證使用者提供的 LLM API Key 是否有效。後端根據請求中指定的供應商（或使用者的 `ai_engine` 偏好），使用對應引擎發送最小化測試請求，確認 Key 可用。

**Request Header**：
```
X-LLM-API-Key: <使用者自行提供的 LLM API Key>
```

**請求**（PRD-F-017 擴展）：
```json
{
  "engine": "anthropic",
  "model": "claude-haiku-4-5-20251001"
}
```

**驗證**：
- `engine`：可選，`gemini` / `openai` / `anthropic` / `xai`。未指定時使用使用者的 `ai_engine` 偏好
- `model`：可選，指定測試的模型。未指定時使用該供應商的預設模型

**成功響應 (200)**：
```json
{
  "code": 200,
  "data": {
    "valid": true,
    "engine": "anthropic",
    "model": "claude-haiku-4-5-20251001"
  },
  "timestamp": "2026-03-25T12:00:00Z"
}
```

**錯誤**：
- 400：模型無效或不存在（錯誤碼 `LLM_MODEL_INVALID`）
- 401：`X-LLM-API-Key` Header 缺失或為空
- 403：API Key 無效或 quota 耗盡，回傳具體錯誤原因（如「金鑰格式錯誤」、「配額已用盡」）
- 429：超過速率限制

---

#### POST /ai/parse — 解析自然語言輸入

**描述**：接收使用者的自然語言文字，呼叫 LLM 進行資料萃取與人設回饋生成，回傳結構化結果。**不會自動建立交易記錄**，需使用者在前端確認後再呼叫 `POST /transactions`。後端根據使用者的 `ai_engine` 偏好選擇對應的 LLM 引擎（PRD-F-013）。

**Request Header**（PRD-F-013）：
```
X-LLM-API-Key: <使用者自行提供的 LLM API Key>
```
- 此 Key 由前端從 localStorage 讀取後附加至 Header
- 後端用後即棄，不持久化儲存

**請求**：
```json
{
  "raw_text": "午餐吃拉麵 180 元"
}
```

**驗證**：
- `raw_text`：必填，1-500 字元
- `X-LLM-API-Key` Header：必填，不可為空

**成功響應 (200)**：
```json
{
  "code": 200,
  "data": {
    "parsed": {
      "amount": 180,
      "category": "food",
      "merchant": "拉麵店",
      "date": "2026-03-16",
      "confidence": 0.95,
      "is_new_category": false,
      "suggested_category": null
    },
    "feedback": {
      "text": "又是拉麵？你的胃和錢包一起在哭。",
      "emotion_tag": "sarcastic_warning"
    },
    "budget_context": {
      "monthly_budget": 30000.00,
      "spent_this_month": 18500.00,
      "remaining": 11500.00,
      "used_ratio": 0.617,
      "category_spent": 8200.00,
      "category_limit": 10000.00
    }
  },
  "timestamp": "2026-03-16T12:00:00Z"
}
```

**新類別偵測情境（PRD-F-012）**：

當 LLM 判斷消費無法歸入使用者現有類別時，回應如下：
```json
{
  "code": 200,
  "data": {
    "parsed": {
      "amount": 350,
      "category": null,
      "merchant": "寵物用品店",
      "date": "2026-03-17",
      "confidence": 0.90,
      "is_new_category": true,
      "suggested_category": "寵物"
    },
    "feedback": {
      "text": "我覺得這筆消費屬於「寵物」，但你的類別中沒有這項，要新增嗎？",
      "emotion_tag": "inquiry"
    },
    "budget_context": { "..." : "..." }
  }
}
```

前端收到 `is_new_category: true` 時，應顯示新類別確認對話框，提供三個選項：
1. **確認新增**：呼叫 `POST /budget/categories` 建立新類別，再呼叫 `POST /transactions` 記帳
2. **修改名稱**：使用者修改類別名稱後，同上流程
3. **選擇現有類別**：使用者從現有類別中選擇，直接進入記帳確認流程

**錯誤**：
- 400：輸入文字為空或過長
- 401：`X-LLM-API-Key` Header 缺失或為空（PRD-F-013）
- 403：API Key 無效或 quota 耗盡，回傳友善提示訊息（PRD-F-013）
- 429：超過 LLM 速率限制
- 502：LLM 服務暫時不可用

#### POST /ai/query — 自然語言篩選查詢交易記錄（PRD-F-014）

**描述**：接收使用者的自然語言查詢文字，透過兩階段 AI 處理流程，回傳匹配的交易記錄 ID 與 AI 總結評語。後端根據使用者的 `ai_engine` 偏好選擇對應的 LLM 引擎。

**處理流程**：
1. **時間範圍解析**：AI 解析查詢文字中的時間範圍（如「最近一個月」、「上週」），若無法解析則預設為當月
2. **交易記錄查詢**：依解析出的時間範圍查詢該使用者的完整交易記錄（含 note 備註欄）
3. **AI 分析與匹配**：將交易記錄集附加至使用者原始查詢，送 AI 分析、篩選出匹配的交易並生成總結評語
4. **回傳結果**：匹配的交易 ID 列表 + AI 總結評語（依當前人設風格生成）

**Request Header**（PRD-F-013）：
```
X-LLM-API-Key: <使用者自行提供的 LLM API Key>
```

**請求**：
```json
{
  "query_text": "阿貓阿狗這家店我花了多少錢"
}
```

**驗證**：
- `query_text`：必填，1-500 字元
- `X-LLM-API-Key` Header：必填，不可為空

**成功響應 (200)**：
```json
{
  "code": 200,
  "data": {
    "summary": {
      "text": "你這個月大手大腳地在毛孩子身上花了 2800 元，是愛心氾濫了，還是你被毛孩子威脅了？",
      "emotion_tag": "sarcastic_warning",
      "total_amount": 2800,
      "match_count": 3
    },
    "matched_transaction_ids": [
      "uuid-txn-001",
      "uuid-txn-002",
      "uuid-txn-003"
    ],
    "time_range": {
      "start_date": "2026-03-01",
      "end_date": "2026-03-31"
    }
  },
  "timestamp": "2026-03-21T12:00:00Z"
}
```

**回應欄位說明**：
- `summary.text`：AI 依當前人設風格生成的總結評語
- `summary.emotion_tag`：情緒標籤
- `summary.total_amount`：匹配交易的金額總和
- `summary.match_count`：匹配交易筆數
- `matched_transaction_ids`：匹配的交易 ID 列表，前端據此篩選顯示
- `time_range`：AI 解析出的時間範圍，供前端參考

**錯誤**：
- 400：查詢文字為空或過長
- 401：`X-LLM-API-Key` Header 缺失或為空（PRD-F-013）
- 403：API Key 無效或 quota 耗盡（PRD-F-013）
- 429：超過 LLM 速率限制
- 502：LLM 服務暫時不可用

#### GET /ai/config — 查詢 AI 配置（PRD-F-017 擴展）

查詢伺服器是否配置了預設 API Key（不回傳 Key 本身，僅回傳可用狀態）。

**成功響應 (200)**：
```json
{
  "code": 200,
  "data": {
    "hasDefaultKey": {
      "gemini": true,
      "openai": false,
      "anthropic": false,
      "xai": false
    }
  }
}
```

#### GET /ai/providers — 取得 AI 供應商與模型列表（PRD-F-017）

**描述**：回傳系統支援的所有 AI 供應商及其可用模型列表，供前端設定頁面使用。

**成功響應 (200)**：
```json
{
  "code": 200,
  "data": {
    "providers": [
      {
        "code": "gemini",
        "name": "Google Gemini",
        "models": [
          { "id": "gemini-2.5-flash", "name": "Gemini 2.5 Flash", "description": "快速且經濟實惠", "isDefault": true },
          { "id": "gemini-2.5-pro", "name": "Gemini 2.5 Pro", "description": "高品質推理能力", "isDefault": false },
          { "id": "gemini-2.0-flash", "name": "Gemini 2.0 Flash", "description": "上一代快速模型", "isDefault": false }
        ]
      },
      {
        "code": "openai",
        "name": "OpenAI",
        "models": [
          { "id": "gpt-4o-mini", "name": "GPT-4o Mini", "description": "高性價比，結構化輸出穩定", "isDefault": true },
          { "id": "gpt-4o", "name": "GPT-4o", "description": "旗艦多模態模型", "isDefault": false },
          { "id": "gpt-4.1-mini", "name": "GPT-4.1 Mini", "description": "新一代經濟模型", "isDefault": false }
        ]
      },
      {
        "code": "anthropic",
        "name": "Anthropic",
        "models": [
          { "id": "claude-haiku-4-5-20251001", "name": "Claude Haiku 4.5", "description": "快速且經濟實惠", "isDefault": true },
          { "id": "claude-sonnet-4-5-20250514", "name": "Claude Sonnet 4.5", "description": "平衡速度與品質", "isDefault": false }
        ]
      },
      {
        "code": "xai",
        "name": "xAI (Grok)",
        "models": [
          { "id": "grok-3-mini-fast", "name": "Grok 3 Mini Fast", "description": "最快速度", "isDefault": true },
          { "id": "grok-3-mini", "name": "Grok 3 Mini", "description": "小型模型", "isDefault": false },
          { "id": "grok-3", "name": "Grok 3", "description": "旗艦模型", "isDefault": false }
        ]
      }
    ]
  },
  "timestamp": "2026-03-25T12:00:00Z"
}
```

#### GET /ai/models — 取得指定供應商的可用模型列表（PRD-F-017）

**描述**：依指定供應商回傳可用模型列表。若提供有效 API Key（透過 Header 或伺服器預設），則呼叫供應商的 List Models API 取得動態列表；否則回傳硬編碼的預設模型清單。

**Request Header**：
```
Authorization: Bearer <JWT_TOKEN>          # 必填
X-LLM-API-Key: <使用者自行提供的 LLM API Key>  # 可選
```

**查詢參數**：
- `engine`：必填，`gemini` / `openai` / `anthropic` / `xai`

**成功響應 (200)**：
```json
{
  "code": 200,
  "data": {
    "models": [
      { "id": "gemini-2.5-flash", "name": "Gemini 2.5 Flash", "description": "快速且經濟實惠", "isDefault": true },
      { "id": "gemini-2.5-pro", "name": "Gemini 2.5 Pro", "description": "高品質推理能力", "isDefault": false },
      { "id": "gemini-2.0-flash", "name": "Gemini 2.0 Flash", "description": "上一代快速模型", "isDefault": false }
    ],
    "dynamic": true
  },
  "timestamp": "2026-03-27T12:00:00Z"
}
```

**回應欄位說明**：
- `models`：模型資訊列表（`ModelInfo[]`）
  - `id`：模型識別碼
  - `name`：模型顯示名稱
  - `description`：模型描述
  - `isDefault`：是否為該供應商的預設模型
- `dynamic`：`true` 表示透過供應商 API 動態取得，`false` 表示使用硬編碼預設清單

**錯誤**：
- 400：`engine` 參數缺失或不合法
- 401：未認證或 Token 過期

---

### 5.4 交易模組

#### POST /transactions — 建立交易記錄

**描述**：使用者確認 AI 解析結果後，提交建立交易記錄。同時儲存 AI 回饋。

> **設計說明（PRD-F-004）**：「修改」操作在前端本地完成——使用者在確認卡片上直接編輯金額、類別、商家等欄位，修改後的資料透過此端點提交，無需額外的修改 API。

**請求**：
```json
{
  "amount": 180,
  "category": "food",
  "merchant": "拉麵店",
  "raw_text": "午餐吃拉麵 180 元",
  "transaction_date": "2026-03-16",
  "note": "",
  "feedback": {
    "text": "又是拉麵？你的胃和錢包一起在哭。",
    "emotion_tag": "sarcastic_warning",
    "persona_used": "sarcastic"
  }
}
```

**驗證**：
- `amount`：必填，> 0
- `category`：必填，須為合法類別
- `raw_text`：必填
- `transaction_date`：必填，有效日期
- `feedback`：可選
- `feedback.persona_used`：前端從使用者 profile 中的 `persona` 欄位取得，代表生成此回饋時使用的人設

**成功響應 (201)**：
```json
{
  "code": 201,
  "message": "記帳成功",
  "data": {
    "transaction": {
      "id": "uuid-txn-001",
      "amount": 180,
      "category": "food",
      "merchant": "拉麵店",
      "raw_text": "午餐吃拉麵 180 元",
      "transaction_date": "2026-03-16",
      "note": "",
      "created_at": "2026-03-16T12:00:00Z"
    },
    "feedback": {
      "id": "uuid-fb-001",
      "feedback_text": "又是拉麵？你的胃和錢包一起在哭。",
      "emotion_tag": "sarcastic_warning",
      "persona_used": "sarcastic"
    }
  },
  "timestamp": "2026-03-16T12:00:00Z"
}
```

#### GET /transactions — 查詢交易列表

**查詢參數**：
- `page`：頁碼（預設 1）
- `limit`：每頁筆數（預設 20，最大 100）
- `category`：按類別篩選（可選）
- `start_date`：起始日期（可選，YYYY-MM-DD）
- `end_date`：結束日期（可選，YYYY-MM-DD）
- `sort`：排序方向（asc/desc，預設 desc）

**成功響應 (200)**：
```json
{
  "code": 200,
  "data": {
    "items": [
      {
        "id": "uuid-txn-001",
        "amount": 180,
        "category": "food",
        "merchant": "拉麵店",
        "transaction_date": "2026-03-16",
        "created_at": "2026-03-16T12:00:00Z"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "pages": 3
    }
  }
}
```

#### GET /transactions/:id — 取得單筆交易詳情

**成功響應 (200)**：
```json
{
  "code": 200,
  "data": {
    "id": "uuid-txn-001",
    "amount": 180,
    "category": "food",
    "merchant": "拉麵店",
    "raw_text": "午餐吃拉麵 180 元",
    "note": "",
    "transaction_date": "2026-03-16",
    "created_at": "2026-03-16T12:00:00Z",
    "feedback": {
      "feedback_text": "又是拉麵？你的胃和錢包一起在哭。",
      "emotion_tag": "sarcastic_warning",
      "persona_used": "sarcastic"
    }
  }
}
```

#### DELETE /transactions/:id — 刪除交易

**成功響應 (204)**：無內容。

**錯誤**：
- 404：交易不存在

---

### 5.5 預算模組

#### GET /budget/summary — 本月預算摘要

**查詢參數**：
- `month`：月份（可選，YYYY-MM，預設當月）

**成功響應 (200)**：
```json
{
  "code": 200,
  "data": {
    "month": "2026-03",
    "monthly_budget": 30000.00,
    "total_spent": 18500.00,
    "remaining": 11500.00,
    "used_ratio": 0.617,
    "transaction_count": 42,
    "category_summary": [
      {
        "category": "food",
        "spent": 8200.00,
        "budget_limit": 10000.00,
        "used_ratio": 0.82
      },
      {
        "category": "transport",
        "spent": 2100.00,
        "budget_limit": 3000.00,
        "used_ratio": 0.70
      }
    ]
  }
}
```

#### GET /budget/categories — 取得類別預算列表

**成功響應 (200)**：
```json
{
  "code": 200,
  "data": {
    "categories": [
      { "category": "food", "budget_limit": 8000.00, "is_custom": false },
      { "category": "transport", "budget_limit": 3000.00, "is_custom": false },
      { "category": "entertainment", "budget_limit": 3000.00, "is_custom": false },
      { "category": "shopping", "budget_limit": 3000.00, "is_custom": false },
      { "category": "daily", "budget_limit": 2000.00, "is_custom": false },
      { "category": "medical", "budget_limit": 2000.00, "is_custom": false },
      { "category": "education", "budget_limit": 2000.00, "is_custom": false },
      { "category": "other", "budget_limit": 0, "is_custom": false }
    ]
  }
}
```

#### POST /budget/categories — 新增自訂類別（PRD-F-012）

**描述**：使用者確認新增 AI 建議的類別時呼叫此端點。新增類別後可選擇設定預算限額。

**請求**：
```json
{
  "category": "寵物",
  "budget_limit": 3000.00
}
```

**驗證**：
- `category`：必填，2-50 字元，不可與該使用者現有類別重複（大小寫不敏感）
- `budget_limit`：可選，≥ 0，預設 0
- 使用者類別總數不可超過 20

**成功響應 (201)**：
```json
{
  "code": 201,
  "message": "類別新增成功",
  "data": {
    "category": "寵物",
    "budget_limit": 3000.00,
    "is_custom": true
  },
  "timestamp": "2026-03-17T12:00:00Z"
}
```

**錯誤**：
- 400：類別名稱為空或過長
- 409：類別已存在
- 422：類別數量已達上限（50）

#### DELETE /budget/categories/:category — 刪除自訂類別（PRD-F-012）

**描述**：刪除使用者自訂的類別。預設類別不可刪除。若該類別下有交易記錄，需將這些記錄重新歸類至「其他」。

**成功響應 (204)**：無內容。

**錯誤**：
- 400：不可刪除預設類別
- 404：類別不存在

#### PUT /budget/categories — 批量更新類別預算

**請求**：
```json
{
  "categories": [
    { "category": "food", "budget_limit": 12000.00 },
    { "category": "transport", "budget_limit": 4000.00 }
  ]
}
```

**成功響應 (200)**：回傳更新後的完整類別預算列表。

---

### 5.6 統計模組

#### GET /stats/distribution — 消費類別分佈

**查詢參數**：
- `period`：時段範圍（可選，`week` | `month` | `custom`，預設 `month`）
- `start_date`：起始日期（可選，YYYY-MM-DD，`period=custom` 時必填）
- `end_date`：結束日期（可選，YYYY-MM-DD，`period=custom` 時必填）
- `month`：月份（可選，YYYY-MM，預設當月，與 `period` 互斥，向後相容）
- `type`：交易類型篩選（可選，`income` | `expense`）

**成功響應 (200)**：
```json
{
  "code": 200,
  "data": {
    "month": "2026-03",
    "total_spent": 18500.00,
    "distribution": [
      { "category": "food", "amount": 8200.00, "ratio": 0.443, "count": 20 },
      { "category": "transport", "amount": 2100.00, "ratio": 0.114, "count": 15 },
      { "category": "entertainment", "amount": 3500.00, "ratio": 0.189, "count": 4 },
      { "category": "shopping", "amount": 2800.00, "ratio": 0.151, "count": 2 },
      { "category": "daily", "amount": 1900.00, "ratio": 0.103, "count": 1 }
    ]
  }
}
```

---

## 6. 錯誤處理

### 6.1 錯誤碼對照表

| 錯誤碼 | HTTP 狀態 | 描述 |
|--------|-----------|------|
| VALIDATION_ERROR | 400 | 參數驗證失敗 |
| UNAUTHORIZED | 401 | 未認證或 Token 過期 |
| NOT_FOUND | 404 | 資源不存在 |
| LLM_API_KEY_MISSING | 401 | LLM API Key 未提供（PRD-F-013） |
| LLM_API_KEY_INVALID | 403 | LLM API Key 無效或 quota 耗盡（PRD-F-013） |
| LLM_MODEL_INVALID | 400 | 指定的模型無效或不存在（PRD-F-017） |
| CONFLICT | 409 | 資源衝突（如 email 重複） |
| RATE_LIMIT_EXCEEDED | 429 | 超出速率限制 |
| LLM_SERVICE_ERROR | 502 | LLM 服務呼叫失敗 |
| INTERNAL_ERROR | 500 | 伺服器內部錯誤 |

---

**文檔責任人**：技術架構團隊
**最後修訂日期**：2026-03-27

---

## 版本修訂說明

| 版本 | 日期 | 修訂內容 |
|------|------|---------|
| v1.0 | 2026-03-16 | 初版定稿 |
| v1.1 | 2026-03-21 | 配合 PRD-F-014（語義篩選查詢）新增：§4.3 AI 記帳模組新增 `POST /ai/query` 端點清單；§5.3 新增 `POST /ai/query` 詳細端點規範（含請求/響應格式、兩階段處理流程說明、錯誤碼） |
| v1.2 | 2026-03-22 | §4.3 新增 `GET /ai/config` 端點（預設 API Key 狀態查詢）；§5.6 `/stats/distribution` 新增 `period`、`start_date`、`end_date`、`type` 查詢參數，支援本週與自訂日期範圍 |
| v1.3 | 2026-03-22 | 配合 PRD-F-015（i18n 多語系支援）：§1.2 請求格式新增 `Accept-Language` Header 說明；使用者模組（register/login/profile）回應新增 `language` 欄位；`PUT /users/profile` 新增 `language` 可選參數 |
| v1.4 | 2026-03-25 | M7 新增功能：§4.3 新增 `GET /ai/providers` 端點（供應商與模型列表）；`POST /ai/validate-key` 擴展支援 engine/model body 參數；`GET /ai/config` 擴展回傳 anthropic/xai 預設 Key 狀態；`PUT /users/profile` 新增 `ai_model` 可選參數、`ai_engine` 擴展為四供應商 |
| v1.5 | 2026-03-27 | Add `GET /ai/models` endpoint; `validate-key` distinguishes key vs model errors (400/403); add `LLM_MODEL_INVALID` error code |
