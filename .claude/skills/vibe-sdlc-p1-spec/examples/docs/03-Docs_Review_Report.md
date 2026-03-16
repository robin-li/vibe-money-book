# 規格完整性審查報告

> **項目名稱**：Easy Dine — 小型餐廳點餐系統
> **審查日期**：2026-03-15
> **審查執行者**：A-Main (主代理)
> **審查版本**：v1.0

---

## 審查範圍

- 比對文件：01-1-PRD.md, 01-2-SRD.md, 01-3-API_Spec.md, API_Spec.yaml, 02-Dev_Plan.md

---

## 不一致項目

| 編號 | 文件 | 不一致描述 | 建議修正 |
|------|------|------------|----------|
| INC-01 | 01-1-PRD.md (§3.2), API_Spec.yaml (`OrderStatus`) | PRD 定義訂單狀態包含「已取消 (Cancelled)」，但 API Spec 的狀態轉換枚舉中未包含 `cancelled` 狀態。 | 在 API_Spec.yaml 的 OrderStatus enum 中新增 `cancelled`，並補充對應的狀態轉換規則。 |
| INC-02 | 01-2-SRD.md (§4.1), API_Spec.yaml (`MenuItem`) | SRD 定義 MenuItems 包含 `spicy_level` 欄位，但 API Spec 的 MenuItem schema 未包含此欄位。 | 在 API_Spec.yaml 的 MenuItem schema 中新增 `spicyLevel` 欄位 (integer, 0-5)。 |
| INC-03 | 01-1-PRD.md (§2.3), 02-Dev_Plan.md (T-301) | PRD 指定桌位應支援「合併桌位」功能，但 Dev Plan 的 T-301 任務描述中未涵蓋此功能。 | 在 T-301 任務描述中補充「合併桌位 API」，或在 PRD 中將此功能標記為 v2.0 範圍。 |
| INC-04 | 01-3-API_Spec.md (§2.1), API_Spec.yaml (`LoginResponse`) | API 說明文件描述登入回傳包含 `refreshToken`，但 yaml 的 LoginResponse schema 僅定義 `token` 欄位。 | 在 API_Spec.yaml 的 LoginResponse 中新增 `refreshToken` 欄位。 |

> 註：「文件」列出存在不一致的所有相關文件。

---

## 遺漏項目

| 編號 | 文件 | 遺漏描述 | 應補充至 |
|------|------|----------|----------|
| MIS-01 | 01-1-PRD.md (§3.5) | PRD 定義了「推薦菜品」功能，但 SRD 未說明推薦演算法或排序邏輯，API Spec 也未定義推薦相關的查詢參數。 | 01-2-SRD.md 補充推薦邏輯；API_Spec.yaml 的 `GET /menu-items` 補充 `recommended=true` 查詢參數。 |
| MIS-02 | 01-2-SRD.md (§5.2) | SRD 要求實作 Rate Limiting，但 API Spec 未定義各端點的速率限制回應 (HTTP 429) 與相關 Header。 | API_Spec.yaml 所有端點補充 `429` 回應定義，並在說明文件中記錄速率限制策略。 |
| MIS-03 | 01-2-SRD.md (§4.1) | SRD 定義了 ActivityLogs 資料表用於審計日誌，但 API Spec 未提供任何審計日誌查詢端點。 | 評估是否需要 `GET /admin/activity-logs` 端點，若為 v1.0 範圍則補充至 API_Spec.yaml。 |
| MIS-04 | 02-Dev_Plan.md (T-202) | Dev Plan 任務 T-202 提及「結帳單列印 (CSS Print)」，但 PRD 未定義結帳單的具體欄位與排版規格。 | 01-1-PRD.md 補充結帳單的欄位定義 (訂單編號、桌號、品項、金額、時間等) 與排版要求。 |
| MIS-05 | 01-1-PRD.md (§2.1) | PRD 描述「顧客端免登入，掃碼即進入」，但 SRD 與 API Spec 均未定義掃碼後如何識別桌號與建立匿名 Session 的機制。 | 01-2-SRD.md 補充匿名 Session 機制說明；API_Spec.yaml 補充 QR Code URL 結構定義 (如 `/order?table={tableId}`)。 |

---

## 結論

- **不一致項目**：4 項
- **遺漏項目**：5 項
- **建議**：**需修正後重新審查**

### 修正優先順序建議

| 優先級 | 項目 | 理由 |
|--------|------|------|
| P0 | INC-01, MIS-05 | 影響核心訂單流程與顧客端入口邏輯 |
| P0 | INC-04 | 影響認證機制完整性 |
| P1 | INC-02, MIS-01 | 功能完整性但不阻塞主流程 |
| P1 | MIS-02, MIS-03 | 安全與審計相關，上線前必須解決 |
| P2 | INC-03, MIS-04 | 可延至 v2.0 或在開發階段補充 |

---

**審查人**：A-Main (主代理)
**覆核人**：H-Director (待覆核)
**下次審查預定**：修正完畢後由 H-Director 發起
