# 規格完整性審查報告

> **專案名稱**：Vibe Money Book — 語音記帳應用
> **審查日期**：2026-03-17（第四次審查）
> **審查執行者**：A-Main (主代理)
> **審查版本**：v4.0
> **前次審查版本**：v3.0 (2026-03-17)

---

## 審查範圍

- 比對文件：01-1-PRD.md, 01-2-SRD.md, 01-3-API_Spec.md, API_Spec.yaml, 01-4-UI_UX_Design.md, 02-Dev_Plan.md
- **重點審查**：PRD-F-013（AI 引擎選擇：Gemini/OpenAI，用戶自行輸入 API Key）跨文件一致性

---

## 第四次審查：PRD-F-013 交叉比對

### 發現的缺漏與修正

| 編號 | 文件 | 問題類型 | 描述 | 修正方式 | 狀態 |
|------|------|---------|------|---------|------|
| F013-01 | 01-2-SRD.md (§2.1, §2.2) | 遺漏 | SRD 後端技術棧僅列 OpenAI SDK，架構圖僅含 OpenAI，未反映 PRD-F-013 Gemini 支援 | 後端技術棧新增 Google Generative AI SDK；架構圖新增 Gemini API 節點與引擎切換邏輯 | ✅ 已修正 |
| F013-02 | 01-2-SRD.md (§3.1, §3.2.1) | 遺漏 | Users 表缺少 `ai_engine` 欄位 | ER 圖與 SQL Schema 新增 `ai_engine` 欄位（enum: gemini/openai, default gemini） | ✅ 已修正 |
| F013-03 | 01-2-SRD.md (§4.2) | 不一致 | LLM 呼叫策略僅定義 gpt-4o-mini，未包含 Gemini 模型選項 | 模型選擇改為雙引擎：Gemini gemini-2.0-flash-lite（預設）+ OpenAI gpt-4o-mini；新增 §4.3 多引擎抽象架構 | ✅ 已修正 |
| F013-04 | 01-2-SRD.md (§5.2) | 不一致 | 環境變數含 `OPENAI_API_KEY`，但 PRD-F-013 規定使用者自行提供 Key | 移除 `OPENAI_API_KEY`，改為模型名稱配置；加註使用者 Key 透過 Header 傳入 | ✅ 已修正 |
| F013-05 | 01-2-SRD.md (§7.2) | 不一致 | API Key 安全策略僅描述「Key 存放於後端環境變數」，與 PRD-F-013「Key 儲存於本地」衝突 | 重寫 §7.2，明確描述 Key 儲存於前端 localStorage、透過 X-LLM-API-Key Header 傳遞、後端用後即棄 | ✅ 已修正 |
| F013-06 | 01-3-API_Spec.md (§5.2) | 遺漏 | GET/PUT /users/profile 未包含 `ai_engine` 欄位 | GET 響應新增 `ai_engine` 欄位；PUT 請求新增 `ai_engine` 參數與驗證規則 | ✅ 已修正 |
| F013-07 | 01-3-API_Spec.md (§5.3) | 遺漏 | POST /ai/parse 未定義 API Key 傳遞機制 | 新增 `X-LLM-API-Key` Request Header 說明；新增 401/403 錯誤碼 | ✅ 已修正 |
| F013-08 | API_Spec.yaml | 遺漏 | User schema 缺少 `ai_engine`；PUT /users/profile 缺少 `ai_engine`；POST /ai/parse 缺少 API Key header | User schema 新增 `ai_engine` 屬性；PUT 請求新增 `ai_engine`；POST /ai/parse 新增 `X-LLM-API-Key` header 參數與 403 錯誤 | ✅ 已修正 |
| F013-09 | 01-4-UI_UX_Design.md (§3.4) | 遺漏 | 設定頁完全未包含 AI 引擎選擇 UI | 設定頁 wireframe 新增 AI 引擎設定區塊；新增 §6 PRD-F-013 AI 引擎選擇 UI 完整規格（元件、互動、錯誤提示） | ✅ 已修正 |
| F013-10 | 02-Dev_Plan.md (T-201) | 遺漏 | T-201 僅描述 OpenAI 單引擎，未涵蓋多引擎抽象層 | T-201 新增 LLMProvider 介面設計、GeminiProvider/OpenAIProvider 實作、X-LLM-API-Key 處理 | ✅ 已修正 |
| F013-11 | 02-Dev_Plan.md (T-304) | 遺漏 | T-304 設定頁任務未提及 AI 引擎選擇功能 | T-304 新增 PRD-F-013 相關描述：AIEngineSelector 組件、APIKeyInput 組件、localStorage 存儲 | ✅ 已修正 |
| F013-12 | 02-Dev_Plan.md (T-101) | 遺漏 | T-101 Schema 初始化未提及 `ai_engine` 欄位 | T-101 任務描述新增 `ai_engine` 欄位 | ✅ 已修正 |
| F013-13 | 02-Dev_Plan.md (§5.2) | 不一致 | 後端架構 LLM 僅列 OpenAI SDK | 新增 Google Generative AI SDK 與統一抽象層說明 | ✅ 已修正 |
| F013-14 | 03-Docs_Review_Report.md | 遺漏 | 跨文件一致性矩陣未包含 PRD-F-013 | 新增 PRD-F-013 至一致性矩陣 | ✅ 已修正 |

