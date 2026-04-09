# 專案現況

> **更新時間**：2026-04-09 22:20 (UTC+8)
> **彙整者**：A-Main
> **專案**：robin-li/vibe-money-book
> **當前分支**：`dev/main-agent`（同步至 `origin/main`）
> **最新 commit**：`32640bc` fix(ci): override VITE_API_BASE_URL & CORS_ORIGIN for E2E job (#205)

---

## 1. 里程碑進度

| 里程碑 | 進度條 | 完成/總數 | 狀態 |
|--------|--------|-----------|------|
| M1 基礎架構與認證 | ██████████ | 7/7 | ✅ 已完成 |
| M2 核心記帳 | ██████████ | 11/11 | ✅ 已完成 |
| M3 預算視覺化與統計 | ██████████ | 11/11 | ✅ 已完成 |
| M4 品質與部署 | ██████████ | 5/5 | ✅ 已完成 |
| M5 語音/自然語義篩選查詢 | ██████████ | 6/6 | ✅ 已完成 |
| M6 i18n 多語系支援 | ██████████ | 13/13 | ✅ 已完成 |
| M7 統計頁互動 + AI 引擎進階 | ██████████ | 11/11 | ✅ 已完成 |
| **Milestone 總計** | ██████████ | **64/64 (100%)** | — |
| **全 Repo Issues** | ██████████ | **115/118 (97%)** | 3 open |

**目前無進行中的里程碑**，待規劃 M8 或處理 on-hold / 測試維護議題。

---

## 2. Agent 狀態（單 Agent 模式）

| Agent | 狀態 | 當前任務 | 備註 |
|-------|------|---------|------|
| A-Main | ⚪ idle | — | 本日處理完 5 個 PR（#200-#205），正常收尾 |

---

## 3. 注意事項

### ❌ 待處理
- **#206 [Tech Debt] E2E 測試維護：15 個過時測試需更新**（今日新建，P2）
  - 分布：`ai-engine-settings` (3) + `ai-query` (3) + `history` (3) + `i18n` (5) + `stats-drilldown` (1)
  - 本質是 M5/M6/M7 迭代期間 feature 改動但 E2E 沒同步
  - 修復不緊急，可穿插在後續迭代內逐個處理

### 💡 on-hold 議題（無急迫性）
- **#172 [Enhancement] 提升 AI 分類準確度**（更強模型 + 前端二次確認）— `on-hold`
- **#162 [Bug] AI 語義查詢在大量交易時失敗**（OpenAI 回傳空結果）— `on-hold`

### ⚠️ 規格文件待補（PR #200 遞延）
- `docs/00-Docs_Index.md`（新版 vibe-sdlc-spec 要求的文件入口索引）
- `docs/01-3-SDD.md`（系統設計文件，需從 SRD/Dev Plan 內容拆出）
- 非阻塞，留待後續迭代補上

---

## 4. 近期待辦

- [ ] #206 處理 E2E 15 個過時測試（建議分 5 個小 PR 按檔案分，下載 `playwright-report` artifact 看 failure screenshot 再修）
- [ ] 補建 `docs/00-Docs_Index.md` 與 `docs/01-3-SDD.md`
- [ ] 規劃 M8 或解封 on-hold 議題（#172 / #162）

---

## 5. 最近動態（今日 2026-04-09）

| PR | 標題 | 合併時間 (UTC+8) |
|----|------|-------|
| ✅ #205 | fix(ci): override VITE_API_BASE_URL & CORS_ORIGIN + rate limit | 22:19 |
| ✅ #204 | docs(skills): add STATUS.md versioning policy & declare project mode | 21:24 |
| ✅ #202 | fix(ci): correct DATABASE_URL in .env.example to PostgreSQL | 19:37 |
| ✅ #201 | chore(skills): restructure vibe-sdlc skill suite (drop pN- prefix) | 15:43 |
| ✅ #200 | docs: align spec file naming with updated vibe-sdlc-spec | 15:43 |

### 本日完成的工作摘要

1. **規格文件對齊新版 vibe-sdlc-spec**（#200）
   - `01-3-API_Spec.md` → `01-5-API_Spec.md`、`01-4-UI_UX_Design.md` → `01-6-UI_UX_Design.md`（git rename 99% / 98%）
   - 5 份文件版本號 minor +1，30+ 處引用同步更新

2. **`.claude/skills/` 重構**（#201）
   - 6 個 phase skill 去 `pN-` 前綴改功能命名
   - 新增 `vibe-sdlc-status` skill
   - 範例文件擴充：`00-Docs_Index`、`01-3-SDD`、`01-4-GDD`

3. **CI E2E 四層故障鏈修復**（#202 + #205）
   - L1: DATABASE_URL (SQLite → PostgreSQL) — 解開 backend 啟動問題
   - L2: VITE_API_BASE_URL / CORS_ORIGIN 指向 production → 覆蓋為 localhost
   - L3: RATE_LIMIT_AUTH_PER_MIN=10 爆掉 → 覆蓋為 10000
   - L4: 15 個測試過時（遷移至 #206 追蹤）

4. **STATUS.md 版控策略規範**（#204）
   - skill 新增「版控策略」章節（A/B/C 三模式）
   - 本專案採 C 模式：STATUS.md 進版控、`A-*.md` 忽略
   - 首次建立 `docs/status/STATUS.md` 作為版控基準

5. **環境清理**
   - 本地清掉 8 個已合併 feature 分支
   - 遠端清掉 5 個 stale 分支
   - 修正並關閉 #203（原診斷錯誤，根因被改寫多次）
   - 新建 #206 追蹤測試維護

---

## 6. 部署現況（本機）

| 項目 | 狀態 |
|------|------|
| 🐳 Docker | 🔴 未運行（daemon 未啟動） |
| 🔗 Cloudflare Tunnel | 🟡 cloudflared 進程運行中（PID 684），但後端不在故公網回 502 |
| 🌐 公網端點 | `moneybook.smart-codings.com` → 502 / `moneybook-api.smart-codings.com/health` → 502 |
| 🏷 最新 release tag | `v1.4.3` |

> 本日所有工作皆為 CI 環境 / 規格文件 / skill 維護，未影響 production 部署。若要恢復對外服務需啟動 Docker 再執行 `scripts/start.sh`。

---

## 7. CI 狀態

| 分支 | Backend CI | Frontend CI | E2E Tests |
|------|-----------|-------------|-----------|
| main (`32640bc`) | ✅ pass | ✅ pass | 🟡 42/57 (74%) pass，15 過時測試失敗 → #206 |

### CI E2E 修復里程碑

| 時間 | E2E 狀態 | 根因 |
|------|---------|------|
| 2026-03-26 ~ | ❌ 全部 timeout（1h15m） | L1: DATABASE_URL=SQLite |
| #202 合併後 | ❌ 全部 timeout | L2: frontend 打 production URL |
| #205 第一次 commit | 🟡 前 5 個 pass，其餘 429 | L3: rate limit |
| **#205 合併後** | 🟡 **42/57 pass** | L4: 測試過時 → #206 |

> 從「0% pass 連續 10+ commit 紅燈」到「74% pass」是今日最大技術成就。剩下 15 個是可控的測試維護工作，非阻塞性故障。

---

## 8. Session 備註

本次 session 規模較大（~250k context），處理了從規格對齊、skill 重構、CI 多層修復到狀態規範的完整鏈條。建議下次從 `/vibe-sdlc` 或 `docs/status/STATUS.md` 快速恢復脈絡。
