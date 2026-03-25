# 規格完整性審查報告

> **審查日期**：2026-03-25
> **審查版本**：v3.0（M7 更新審查）
> **審查執行者**：AI 助手（Phase 1 交叉比對審查）

## 審查範圍

- 比對文件：01-1-PRD.md (v1.3), 01-2-SRD.md (v1.3), 01-3-API_Spec.md (v1.4), 02-Dev_Plan.md (v1.4), API_Spec.yaml (v1.3.0)
- 重點：M7 新增功能（PRD-F-016 統計頁交互展開、PRD-F-017 AI 引擎進階設定）跨文件一致性

## 不一致項目

| 編號 | 文件 | 不一致描述 | 建議修正 | 優先級 |
|------|------|------------|----------|--------|
| IC-001 | API_Spec.yaml | YAML 仍為 v1.3.0，完全缺少 M7 變更：無 `GET /ai/providers`、`ai_model` 欄位、`ai_engine` 四選項、`POST /ai/validate-key` body 參數、`GET /ai/config` 四供應商狀態 | 同步所有 M7 變更至 YAML，版本升至 v1.4.0 | P0 |
| IC-002 | 01-3-API_Spec.md | register/login/profile 的 user 物件回應範例缺少 `ai_model` 欄位 | 補充 `"ai_model": null` 至 User 回應範例 | P1 |
| IC-003 | API_Spec.yaml | `components/schemas/User` 缺少 `ai_model` 屬性，`ai_engine` enum 僅 gemini/openai | 同 IC-001 一併修正 | P0 |
| IC-004 | 01-2-SRD.md | §7 子章節標號為 6.1/6.2（應為 7.1/7.2），§8 子章節標號為 7.1/7.2/7.3（應為 8.1/8.2/8.3），v1.2 重新編號遺留 | 修正子章節編號 | P2 |

## 遺漏項目

| 編號 | 文件 | 遺漏描述 | 應補充至 | 優先級 |
|------|------|----------|----------|--------|
| GAP-001 | API_Spec.yaml | `GET /ai/providers` 端點定義完全缺失（含 `ProviderInfo`、`ModelInfo` schema） | API_Spec.yaml paths + schemas | P0 |
| GAP-002 | 01-3-API_Spec.md | `PUT /users/profile` 請求範例未包含 `ai_model` 欄位 | 01-3-API_Spec.md §5.2 | P1 |
| GAP-003 | 02-Dev_Plan.md | T-703 未明確說明展開交易明細時如何取得 AI 評論（逐筆呼叫 `GET /transactions/:id` 或擴展列表 API） | 02-Dev_Plan.md T-703 | P2 |

## PRD → SRD → API → Dev Plan 交叉對應驗證

| PRD 功能 | SRD 對應 | API 對應 | Dev Plan 對應 | 結果 |
|---------|---------|---------|--------------|------|
| PRD-F-016 統計頁條狀圖展開 | 無需變更（純前端交互） | 使用現有 `GET /transactions` | T-703 | ✅ |
| PRD-F-017 供應商選擇 | §4.3 多引擎架構 | `PUT /users/profile` | T-701, T-704 | ✅ |
| PRD-F-017 模型選擇 | §4.3 LLMProvider + ModelInfo | `GET /ai/providers` | T-701, T-702, T-704 | ✅ |
| PRD-F-017 API Key 測試 | §4.3 validateKey() | `POST /ai/validate-key` | T-702, T-704 | ✅ |
| PRD-F-017 預設引擎後備 | §4.3 預設引擎後備 | `GET /ai/config` | T-701, T-702, T-704 | ✅ |
| PRD-F-017 資料模型變更 | ER 圖 + SQL | `PUT /users/profile` | T-701, T-702 | ✅ |

## 結論

- 不一致項目：4 項（P0: 2 項, P1: 1 項, P2: 1 項）
- 遺漏項目：3 項（P0: 1 項, P1: 1 項, P2: 1 項）
- 建議：**需修正後重新確認**。P0 項目（API_Spec.yaml 同步）為必修，P1/P2 可在開發過程中修正。
