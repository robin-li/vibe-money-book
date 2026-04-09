# 規格完整性審查報告

> **審查日期**：2026-03-17
> **審查版本**：v2.0（重新全面審查）
> **審查執行者**：AI 助手（Phase 1 交叉比對審查）

---

## 審查範圍

- 比對文件：`01-1-PRD.md`、`01-2-SRD.md`、`01-5-API_Spec.md`、`01-6-UI_UX_Design.md`、`02-Dev_Plan.md`、`04-CI_CD_Spec.md`、`API_Spec.yaml`

---

## 不一致項目

| 編號 | 文件 | 不一致描述 | 建議修正 |
|------|------|------------|----------|
| IC-001 | `01-6-UI_UX_Design.md` vs `01-1-PRD.md`、`01-2-SRD.md` | UI/UX 設計中 AI 引擎選擇卡片的 OpenAI 副標題為「(GPT-4o)」（§6.2 line 755），但 PRD 與 SRD 均明確指定模型為 **gpt-4o-mini**。 | 將 UI/UX §6.2 引擎副標修正為「(GPT-4o-mini)」 |
| IC-002 | `01-1-PRD.md` vs `01-2-SRD.md` | PRD §4.2 CategoryBudget 資料模型缺少 `is_custom` 欄位（BOOLEAN），但 SRD §3.1 ER 圖與 §3.2 SQL Schema 均已定義此欄位。PRD 資料模型未同步更新。 | 在 PRD §4.2 CategoryBudget 表中新增 `is_custom` 欄位（Boolean, 預設 false） |
| IC-003 | `01-5-API_Spec.md` vs `API_Spec.yaml` | Markdown API Spec 中 `GET /budget/categories` 響應範例（§5.5）的 category 項目缺少 `is_custom` 欄位，但 YAML `CategoryBudget` schema 已包含此欄位。 | 在 Markdown API Spec §5.5 的 categories 響應範例中加入 `"is_custom": false/true` |
| IC-004 | `01-5-API_Spec.md` vs `API_Spec.yaml` | Markdown API Spec 中 Register/Login 成功響應（§5.1）的 user 物件缺少 `ai_engine` 欄位，但 YAML 的 `User` schema 與 `GET /users/profile` 響應均包含此欄位。 | 在 Markdown API Spec §5.1 的 register/login user 物件中加入 `"ai_engine": "gemini"` |
| IC-005 | `02-Dev_Plan.md` 內部 | Dev Plan §3.1 描述「T-101 ~ T-104 **完全並行**」，但 §4.1 任務總覽表中 T-104 的前置任務為「T-102, T-103」。此二者矛盾。 | 修正 §3.1 敘述為「T-101 ~ T-103 完全並行；T-104 待 T-102, T-103 就緒後開始」（與 §4.1 及並行群組圖一致） |
| IC-006 | `02-Dev_Plan.md` vs `01-5-API_Spec.md` | Dev Plan T-304（§4.2）中描述串接 `PUT /profile`，但 API Spec 定義的端點為 `PUT /users/profile`。路徑不一致。 | 將 Dev Plan T-304 中的 `PUT /profile` 修正為 `PUT /users/profile` |
| IC-007 | `01-1-PRD.md` vs `01-2-SRD.md` | PRD PRD-F-013 描述「若 API Key 無效或超過 quota，以友善錯誤訊息提示使用者，並**自動 fallback 至預設引擎**」，暗示系統會自動嘗試另一個引擎。但 SRD §4.3 Fallback 機制描述為「回傳友善錯誤訊息，提示使用者檢查 Key 或**切換引擎**」，不涉及自動重試。兩者對 fallback 行為的定義不同。同時，SRD §4.2 仍有「重試 2 次，最終失敗則 fallback 至預設引擎（Gemini）」的描述，與 §4.3 自身也不一致。 | 建議統一為 SRD §4.3 版本（僅回傳錯誤訊息，不自動 fallback），因為系統無 server-side LLM API Key，無法自動嘗試另一引擎。需同步修正：(1) PRD PRD-F-013 移除「自動 fallback」敘述；(2) SRD §4.2 移除「fallback 至預設引擎」敘述。 |
| IC-008 | `01-2-SRD.md` vs `02-Dev_Plan.md` | SRD §2.1 前端 HTTP 客戶端推薦「Fetch API (或 Axios)」，但 Dev Plan T-106 明確指定「建立 Axios 實例」。技術選型未統一。 | 在 SRD §2.1 中明確選定 Axios（配合 Dev Plan 已選定的方案），移除「或」的模糊描述。 |
| IC-009 | `01-6-UI_UX_Design.md` 內部 | 首頁同時定義了底部固定「輸入區 (Input Bar)」（§3.1.5, `position: fixed; bottom: 0`）與「底部 Tab Bar」（§3.5, `position: fixed; bottom: 0`），兩者的垂直排列與 z-index 關係未明確說明，可能導致 UI 重疊。 | 在 UI/UX §3.1.5 或 §3.5 中補充說明首頁的 Input Bar 與 Tab Bar 共存方式（例如：Input Bar 的 `bottom` = Tab Bar 高度 + safe-area，或首頁不顯示 Tab Bar）。 |
| IC-010 | `01-1-PRD.md` 內部 | PRD §2.5 功能編號排列順序不連貫：PRD-F-010 → PRD-F-011 → **PRD-F-013** → **PRD-F-012**。PRD-F-013（AI 引擎選擇）出現在 PRD-F-012（AI 自動偵測類別）之前，違反編號遞增慣例。 | 調整 PRD §2.5 的段落順序為 PRD-F-010 → PRD-F-011 → PRD-F-012 → PRD-F-013，使編號與內容排列一致。 |

