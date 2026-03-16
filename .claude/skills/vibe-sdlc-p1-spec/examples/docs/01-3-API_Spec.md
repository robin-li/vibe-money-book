# 01-3 API 規範文件

> **項目名稱**：Easy Dine — 小型餐廳點餐系統
> **API 版本**：v1.0
> **文檔版本**：v1.0
> **最後更新**：2026-03-12

---

## 目錄

1. [API 總覽](#1-api-總覽)
2. [認證與授權](#2-認證與授權)
3. [通用規範](#3-通用規範)
4. [API 端點清單](#4-api-端點清單)
5. [詳細端點規範](#5-詳細端點規範)
6. [錯誤處理](#6-錯誤處理)
7. [分頁與篩選](#7-分頁與篩選)

---

## 1. API 總覽

### 1.1 基礎信息

| 項目 | 說明 |
|------|------|
| **API 基礎 URL** | `https://api.easydine.example.com/api/v1` |
| **API 版本** | v1.0 |
| **協議** | HTTPS（TLS 1.2+） |
| **數據格式** | JSON |
| **字符編碼** | UTF-8 |
| **超時時間** | 30 秒 |

### 1.2 請求格式

**請求頭 (HTTP Headers)**：
```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>  # 認證端點除外
User-Agent: <Client-Identifier>
X-Request-ID: <Optional-Request-ID>
```

**請求 URL 結構**：
```
https://api.easydine.example.com/api/v1/{resource}/{id}/{subresource}?param1=value1&param2=value2
```

### 1.3 響應格式

**成功響應（HTTP 200 / 201）**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    // 業務數據
  },
  "timestamp": "2026-03-12T12:00:00Z"
}
```

**錯誤響應（HTTP 4xx / 5xx）**：
```json
{
  "code": 400,
  "message": "參數驗證失敗",
  "errors": [
    {
      "field": "price",
      "reason": "價格必須為正數"
    }
  ],
  "timestamp": "2026-03-12T12:00:00Z"
}
```

---

## 2. 認證與授權

### 2.1 JWT Token 格式

**Token 結構**：
```
Header.Payload.Signature
```

**Header**：
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload**：
```json
{
  "sub": "admin_id",
  "username": "admin",
  "restaurant_id": 1,
  "role": "owner",
  "exp": 1678502400,
  "iat": 1678416000,
  "jti": "unique-token-id"
}
```

**簽名**：使用 HMAC-SHA256 算法簽名

**有效期**：12 小時（43200 秒）

### 2.2 使用 Token 進行 API 請求

在 HTTP 請求頭中添加授權信息：

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2.3 角色與權限對應表

| 角色 | 名稱 | 權限清單 |
|------|------|--------|
| **admin** | 管理員 | 菜單管理、訂單管理、桌位管理、用戶管理、分析數據、系統設置 |
| **staff** | 店員 | 查看訂單、更新訂單狀態、查看桌位、打印出餐單 |
| **customer** | 顧客 | 瀏覽菜單、提交訂單、查看購物車（前端實現，無 API 認證） |

### 2.4 刷新 Token

**端點**：`POST /auth/refresh`

**請求**：
```json
{
  "refresh_token": "eyJhbGc..."
}
```

**響應**：
```json
{
  "code": 200,
  "message": "Token refreshed successfully",
  "data": {
    "access_token": "new_jwt_token",
    "refresh_token": "new_refresh_token",
    "expires_in": 43200
  }
}
```

---

## 3. 通用規範

### 3.1 HTTP 狀態碼

| 狀態碼 | 含義 | 使用場景 |
|--------|------|--------|
| **200** | OK | 請求成功，返回數據 |
| **201** | Created | 資源創建成功 |
| **204** | No Content | 操作成功但無返回內容 |
| **400** | Bad Request | 請求參數錯誤或驗證失敗 |
| **401** | Unauthorized | 未認證或 Token 過期 |
| **403** | Forbidden | 已認證但無權限 |
| **404** | Not Found | 資源不存在 |
| **409** | Conflict | 資源衝突（如菜品名稱重複） |
| **429** | Too Many Requests | 超出速率限制 |
| **500** | Internal Server Error | 服務器內部錯誤 |
| **503** | Service Unavailable | 服務暫時不可用 |

### 3.2 時間格式

所有時間戳使用 ISO 8601 格式：

```
2026-03-12T12:00:00Z          # UTC 時區
2026-03-12T20:00:00+08:00     # 帶時區偏移量
```

### 3.3 數字格式

- **整數**：不帶小數點
- **小數**：Decimal 型別（如價格），精度保留 2 位
- **大數字**：避免使用浮點數，使用字符串表示

### 3.4 布爾值

- **true** / **false**（小寫）
- 不使用 0 / 1 或 yes / no

### 3.5 空值處理

- **Null** vs **Empty String** vs **Omitted Field**
  - `null`：明確表示無值
  - `""`：空字符串
  - 省略字段：不在響應中出現

---

## 4. API 端點清單

### 4.1 認證模塊

| 方法 | 端點 | 描述 | 認證 |
|------|------|------|------|
| POST | /auth/login | 管理員登入 | ✗ |
| POST | /auth/refresh | 刷新 Token | ✗ |
| POST | /auth/logout | 登出 | ✓ |

### 4.2 用戶模塊

| 方法 | 端點 | 描述 | 認證 | 權限 |
|------|------|------|------|------|
| GET | /users/profile | 獲取用戶信息 | ✓ | - |
| PUT | /users/profile | 更新用戶信息 | ✓ | - |
| POST | /users/change-password | 修改密碼 | ✓ | - |

### 4.3 餐廳模塊

| 方法 | 端點 | 描述 | 認證 | 權限 |
|------|------|------|------|------|
| GET | /restaurants/{id} | 獲取餐廳詳情 | ✗ | - |
| GET | /restaurants/{id}/tables | 獲取餐廳的所有餐桌 | ✗ | - |
| GET | /admin/restaurants | 獲取我管理的餐廳 | ✓ | Admin |
| PUT | /admin/restaurants/{id} | 編輯餐廳信息 | ✓ | Admin |

### 4.4 菜單模塊

| 方法 | 端點 | 描述 | 認證 | 權限 |
|------|------|------|------|------|
| GET | /restaurants/{id}/categories | 獲取分類列表 | ✗ | - |
| GET | /restaurants/{id}/menu | 獲取菜單（分類和菜品） | ✗ | - |
| GET | /restaurants/{id}/menu-items/{itemId} | 獲取單個菜品詳情 | ✗ | - |
| POST | /restaurants/{id}/menu-items | 新增菜品 | ✓ | Admin |
| PUT | /restaurants/{id}/menu-items/{itemId} | 編輯菜品 | ✓ | Admin |
| DELETE | /restaurants/{id}/menu-items/{itemId} | 刪除菜品 | ✓ | Admin |

### 4.5 購物車模塊

| 方法 | 端點 | 描述 | 認證 | 備註 |
|------|------|------|------|------|
| GET | /carts | 獲取我的購物車 | ✗ | 前端存儲 |
| POST | /carts/items | 加入購物車 | ✗ | 前端存儲 |
| PUT | /carts/items/{cartItemId} | 更新購物車項目數量 | ✗ | 前端存儲 |
| DELETE | /carts/items/{cartItemId} | 移除購物車項目 | ✗ | 前端存儲 |
| DELETE | /carts | 清空購物車 | ✗ | 前端存儲 |

### 4.6 訂單模塊

| 方法 | 端點 | 描述 | 認證 | 權限 |
|------|------|------|------|------|
| POST | /orders | 提交訂單 | ✗ | - |
| GET | /orders/{orderId} | 獲取訂單詳情 | ✗ | - |
| GET | /restaurants/{id}/orders | 獲取餐廳訂單列表 | ✓ | Admin/Staff |
| PUT | /orders/{orderId}/status | 更新訂單狀態 | ✓ | Admin/Staff |
| DELETE | /orders/{orderId} | 取消訂單 | ✓ | Admin/Staff |

### 4.7 桌位管理模塊

| 方法 | 端點 | 描述 | 認證 | 權限 |
|------|------|------|------|------|
| GET | /admin/tables | 獲取餐廳桌位列表 | ✓ | Admin |
| POST | /admin/tables | 新增桌位 | ✓ | Admin |
| PUT | /admin/tables/{tableId} | 更新桌位信息 | ✓ | Admin |
| DELETE | /admin/tables/{tableId} | 刪除桌位 | ✓ | Admin |
| PUT | /admin/tables/{tableId}/status | 更新桌位狀態 | ✓ | Admin/Staff |
| GET | /admin/tables/{tableId}/qrcode | 獲取桌位 QR Code | ✓ | Admin |

### 4.8 分析與統計模塊

| 方法 | 端點 | 描述 | 認證 | 權限 |
|------|------|------|------|------|
| GET | /admin/analytics | 獲取分析數據 | ✓ | Admin |
| GET | /admin/analytics/orders | 訂單統計 | ✓ | Admin |
| GET | /admin/analytics/menu | 菜品銷售排行 | ✓ | Admin |
| GET | /admin/analytics/tables | 桌位使用率 | ✓ | Admin |

---

## 5. 詳細端點規範

### 5.1 認證模塊

#### POST /auth/login — 管理員登入

**描述**：驗證管理員帳號密碼，返回 JWT Token

**請求參數**：
```json
{
  "username": "admin",
  "password": "password123",
  "restaurant_id": 1  // 可選，如果系統支持多店面
}
```

**請求驗證**：
- `username`：必填，長度 3-50 字符
- `password`：必填，長度 6-100 字符

**成功響應（HTTP 200）**：
```json
{
  "code": 200,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 43200,
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "role": "owner",
      "restaurant_id": 1,
      "restaurant_name": "紅油餐廳"
    }
  },
  "timestamp": "2026-03-12T12:00:00Z"
}
```

**錯誤響應**：
- **401 Unauthorized**：用戶名或密碼錯誤
- **403 Forbidden**：帳號被禁用
- **429 Too Many Requests**：登入失敗超過 5 次

#### POST /auth/refresh — 刷新 Token

**描述**：使用 Refresh Token 獲取新的 Access Token

**請求參數**：
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**成功響應（HTTP 200）**：
```json
{
  "code": 200,
  "message": "Token refreshed successfully",
  "data": {
    "access_token": "new_jwt_token",
    "refresh_token": "new_refresh_token",
    "expires_in": 43200
  },
  "timestamp": "2026-03-12T12:00:00Z"
}
```

**錯誤響應**：
- **401 Unauthorized**：Refresh Token 無效或過期

#### POST /auth/logout — 登出

**描述**：登出用戶，使 Token 失效

**請求參數**：無

**成功響應（HTTP 200）**：
```json
{
  "code": 200,
  "message": "Logout successful",
  "data": null,
  "timestamp": "2026-03-12T12:00:00Z"
}
```

---

### 5.2 菜單模塊

#### GET /restaurants/{id}/menu — 獲取菜單

**描述**：獲取餐廳的完整菜單，包括分類和菜品

**請求參數**：
- 路徑參數：`restaurant_id` (必填)
- 查詢參數：
  - `include_categories`: boolean (可選，默認 true)
  - `include_recommended`: boolean (可選，默認 true)

**請求示例**：
```
GET /api/v1/restaurants/1/menu?include_categories=true&include_recommended=true
```

**成功響應（HTTP 200）**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "restaurant": {
      "id": 1,
      "name": "紅油餐廳"
    },
    "recommended_items": [
      {
        "id": 101,
        "name": "紅油抄手",
        "price": 25.00,
        "image_url": "https://cdn.example.com/1.jpg",
        "description": "麻辣爽口",
        "is_recommended": true,
        "status": "active",
        "category_id": 1,
        "category_name": "主食"
      }
    ],
    "categories": [
      {
        "id": 1,
        "name": "主食",
        "sort_order": 1,
        "icon_url": "https://cdn.example.com/icon-main.png",
        "items": [
          {
            "id": 101,
            "name": "紅油抄手",
            "price": 25.00,
            "image_url": "https://cdn.example.com/1.jpg",
            "description": "麻辣爽口",
            "is_recommended": true,
            "status": "active"
          }
        ]
      }
    ]
  },
  "timestamp": "2026-03-12T12:00:00Z"
}
```

**錯誤響應**：
- **404 Not Found**：餐廳不存在

---

### 5.3 訂單模塊

#### POST /orders — 提交訂單

**描述**：顧客提交訂單

**請求參數**：
```json
{
  "table_id": 5,
  "items": [
    {
      "menu_item_id": 101,
      "quantity": 2,
      "remark": "不要香菜"
    },
    {
      "menu_item_id": 102,
      "quantity": 1,
      "remark": ""
    }
  ],
  "customer_count": 4,  // 可選
  "remark": ""  // 可選，訂單備註
}
```

**請求驗證**：
- `table_id`：必填，必須存在
- `items`：必填，非空數組，最多 50 項
- `items[].menu_item_id`：必填，必須存在
- `items[].quantity`：必填，> 0，< 100
- `items[].remark`：可選，最多 200 字符

**成功響應（HTTP 201）**：
```json
{
  "code": 201,
  "message": "Order created successfully",
  "data": {
    "order": {
      "id": 1001,
      "order_no": "ORD-20260312-001",
      "table_id": 5,
      "table_number": "A1",
      "status": "pending",
      "total_amount": 75.00,
      "discount_amount": 0.00,
      "final_amount": 75.00,
      "customer_count": 4,
      "items": [
        {
          "id": 1,
          "menu_item_id": 101,
          "menu_item_name": "紅油抄手",
          "quantity": 2,
          "price": 25.00,
          "remark": "不要香菜",
          "subtotal": 50.00,
          "item_status": "pending"
        }
      ],
      "created_at": "2026-03-12T12:00:00Z",
      "updated_at": "2026-03-12T12:00:00Z"
    },
    "print_content": {
      "order_no": "ORD-20260312-001",
      "table_number": "A1",
      "items": [
        {
          "name": "紅油抄手",
          "quantity": 2,
          "remark": "不要香菜"
        }
      ],
      "total_amount": 75.00
    }
  },
  "timestamp": "2026-03-12T12:00:00Z"
}
```

**錯誤響應**：
- **400 Bad Request**：參數驗證失敗
- **404 Not Found**：桌位或菜品不存在
- **409 Conflict**：菜品已售完或下架

#### GET /orders/{orderId} — 獲取訂單詳情

**描述**：獲取訂單的詳細信息

**請求參數**：
- 路徑參數：`orderId` (必填)

**成功響應（HTTP 200）**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1001,
    "order_no": "ORD-20260312-001",
    "restaurant_id": 1,
    "table_id": 5,
    "table_number": "A1",
    "status": "pending",
    "total_amount": 75.00,
    "discount_amount": 0.00,
    "final_amount": 75.00,
    "customer_count": 4,
    "remark": "",
    "items": [
      {
        "id": 1,
        "menu_item_id": 101,
        "menu_item_name": "紅油抄手",
        "quantity": 2,
        "price": 25.00,
        "remark": "不要香菜",
        "subtotal": 50.00,
        "item_status": "pending"
      }
    ],
    "created_at": "2026-03-12T12:00:00Z",
    "updated_at": "2026-03-12T12:00:00Z"
  },
  "timestamp": "2026-03-12T12:00:00Z"
}
```

**錯誤響應**：
- **404 Not Found**：訂單不存在

#### GET /restaurants/{id}/orders — 獲取餐廳訂單列表

**描述**：獲取餐廳的訂單列表（需認證和權限）

**請求參數**：
- 路徑參數：`id` (餐廳 ID)
- 查詢參數：
  - `page`: number (默認 1)
  - `limit`: number (默認 10，最大 100)
  - `status`: string (可選，如 pending/confirmed/preparing/ready/completed/cancelled)
  - `table_id`: number (可選)
  - `start_date`: string (可選，YYYY-MM-DD)
  - `end_date`: string (可選，YYYY-MM-DD)
  - `order_by`: string (默認 created_at，可選 table_number/total_amount)
  - `sort`: string (asc/desc，默認 desc)

**請求示例**：
```
GET /api/v1/restaurants/1/orders?page=1&limit=20&status=pending&order_by=created_at&sort=desc
```

**成功響應（HTTP 200）**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1001,
        "order_no": "ORD-20260312-001",
        "table_id": 5,
        "table_number": "A1",
        "status": "pending",
        "total_amount": 75.00,
        "final_amount": 75.00,
        "customer_count": 4,
        "item_count": 2,
        "created_at": "2026-03-12T12:00:00Z",
        "updated_at": "2026-03-12T12:00:00Z"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "pages": 5
    }
  },
  "timestamp": "2026-03-12T12:00:00Z"
}
```

#### PUT /orders/{orderId}/status — 更新訂單狀態

**描述**：更新訂單狀態（需認證和權限）

**請求參數**：
```json
{
  "status": "confirmed",
  "remark": "已確認訂單"  // 可選
}
```

**允許的狀態轉換**：
- `pending` → `confirmed` / `cancelled`
- `confirmed` → `preparing` / `cancelled`
- `preparing` → `ready` / `cancelled`
- `ready` → `completed` / `cancelled`

**成功響應（HTTP 200）**：
```json
{
  "code": 200,
  "message": "Order status updated successfully",
  "data": {
    "id": 1001,
    "order_no": "ORD-20260312-001",
    "status": "confirmed",
    "updated_at": "2026-03-12T12:05:00Z"
  },
  "timestamp": "2026-03-12T12:05:00Z"
}
```

**錯誤響應**：
- **400 Bad Request**：狀態轉換無效
- **404 Not Found**：訂單不存在

---

### 5.4 分析模塊

#### GET /admin/analytics — 獲取分析數據

**描述**：獲取餐廳的分析統計數據（需認證和權限）

**請求參數**：
- 查詢參數：
  - `date`: string (可選，YYYY-MM-DD，默認今天)
  - `start_date`: string (可選，YYYY-MM-DD)
  - `end_date`: string (可選，YYYY-MM-DD)
  - `type`: string (可選，daily/monthly/yearly)

**成功響應（HTTP 200）**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "summary": {
      "total_orders": 50,
      "completed_orders": 45,
      "cancelled_orders": 5,
      "total_revenue": 3750.00,
      "average_order_value": 75.00,
      "busy_hours": "18:00-20:00"
    },
    "daily_stats": [
      {
        "date": "2026-03-12",
        "orders": 50,
        "revenue": 3750.00,
        "customers": 180,
        "avg_dining_time": 45
      }
    ],
    "top_items": [
      {
        "id": 101,
        "name": "紅油抄手",
        "quantity": 120,
        "revenue": 3000.00,
        "rank": 1
      }
    ],
    "table_stats": [
      {
        "table_id": 1,
        "table_number": "A1",
        "orders_count": 5,
        "total_revenue": 375.00,
        "avg_dining_time": 45
      }
    ]
  },
  "timestamp": "2026-03-12T12:00:00Z"
}
```

---

## 6. 錯誤處理

### 6.1 錯誤響應格式

```json
{
  "code": 400,
  "message": "Parameter validation failed",
  "errors": [
    {
      "field": "price",
      "code": "INVALID_VALUE",
      "reason": "Price must be a positive number"
    },
    {
      "field": "quantity",
      "code": "OUT_OF_RANGE",
      "reason": "Quantity must be between 1 and 100"
    }
  ],
  "timestamp": "2026-03-12T12:00:00Z"
}
```

### 6.2 常見錯誤碼

| 錯誤碼 | HTTP 狀態 | 中文 | 描述 |
|--------|-----------|------|------|
| **INVALID_REQUEST** | 400 | 無效請求 | 請求格式錯誤或缺少必填參數 |
| **INVALID_VALUE** | 400 | 無效值 | 參數值不符合規範 |
| **VALIDATION_ERROR** | 400 | 驗證失敗 | 業務邏輯驗證失敗 |
| **UNAUTHORIZED** | 401 | 未授權 | 缺少或無效的認證信息 |
| **FORBIDDEN** | 403 | 禁止訪問 | 無權限執行此操作 |
| **NOT_FOUND** | 404 | 不存在 | 請求的資源不存在 |
| **CONFLICT** | 409 | 衝突 | 資源衝突（如重複名稱） |
| **RATE_LIMIT_EXCEEDED** | 429 | 超出限流 | 請求過於頻繁 |
| **INTERNAL_ERROR** | 500 | 服務器錯誤 | 未預期的服務器錯誤 |
| **SERVICE_UNAVAILABLE** | 503 | 服務不可用 | 服務暫時不可用 |

---

## 7. 分頁與篩選

### 7.1 分頁規範

**查詢參數**：
```
page=1&limit=20
```

- `page`：頁碼，從 1 開始（默認 1）
- `limit`：每頁數量，1-100（默認 10）

**分頁響應**：
```json
{
  "code": 200,
  "data": {
    "items": [...],
    "pagination": {
      "total": 500,
      "page": 1,
      "limit": 20,
      "pages": 25,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

### 7.2 排序規範

**查詢參數**：
```
order_by=created_at&sort=desc
```

- `order_by`：排序字段（默認 created_at）
- `sort`：排序方向，asc（升序）/ desc（降序，默認）

### 7.3 篩選規範

**常見篩選字段**：
- `status`：單值或多值（如 status=pending,confirmed）
- `category_id`：分類 ID
- `date_range`：時間範圍（start_date / end_date）
- `price_range`：價格範圍（min_price / max_price）

**查詢示例**：
```
GET /api/v1/restaurants/1/orders?status=pending,confirmed&start_date=2026-03-01&end_date=2026-03-31&order_by=created_at&sort=desc&page=1&limit=20
```

---

## 版本歷史

| 版本 | 日期 | 說明 |
|------|------|------|
| v1.0 | 2026-03-12 | 初始版本 |

---

**文檔責任人**：技術架構團隊
**最後修訂日期**：2026-03-12