---

## 第三次審查：UI/UX Design 交叉比對

### 發現的不一致與修正

| 編號 | 文件 | 問題類型 | 描述 | 修正方式 | 狀態 |
|------|------|---------|------|---------|------|
| UX-01 | 01-4-UI_UX_Design.md (§3.1.6) | 不一致 | Footer 顯示「POWERED BY GEMINI AI」，但 SRD/PRD 指定使用 OpenAI gpt-4o-mini | 改為「POWERED BY AI」，不綁定特定 LLM 廠牌，以便後續替換 | ✅ 已修正 |
| UX-02 | 01-4-UI_UX_Design.md (§3.1.1, §3.6) | 不一致 | Header/登入頁顯示「語音記帳教練 / VOICE FINANCE COACH」，其餘文件皆使用「Vibe Money Book」 | 主標題統一為「Vibe Money Book」，副標題為「語音記帳教練」 | ✅ 已修正 |
| UX-03 | 01-4-UI_UX_Design.md (§5.2) | 不一致 | 新類別名稱限制「不可超過 10 個字」，但 SRD SQL Schema 為 VARCHAR(50)、API_Spec.yaml 為 maxLength: 50 | 修正為「2–50 字元」，與 API 規格一致 | ✅ 已修正 |
| UX-04 | 01-4-UI_UX_Design.md | 遺漏 | 缺少 PRD-F-004「AI 解析結果確認卡片」的 UI 規格（常規交易的確認/修改互動） | 新增 §4.2 確認卡片規格，含 wireframe、元件規格、修改模式說明 | ✅ 已修正 |
| UX-05 | 02-Dev_Plan.md (§8.1) | 遺漏 | 文件存取約定表格未包含 01-4-UI_UX_Design.md，前端任務無 UI/UX 設計規格參考 | 新增 UI/UX Design 至文件存取表；T-103/105/203/204/302/303/304 輸入加入 UI/UX 章節引用 | ✅ 已修正 |

### v2.0 遺留項目修正

| 原編號 | 文件 | 問題描述 | 修正方式 | 狀態 |
|--------|------|---------|---------|------|
| INC-01 | 02-Dev_Plan.md (T-401) | PRD 提及 PWA，Dev Plan 無 PWA 配置任務 | T-401 重命名並加入 vite-plugin-pwa 配置、manifest、Lighthouse 驗證 | ✅ 已修正 |
| INC-02 | 01-3-API_Spec.md, 01-4-UI_UX_Design.md | PRD-F-004「修改」在前端本地處理，文件未說明設計決策 | 在 API Spec POST /transactions 與 UI/UX §4.2 補充設計說明 | ✅ 已修正 |
| INC-03 | 02-Dev_Plan.md (T-403) | LLM 延遲 < 3s 目標未含於驗測範圍 | T-403 驗證條件新增 LLM API 回應延遲檢測 | ✅ 已修正 |
| MIS-01 | 01-2-SRD.md (§1.4) | Web Speech API 語言設定策略 (`zh-TW`) 未明確定義 | SRD 新增「Web Speech API 語言設定」段落，含 fallback 策略 | ✅ 已修正 |
| MIS-02 | API_Spec.yaml | 429 回應缺少 Rate Limit Header 定義 | 新增 `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After` headers | ✅ 已修正 |
| MIS-03 | 01-1-PRD.md (§7) | 新手引導流程未定義亦未標記為 Out of Scope | 在 Out of Scope 明確列入「新手引導 / Onboarding 流程」 | ✅ 已修正 |
| MIS-04 | 01-3-API_Spec.md (§5.4) | `persona_used` 來源邏輯未說明 | 在 POST /transactions 驗證段落補充：前端從 user profile 取得 persona 值 | ✅ 已修正 |
| MIS-05 | 02-Dev_Plan.md (T-204) | T-204 前置任務缺少 T-201、T-202 依賴 | T-204 前置任務改為「T-203（UI 開發）；T-201、T-202（API 串接整合測試時需要）」 | ✅ 已修正 |