---

## 遺漏項目

| 編號 | 文件 | 遺漏描述 | 應補充至 |
|------|------|----------|----------|
| MS-001 | `01-5-API_Spec.md`、`API_Spec.yaml` | UI/UX §6.3 描述「輸入 API Key → 觸發即時驗證（呼叫後端檢查）」，但 API Spec 中**未定義 API Key 驗證端點**。前端需要一個端點來驗證使用者輸入的 LLM API Key 是否有效。 | 在 API Spec 中新增 `POST /ai/validate-key` 端點（接收 `X-LLM-API-Key` Header，回傳驗證結果），並更新 YAML。或在文件中明確說明 Key 驗證透過首次 `/ai/parse` 呼叫的錯誤碼（403）來間接完成。 |
| MS-002 | `02-Dev_Plan.md` | Dev Plan 任務清單中沒有明確涵蓋 **User Profile API**（`GET /users/profile`、`PUT /users/profile`）的開發任務。T-105 僅涵蓋認證 API（register/login），Profile 端點未被分配至任何任務。 | 將 Profile API 開發併入 T-105 的步驟中（擴展為「認證 + 使用者模組」），或新增獨立任務 T-107。 |
| MS-003 | `01-2-SRD.md` | SRD 環境變數清單（§5.2）中，LLM 相關僅列出 `OPENAI_MODEL` 和 `GEMINI_MODEL`。若 IC-007 決定採用「不自動 fallback」方案，則環境變數清單與架構一致。但若決定保留自動 fallback，則缺少 **server-side LLM API Key** 環境變數（`GEMINI_API_KEY`）。 | 待 IC-007 決策後同步更新。若不自動 fallback，環境變數無需修改；若需 fallback，新增 `GEMINI_API_KEY` 至環境變數清單。 |
| MS-004 | `01-2-SRD.md` | SRD 未定義 **CORS 策略**細節（允許的 origins、methods、headers），而 Dev Plan T-102 已要求配置 CORS 中間件。 | 在 SRD §2.3 API 設計原則或 §7 安全性中補充 CORS 配置規範（例：開發環境允許 `localhost:5173`，生產環境限定前端部署域名）。 |
| MS-005 | `01-5-API_Spec.md` | API Spec 未說明 **登出策略**。UI/UX 設定頁有「登出」按鈕，但無對應 API 端點，且未在文件中明確說明登出為純前端操作。 | 在 API Spec §2 認證章節補充說明：「登出由前端處理（清除 localStorage 中的 Token），無需後端端點」。 |
| MS-006 | `01-5-API_Spec.md` | Markdown API Spec 未定義 429 Rate Limit 響應的 **Response Headers**（`X-RateLimit-Limit`、`X-RateLimit-Remaining`、`X-RateLimit-Reset`、`Retry-After`），但 YAML 已定義這些 headers。兩份 API 文件不同步。 | 在 Markdown API Spec §3 通用規範或 §6 錯誤處理中，補充 429 響應的 Rate Limit Headers 定義。 |
| MS-007 | `02-Dev_Plan.md`、`01-2-SRD.md` | Dev Plan T-202 描述交易刪除為「軟刪除或硬刪除」，未明確決策。SRD SQL Schema 使用 `ON DELETE CASCADE`（硬刪除），但 Dev Plan 未統一。 | 在 T-202 中明確指定採用**硬刪除**（與 SRD `ON DELETE CASCADE` 一致）。 |

