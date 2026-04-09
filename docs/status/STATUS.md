# 專案現況

> **更新時間**：2026-04-09 19:40 (UTC+8)
> **彙整者**：A-Main
> **專案**：robin-li/vibe-money-book
> **當前分支**：`dev/main-agent`（與 `origin/main` 同步）
> **最新 commit**：`5cbfaa8` fix(ci): correct DATABASE_URL in .env.example to PostgreSQL (#202)

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
| **全 Repo Issues** | ██████████ | **114/117 (97%)** | 3 open |

**目前無進行中的里程碑**，待規劃 M8 或處理 on-hold/新發現議題。

---

## 2. Agent 狀態（單 Agent 模式）

| Agent | 狀態 | 當前任務 | 備註 |
|-------|------|---------|------|
| A-Main | ⚪ idle | — | M7 已收尾，本日完成規格/技能/CI 同步工作後進入閒置 |

> **單 Agent 模式**：本專案僅有 robin-li 一人擔任 H-Director + AI 助手雙角色，無需 Sub Agents 並行協作，A-Main 即代表整個 AI 執行端。

---

## 3. 注意事項

### ❌ 需追蹤的 Bug
- **#203 [Bug] E2E：文字記帳流程因 CI 缺 LLM API key 而 timeout**（P2，今日新建）
  - 起因：PR #202 修復 DATABASE_URL 後，CI E2E 第一層障礙清除，暴露第二層問題
  - 影響：main 分支 E2E job 仍紅燈，無法作為 merge gate
  - 三個方案待選：(A) Mock LLM Provider、(B) GitHub Secrets 設真實 key、(C) `test.skip()` 暫跳過

### 💡 on-hold 議題（無急迫性）
- **#172 [Enhancement] 提升 AI 分類準確度**（更強模型 + 前端二次確認） — 標 `on-hold`
- **#162 [Bug] AI 語義查詢在大量交易時失敗**（OpenAI 回傳空結果） — 標 `on-hold`

### ⚠️ 規格文件待補（從 PR #200 遞延）
- `docs/00-Docs_Index.md`（新版 vibe-sdlc-spec 要求的文件入口索引）
- `docs/01-3-SDD.md`（系統設計文件，需從 SRD/Dev Plan 內容拆出）
- 已知遺留，待後續迭代補上

---

## 4. 近期待辦

- [ ] #203 處理 E2E 測試 LLM key 缺失問題（決定方案 A/B/C）
- [ ] 規劃 M8 或解封 on-hold 議題
- [ ] 補建 `docs/00-Docs_Index.md` 與 `docs/01-3-SDD.md`

---

## 5. 最近動態（今日 2026-04-09）

| PR | 標題 | 合併時間 |
|----|------|---------|
| ✅ #202 | fix(ci): correct DATABASE_URL in .env.example to PostgreSQL | 2026-04-09 19:37 (UTC+8) |
| ✅ #201 | chore(skills): restructure vibe-sdlc skill suite (drop pN- prefix) | 2026-04-09 15:43 |
| ✅ #200 | docs: align spec file naming with updated vibe-sdlc-spec | 2026-04-09 15:43 |

### 本日完成的工作摘要

1. **規格文件對齊新版 vibe-sdlc-spec**（PR #200）
   - `01-3-API_Spec.md` → `01-5-API_Spec.md`（git rename，99% 相似度）
   - `01-4-UI_UX_Design.md` → `01-6-UI_UX_Design.md`（98%）
   - 5 份文件版本號 minor +1，內含 30+ 處引用同步更新
   - 歷史快照（worklog/、03 審查報告 v3.0）刻意保留原狀

2. **`.claude/skills/` 重構**（PR #201）
   - 6 個 phase skill 從 `vibe-sdlc-pN-{name}` 改名為 `vibe-sdlc-{name}`（去掉 phase 前綴）
   - 新增 `vibe-sdlc-status` skill
   - 範例文件擴充：`00-Docs_Index`、`01-3-SDD`、`01-4-GDD`

3. **CI E2E 第一層障礙修復**（PR #202）
   - `.env.example` 的 `DATABASE_URL` 從過時 SQLite 改為 PostgreSQL
   - 修復了 main 從 2026-03-26 起連續 10+ commit 的紅燈成因
   - 暴露第二層 LLM key 問題 → 開立 #203 追蹤

4. **環境清理**
   - 本地清掉 8 個已合併 feature 分支
   - 遠端清掉 5 個 stale 分支
   - 分支引用從 16 個減為 7 個

---

## 6. 部署現況（本機）

| 項目 | 狀態 |
|------|------|
| 🐳 Docker | 🔴 未運行（daemon 未啟動） |
| 🔗 Cloudflare Tunnel | 🟡 cloudflared 進程運行中（PID 684），但後端不在故公網回 502 |
| 🌐 公網端點 | `moneybook.smart-codings.com` → 502 / `moneybook-api.smart-codings.com/health` → 502 |
| 🏷 最新 release tag | `v1.4.3` |

> **建議**：若不需對外服務，可 `kill 684` 收掉 Tunnel；若要恢復，需先啟動 Docker 再執行 `scripts/start.sh`。

---

## 7. CI 狀態

| 分支 | Backend CI | Frontend CI | E2E Tests |
|------|-----------|-------------|-----------|
| main (`5cbfaa8`) | ✅ pass | ✅ pass | ❌ fail（LLM key timeout，#203 追蹤中） |

> ⚠️ 注意：main 上 E2E 自 2026-03-26 起即為紅燈狀態，PR #202 已將失敗點從「backend 啟動失敗」推進到「Playwright 測試 LLM 服務 timeout」，但仍未恢復綠燈。預期 #203 解決後才會真正綠回來。