---

## H-Director 決議項目

| 編號 | 文件 | 描述 | 決議 | 狀態 |
|------|------|------|------|------|
| DEC-01 | PRD (PRD-F-003) vs UI/UX (§3.1) | **互動模型差異**：PRD-F-003 原定義聊天式（Chat UI）介面，UI/UX Design 採用儀表板式（Dashboard）佈局。 | **採用儀表板式 Dashboard 佈局**。已更新 PRD-F-003 描述為儀表板式設計，並同步更新 SRD 架構圖、Dev Plan 任務描述。 | ✅ 已決議並關閉 (2026-03-17) |
| DEC-02 | UI/UX (§3.1.4) vs PRD (PRD-F-009) | UI/UX 首頁「最近帳目」區域包含「清空全部」按鈕（批量刪除），但 PRD-F-009 僅定義「支援刪除單筆記錄」。 | **僅保留單筆刪除，移除批量刪除**。已從 UI/UX Design 移除「清空全部」按鈕及相關規格。 | ✅ 已決議並關閉 (2026-03-17) |

---

## 跨文件一致性矩陣

### PRD 功能 → 各文件涵蓋狀態

| PRD 功能 | SRD | API Spec | API YAML | UI/UX | Dev Plan |
|----------|-----|----------|----------|-------|----------|
| PRD-F-001 語音輸入 | ✅ §1.4 | — | — | ✅ §4.1 | ✅ T-203 |
| PRD-F-002 文字輸入 | — | — | — | ✅ §3.1.5 | ✅ T-204 |
| PRD-F-003 儀表板式首頁 | — | — | — | ✅ §3.1 | ✅ T-204 |
| PRD-F-004 解析結果確認 | ✅ §4.1.1 | ✅ §5.3 | ✅ /ai/parse | ✅ §4.2 | ✅ T-204 |
| PRD-F-005 人設選擇 | ✅ §4.1.2 | ✅ §5.2 | ✅ PUT /users/profile | ✅ §3.4 | ✅ T-304 |
| PRD-F-006 情緒回饋 | ✅ §4.1.2 | ✅ §5.3 | ✅ /ai/parse | ✅ §3.1.3 | ✅ T-201 |
| PRD-F-007 預算血條 | ✅ §1.1 | ✅ §5.5 | ✅ /budget/summary | ✅ §3.1.2, §4.4 | ✅ T-302 |
| PRD-F-008 圓餅圖 | — | ✅ §5.6 | ✅ /stats/distribution | ✅ §3.2 | ✅ T-302 |
| PRD-F-009 交易記錄 | — | ✅ §5.4 | ✅ /transactions | ✅ §3.3 | ✅ T-303 |
| PRD-F-010 使用者設定 | ✅ §3 | ✅ §5.2 | ✅ PUT /users/profile | ✅ §3.4 | ✅ T-304 |
| PRD-F-011 類別預算 | ✅ §3.2 | ✅ §5.5 | ✅ /budget/categories | ✅ §3.4 | ✅ T-304 |
| PRD-F-012 新類別偵測 | ✅ §3.4, §4.1.1 | ✅ §5.3, §5.5 | ✅ POST/DELETE /budget/categories | ✅ §5 | ✅ T-201/204/301/304 |
| PRD-F-013 AI 引擎選擇 | ✅ §2.1, §2.2, §3.1, §3.2, §4.2, §4.3, §5.2, §7.2 | ✅ §5.2, §5.3 | ✅ User schema, PUT /users/profile, POST /ai/parse | ✅ §3.4, §6 | ✅ T-101/201/304 |
| PRD-NF-007 PWA | — | — | — | — | ✅ T-401 |