---

## 結論

- **第一輪**：不一致 10 項 + 遺漏 7 項 → 全部修正（MS-004 CORS 依開發者決策暫不處理）
- **第二輪**：殘留瑕疵 5 項 → 全部修正
- **建議**：**通過，可進入 Phase 2**

### 修正記錄

| 編號 | 狀態 | 修正摘要 |
|------|------|---------|
| IC-001 | ✅ 已修正 | UI/UX OpenAI 副標改為「(GPT-4o-mini)」 |
| IC-002 | ✅ 已修正 | PRD CategoryBudget 新增 `is_custom` 欄位 |
| IC-003 | ✅ 已修正 | API Spec categories 響應範例加入 `is_custom` |
| IC-004 | ✅ 已修正 | API Spec register/login 響應加入 `ai_engine` |
| IC-005 | ✅ 已修正 | Dev Plan §3.1 修正並行描述 |
| IC-006 | ✅ 已修正 | Dev Plan T-304 路徑改為 `PUT /users/profile` |
| IC-007 | ✅ 已修正 | PRD + SRD 統一為「回傳錯誤訊息，不自動 fallback」 |
| IC-008 | ✅ 已修正 | SRD HTTP 客戶端統一為 Axios |
| IC-009 | ✅ 已修正 | UI/UX 補充 Input Bar 位於 Tab Bar 上方的佈局說明 |
| IC-010 | ✅ 已修正 | PRD 功能編號重新排列為 F-012 → F-013 |
| MS-001 | ✅ 已修正 | 新增 `POST /ai/validate-key` 端點（API Spec + YAML + Dev Plan） |
| MS-002 | ✅ 已修正 | T-105 擴展為「認證與使用者模組 API」，涵蓋 Profile API |
| MS-003 | ✅ 已修正 | 隨 IC-007 解決，不需 server-side API Key |
| MS-004 | ⏭️ 暫不處理 | CORS 策略由開發時決定 |
| MS-005 | ✅ 已修正 | API Spec 補充登出策略說明 |
| MS-006 | ✅ 已修正 | API Spec 補充 429 Rate Limit Response Headers |
| MS-007 | ✅ 已修正 | Dev Plan T-202 明確為硬刪除 |

### 第二輪審查（殘留瑕疵修正）

| 編號 | 狀態 | 修正摘要 |
|------|------|---------|
| IC-011 | ✅ 已修正 | Dev Plan T-201 步驟編號重複（兩個 step 9）→ 重新編號 8-12 |
| IC-012 | ✅ 已修正 | SRD §5.2 環境變數註解仍引用「fallback」→ 更新為「系統不持有 LLM API Key」 |
| IC-013 | ✅ 已修正 | SRD §2.1 後端框架「Express.js (或 Fastify)」→ 統一為「Express.js」 |
| MS-008 | ✅ 已修正 | Dev Plan T-304 設定頁缺少串接 `POST /ai/validate-key` → 已補充 |
| IC-014 | ✅ 已修正 | Dev Plan Mermaid 圖 T-105 標籤更新為「認證+使用者模組」 |