### API Spec (md) ↔ API_Spec.yaml 一致性

| 端點 | Markdown | YAML | 一致性 |
|------|----------|------|--------|
| POST /auth/register | ✅ | ✅ | ✅ 一致 |
| POST /auth/login | ✅ | ✅ | ✅ 一致 |
| GET /users/profile | ✅ | ✅ | ✅ 一致 |
| PUT /users/profile | ✅ | ✅ | ✅ 一致 |
| POST /ai/parse | ✅ | ✅ | ✅ 一致 |
| POST /transactions | ✅ | ✅ | ✅ 一致 |
| GET /transactions | ✅ | ✅ | ✅ 一致 |
| GET /transactions/:id | ✅ | ✅ | ✅ 一致 |
| DELETE /transactions/:id | ✅ | ✅ | ✅ 一致 |
| GET /budget/summary | ✅ | ✅ | ✅ 一致 |
| GET /budget/categories | ✅ | ✅ | ✅ 一致 |
| POST /budget/categories | ✅ | ✅ | ✅ 一致 |
| PUT /budget/categories | ✅ | ✅ | ✅ 一致 |
| DELETE /budget/categories/:category | ✅ | ✅ | ✅ 一致 |
| GET /stats/distribution | ✅ | ✅ | ✅ 一致 |

---

## 結論

### 本次審查（v4.0）

- **PRD-F-013 相關缺漏/不一致**：14 項（全部已修正 ✅）
- **修改範圍**：6 份文件（SRD、API Spec md、API_Spec.yaml、UI/UX Design、Dev Plan、Review Report）

### 修改文件清單

| 文件 | 修改內容 |
|------|---------|
| 01-2-SRD.md | §2.1 新增 Gemini SDK；§2.2 架構圖新增 Gemini 節點與引擎切換；§3.1/§3.2.1 Users 表新增 `ai_engine` 欄位；§4.2 模型選擇改為雙引擎；新增 §4.3 多引擎抽象架構（LLMProvider 介面）；§5.2 移除硬編碼 API Key 環境變數；§7.2 重寫 API Key 安全策略 |
| 01-3-API_Spec.md | §4.2 更新端點描述；§5.2 GET/PUT /users/profile 新增 `ai_engine` 欄位；§5.3 POST /ai/parse 新增 `X-LLM-API-Key` Header；§6 新增 LLM_API_KEY_MISSING/INVALID 錯誤碼 |
| API_Spec.yaml | User schema 新增 `ai_engine` 屬性；PUT /users/profile 新增 `ai_engine` 參數；POST /ai/parse 新增 `X-LLM-API-Key` header parameter 與 403 錯誤 |
| 01-4-UI_UX_Design.md | §3.4 設定頁 wireframe 新增 AI 引擎設定區塊；新增 §6 PRD-F-013 完整 UI 規格（引擎選擇卡片、API Key 輸入、驗證狀態、錯誤提示）；章節重新編號 |
| 02-Dev_Plan.md | T-101 新增 `ai_engine` 欄位；T-201 新增多引擎抽象層任務；T-304 新增 AI 引擎選擇 UI；§5.2 更新 LLM SDK；任務總覽表、Mermaid 圖、追蹤清單同步更新 |
| 03-Docs_Review_Report.md | 新增第四次審查段落（14 項修正）；一致性矩陣新增 PRD-F-013 列 |

### 累積狀態

- **已解決不一致/遺漏**：v1.0 (0項) + v2.0 (10項) + v3.0 (13項) + v4.0 (14項) = **37 項已修正**
- **未解決項目**：0 項
- **待決議項目**：0 項
- **已決議項目**：2 項（DEC-01 儀表板式佈局 ✅、DEC-02 僅保留單筆刪除 ✅）
- **建議**：PRD-F-013 已完整反映至所有規格文件，**可進入 Phase 2**。

---

**審查人**：A-Main (主代理)
**覆核人**：H-Director (待覆核)
**下次審查預定**：進入 Phase 2 開發前或由 H-Director 發起
