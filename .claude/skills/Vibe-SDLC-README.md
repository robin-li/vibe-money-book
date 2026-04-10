# Vibe-SDLC Skills for Claude Code

> 將 Vibe-SDLC 流程封裝為 Claude Code 的 **Slash Command Skills**，讓 AI 助手在開發過程中依階段引導你完成整個軟體開發生命週期。

---

## 概述

Vibe-SDLC Skills 是一組可直接在 [Claude Code](https://claude.ai/code) 中呼叫的 Slash Command，對應 Vibe-SDLC 的五個開發階段。每個 skill 內建了：

- **角色定義**：AI 助手在該階段的職責與限制
- **操作步驟**：按步驟引導的標準作業流程
- **報告模板**：審查報告、Vibe Check、PR 等標準格式
- **前置 / 完成條件**：確保流程不被跳過

---

## 快速開始 (Quick Start)

只需 3 步，即可在你的專案中啟用 Vibe-SDLC 流程：

### Step 1：安裝 Skills

```bash
# 下載（若尚未 clone）
git clone https://github.com/anthropics/vibe-sdlc.git
cd vibe-sdlc

# 一鍵全域安裝（所有專案皆可使用）
./install.sh global
```

> 也可選擇安裝至單一專案：`./install.sh project /path/to/my-project`
> 詳見下方「安裝方式」章節。

### Step 2：初始化專案

在你的專案目錄中開啟 Claude Code，輸入：

```
/vibe-sdlc
```

AI 會自動偵測專案狀態，產出進度儀表板並建議下一步。若為全新專案，會引導你進入 Phase 1。

### Step 3：開始開發

依照 AI 的引導，按階段推進：

```
/vibe-sdlc-spec       ← 撰寫規格文件（PRD、SRD、SDD、API Spec、Dev Plan）
/vibe-sdlc-issues     ← 將計畫轉為 GitHub Issues
/vibe-sdlc-dev        ← 領取 Issue → 開發 → 測試 → 自動建 PR
/vibe-sdlc-pr         ← 監控 CI → 修正失敗 → Merge 後更新進度
/vibe-sdlc-release    ← 收集回饋 → Release 發佈 → 啟動下一輪迭代
/vibe-sdlc-status     ← 查詢 Agent 狀態 → 彙整 STATUS.md
```

**最小可行範例**（從想法到第一個 PR）：

```
你：/vibe-sdlc-spec
    我要做一個個人記帳App，請與我討論並幫我撰寫 PRD。
    ... （AI 協助完成所有規格文件）

你：/vibe-sdlc-issues
    規格定稿了，請建立 GitHub Issues。

你：/vibe-sdlc-dev
    請處理 Issue #1。
    ... （AI 自動完成開發、測試、建立 PR）
```

### 前置需求

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI（已安裝並登入）
- [GitHub CLI (`gh`)](https://cli.github.com/)（已安裝並認證：`gh auth login`）
- 專案使用 GitHub 作為版本管理平台

---

## Skills 一覽

| Slash Command | 階段 | 用途 |
|---------------|------|------|
| `/vibe-sdlc` | — | 進度儀表板（里程碑進度、待審 PR、待驗證 Issue）+ Phase 導航 |
| `/vibe-sdlc-spec` | Phase 1：定義規格文件與計畫 | 撰寫 / 審查 PRD、SRD、SDD、API Spec、Dev Plan，產出完整性審查報告 |
| `/vibe-sdlc-issues` | Phase 2：任務掛載 | 依 Dev Plan 建立 GitHub Issues，建立 Project 看板 |
| `/vibe-sdlc-dev` | Phase 3：開發循環 | 領取 Issue → 實作 → 測試 → Vibe Check → 自動建 PR |
| `/vibe-sdlc-pr` | Phase 4：CI 監控與合併後作業 | 監控 CI → 修正失敗 → Merge 後更新 Dev Plan |
| `/vibe-sdlc-release` | Phase 5：回饋收集、Release 與迭代 | 收集回饋 → Release 發佈 → 啟動下一輪迭代 |
| `/vibe-sdlc-status` | Agent 狀態查詢與彙整 | 查詢 Agent 狀態 → 彙整 STATUS.md → 異常提醒 |
| `/local-tunnel` | — | 發佈本地前後端服務至公網，供遠端裝置測試 |

---

## 典型工作流程

```
專案啟動
  └→ /vibe-sdlc-spec        撰寫規格 → 交叉比對審查 → 定稿
      └→ /vibe-sdlc-issues      審核計畫 → 建立 GitHub Issues
          └→ /vibe-sdlc-dev          領取 Issue → 開發 → Vibe Check → 自動建 PR
              └→ /vibe-sdlc-pr           監控 CI → 修正失敗 → Merge → 更新 Dev Plan
                  └→ /vibe-sdlc-dev          領取下一個 Issue ...（重複）
                      └→ ...
                          └→ /vibe-sdlc-release  回饋收集 → Release → 迭代
                              └→ /vibe-sdlc-issues  下一輪迭代
```

---

## 各 Phase 詳細說明

### Phase 1：定義規格文件與計畫 (`/vibe-sdlc-spec`)

建立專案的 **Single Source of Truth**。

- **空專案初始化 (Bootstrap)**：若偵測到 `/docs` 目錄不存在或完全沒有規格文件，skill 會先顯示初始化面板（依 L1 git repo / L2 remote / L3 基礎檔 / L3.5 CLAUDE.md / L4 docs / L5 Docs Index 的偵測結果勾選），使用者可選擇「全部執行」「只建 docs 骨架」「逐項確認」或「跳過」。CLAUDE.md 由 `templates/CLAUDE.md.template` 互動式填入專案名稱與一句話描述，已有的 CLAUDE.md 則提議 append「## Vibe-SDLC 流程」區塊（不覆寫）。GitHub remote 以 A/B/C 三選項處理：A 由 AI 代為執行 `gh repo create`（需互動確認 repo 名稱、owner、可見性）、B 輸出完整手動指令、C 先跳過。
- **交付物**：
  - Docs Index (`00-Docs_Index.md`)：文件入口與導航
  - PRD (`01-1-PRD.md`)：產品需求文件，偏重產品面或客戶的需求
  - SRD (`01-2-SRD.md`)：系統需求文件，偏重技術棧、安全及性能要求
  - SDD (`01-3-SDD.md`)：系統設計文件，架構設計、模組設計、資料庫設計等（從 SRD 分離）
  - GDD (`01-4-GDD.md`)：遊戲設計文件（領域選用，遊戲類專案適用）
  - API Spec (`01-5-API_Spec.md` + `API_Spec.yaml`)：API 介面規格說明與 OpenAPI 合約
  - UI/UX 設計文件 (`01-6-UI_UX_Design.md`)：視覺與互動設計規格（選用；撰寫前必須先讀 `references/UI_UX_Writing_Guidelines.md`）
  - UI Wireframe (`ui/{page}.html`)：每個頁面一檔的 HTML + Tailwind CDN 視覺參考（選用；低保真灰階，由 markdown 規格以 link 引用）
  - Dev Plan (`02-Dev_Plan.md`)：里程碑、任務拆解、依賴關係
  - 審查報告 (`03-Docs_Review_Report.md`)：交叉比對結果、不一致與遺漏項目
  - CI/CD 規格 (`04-CI_CD_Spec.md`)：CI Workflow 定義、品質閘門、Docker 部署配置（選用，複雜專案建議獨立）
- **AI 職責**：協助撰寫與優化規格、交叉比對所有規格文件找出不一致或遺漏、產出完整性審查報告
- **UI/UX 撰寫準則**：若建立 `01-6-UI_UX_Design.md`，AI **必須**先讀 `references/UI_UX_Writing_Guidelines.md`，遵循 9 條準則——結構分層、Mermaid 流程圖、語意描述（不用純方位）、狀態完整列舉、表單欄位結構化、呈現與顯示邏輯分離、避免「如圖所示」、指名元件庫、**HTML + Tailwind wireframe**（§9）與**元件層級 anchor**（§9.6）。markdown 規格書為實作權威，HTML wireframe 為視覺輔助
- **Dev Plan 格式**：角色定義（Role Registry）、里程碑 Gantt、任務清單（含 AI Sessions / HRH 工作量估算）、任務詳細描述、並行群組視覺化（Mermaid）、技術棧、風險、Vibe Check 計畫、溝通協作
- **Dev Plan 設計原則**：
  - CI/CD 時序原則：CI Workflow 必須在 M1 建立，正確依賴鏈為 `骨架任務 → CI 任務 → 功能開發任務`
  - Bootstrap PR 規則：CI 建立前的初始化 PR 由 H-Director 直接審查合併
  - 手動驗證任務：`👁️ 手動` 驗證項應建立獨立 Issue，指派給對應審查角色
  - 同 Agent 多任務合併：同一並行群組中同 Agent 的多個無依賴任務應合併為一個 PR
- **Multi Sub Agent 協作規範**（Dev Plan 必含）：Worktree 使用（每 Sub Agent 獨立 Worktree）、分支命名 `feat/<agent>/<issue-N>-<簡述>`、雙層 PR 審查（A-Main 初審 → H-Director 終審）、PR 範圍限制、Bootstrap 階段特殊處理
- **版本修訂記錄**：所有規格文件皆須包含版本號（`v{major}.{minor}`）、最後更新日期、版本修訂說明表格；每次修改時必須同步更新
- **完成條件**：規格文件皆已提交至 `/docs`、所有規格文件皆包含版本修訂記錄、審查報告無未解決項目、開發計畫合理可行、開發者確認定稿
- **參考範例**：`vibe-sdlc-spec/examples/docs/`

### Phase 2：任務掛載 (`/vibe-sdlc-issues`)

將 Dev Plan 轉換為 **可追蹤的 GitHub Issues**，並建立 Project 看板。

- **AI 職責**：確認 P1 審查報告通過 → 建立 Labels 與 Milestones → 依里程碑建立開發 Issues → 掃描 `👁️ 手動` 驗證項建立驗證 Issues → 建立 Project 看板
- **Issue 包含**：任務描述、任務編號（對應 Dev Plan）、主要步驟、驗收標準、技術參考、依賴關係、PR 策略、優先級（P0–P3）與里程碑標籤
- **手動驗證 Issue**：每個 `👁️ 手動` 驗證項建立獨立 Issue，指派給對應審查角色（H-UxReviewer / H-Reviewer / H-Director）
- **Issue 生命週期**：開發任務由 PR `Closes #N` 自動關閉；手動驗證由審查者附驗證結果後關閉；驗收門由 H-Director 關閉
- **GitHub Project 看板**：建立後必須使用 `gh project link` 連結至 Repo
- **完成條件**：所有開發任務與驗證 Issues 皆已建立、Labels / Milestones 就緒、Projects 看板已連結至 Repo

### Phase 3：開發循環 (`/vibe-sdlc-dev`)

按 Issue 逐一完成開發，Vibe Check 通過後**自動建立 PR**。

- **AI 職責**：同步工作目錄 → 領取 Issue（發佈 Issue Comment）→ 建立對應分支 → 實作 → 撰寫測試 → 遇到問題優先自行調查與解決 → Vibe Check 通過後**立即自動推送並建立 PR** → 發佈完成 Comment → 彙報結果與 PR 連結
- **Issue 狀態追蹤**：Issue 是跨 session 的唯一溝通媒介。領取任務時必須發佈「🚀 任務領取」Comment（含角色、分支、worktree）；遇阻塞或重要進度時發佈「📋 進度更新」Comment；Vibe Check 通過後發佈「✅ Vibe Check 通過」Comment（含 PR 連結）
- **工作目錄同步**：每次領取新 Issue 前，必須先 `git fetch --prune` → 處理未提交變更 → `git rebase origin/main`，確保 feature 分支基於最新 main；同步後檢查是否有已合併的分支與 worktree 需要清理（自動排除受保護分支），列出清單讓開發者確認後才刪除
- **分支策略**：⛔ 嚴禁直接 push main。有 Issue → `feat/<agent>/issue-N-簡述`；無 Issue 小修 → `chore/main-agent/<YYYYMMDD>-<簡述>`（短命分支，PR 合併後刪除）。`dev/main-agent` 是 A-Main 的快照分支，由 `/vibe-sdlc-status` 管理，**不承接任何工作 commit**
- **PR 自動建立**：Vibe Check 通過即自動推送分支、建立 PR（含 `Closes #N`、遵循 P4 定義的 PR 格式規範）、回報 PR 連結，**無需等待人類核准**。人類審核集中在 GitHub PR Code Review 環節
- **追加 Commit 安全檢查**：向已有 PR 的分支推送新 commit 前，必須先用 `gh pr view` 確認 PR 仍為 OPEN；若已 MERGED 則禁止推送，須從最新 main 建新分支與新 PR
- **Review 類任務**：若 Issue 的 PR 策略為「無 PR（Review 任務）」，則走 Review 流程：審查 → 發現確定性 bug 直接修正 → 測試 → 建 fix PR → 一併報告 Review 結果與 PR 連結。設計層面的建議標記為「非阻擋性」，由開發者決定
- **既有測試失敗處理**：Vibe Check 時若遇到非本次變更造成的測試失敗，先自行排查歸因（flaky test / 既有 bug / 本次造成），再決定處理方式（記錄 / 一併修正 / 另開 Issue）
- **自主排查原則**：遇到問題、Bug 或錯誤時，優先嘗試自行調查與解決，無法解決時才上報開發者
- **Sub Agent 情境**：每個 Sub Agent 獨立 session、獨立 Worktree、最小 context 原則（僅讀取任務所需規格）、跨代理透過 GitHub Issue Comments 溝通、操作範圍限於負責目錄；A-Main 統一批量推送與建立 PR
- **完成條件**：功能程式碼完成、Vibe Check 通過、PR 已自動建立並回報連結

### Phase 4：CI 監控與合併後作業 (`/vibe-sdlc-pr`)

監控 PR 的 CI 結果，處理失敗修正，並在合併後執行後續作業。

> **注意**：PR 的建立已在 Phase 3 中自動完成。Phase 4 僅在需要處理 CI 失敗或 Merge 後作業時使用。

- **AI 職責**：監控 CI 結果、CI 失敗時**確認 PR 仍為 OPEN 後**修正程式碼並重新提交、Merge 後同步工作目錄並更新 Dev Plan 後推送、更新看板狀態並發佈「🎉 任務完成」Issue Comment、彙整 STATUS.md、提醒手動驗證
- **PR 狀態安全檢查**：推送修正 commit 前必須用 `gh pr view` 確認 PR 為 OPEN；若已 MERGED 則從最新 main 建新分支與新 PR
- **Merge 後 Issue Comment**：在對應 Issue 發佈完成 Comment（含 PR 編號、Dev Plan 更新確認、待驗證 Issues 清單）
- **Merge 後狀態彙整**：更新各 Agent 狀態檔 → 呼叫 `/vibe-sdlc-status` 彙整 `/docs/status/STATUS.md` → TG 推播完成通知（若有設定）
- **Multi Sub Agent 雙層審查**：Sub Agent 提交 PR → GitHub CI 自動檢查 → A-Main 初審（確認 PR 範圍僅限負責目錄）→ H-Director 終審 & Merge；合併衝突由 A-Main 負責 rebase 解決
- **手動驗證提醒**：Merge 後若該任務有對應的 `verification` Issue，提醒開發者通知審查角色開始驗證
- **里程碑收尾**：當里程碑所有 Issues 皆已關閉時，自動產出里程碑完成報告、規格文件盤點，並引導進入 Phase 5
- **完成條件**：CI 綠燈、Code Review 核准、PR 合併、Dev Plan 更新並推送、Issue 完成 Comment 已發佈；若為里程碑最後 Issue 則需完成收尾作業

### Phase 5：回饋收集、Release 與迭代 (`/vibe-sdlc-release`)

里程碑收尾完成後的**回饋收集、Release 發佈與迭代規劃**。

- **前置條件**：Phase 4 已完成里程碑收尾作業
- **運作模式**：有部署環境 → 完整模式（回饋收集 → Release → 迭代規劃）；無部署環境 → 快速模式（直接 Release + 回饋）
- **AI 職責**：整理回饋、根據指示更新規格文件、引導 GitHub Release 發佈、引導回 Phase 2 啟動下一輪迭代
- **驗收問題處理**：複用「議題收集與處置流程」（選項 1～5），不另起獨立流程
- **完成條件**：回饋已反映至規格文件（若有）、所有被修改的規格文件皆已更新版本修訂記錄、GitHub Release 已發佈（若選擇發佈）

### Agent 狀態查詢與彙整 (`/vibe-sdlc-status`)

提供**單一入口掌握所有 Agent 的工作狀態**與專案全局現況。

- **狀態檔架構**：每個 Agent 維護自己的狀態檔（`/docs/status/A-*.md`），A-Main 彙整至 `/docs/status/STATUS.md`
- **無衝突設計**：各 Agent 只寫自己的檔案，避免多 Agent 並行時的寫入衝突
- **彙整內容**：里程碑進度、各 Agent 當前任務與狀態、注意事項、近期待辦、最近動態
- **異常提醒**：狀態檔超時未更新、Agent 無法繼續（🔴）、阻塞鏈偵測
- **觸發時機**：手動呼叫、`/vibe-sdlc` 儀表板引用、PR 合併後自動觸發
- **版控策略**：專案必須從下列三種模式中選定一種並寫入 `CLAUDE.md`：
  - **A 全版控** — `docs/status/**` 全 commit，約定獨立 commit 不混用（適合多人協作）
  - **B 全忽略** — `.gitignore` 加入 `docs/status/`，純本地快照（適合單人單機）
  - **C 混合**（推薦預設）— 僅 `STATUS.md` 進版控、`A-*.md` 忽略（適合單人多機）
  - 若 `CLAUDE.md` 未宣告，A-Main 首次執行 `/vibe-sdlc-status` 時會**主動詢問**並協助配置

---

## 安裝方式

### 一鍵安裝（推薦）

使用安裝腳本，支援互動式選擇或直接指定模式：

```bash
# 互動式安裝（會引導你選擇安裝模式）
./install.sh

# 全域安裝 — 所有專案皆可使用
./install.sh global

# 安裝至指定專案
./install.sh project /path/to/my-project

# 安裝至指定專案並提交 Git（團隊共享）
./install.sh shared /path/to/my-project
```

### 手動安裝

Claude Code 的 skills 要求每個 skill 為獨立子目錄，內含 `skill.md`。支援三種部署位置：

**全域部署**（所有專案可用）：

```bash
cp -r skills/vibe-sdlc* ~/.claude/skills/
```

**專案層級部署**（僅限特定專案）：

```bash
mkdir -p /path/to/my-project/.claude/skills
cp -r skills/vibe-sdlc* /path/to/my-project/.claude/skills/
```

**共享部署**（團隊共用，納入版本控制）：

```bash
mkdir -p /path/to/my-project/.claude/skills
cp -r skills/vibe-sdlc* /path/to/my-project/.claude/skills/
cd /path/to/my-project
git add .claude/skills/vibe-sdlc*/
git commit -m "Add Vibe-SDLC skills for AI-assisted development workflow"
```

### 驗證安裝

部署後在 Claude Code 中輸入 `/vibe-sdlc`，若看到流程總覽表示成功。

---

## 目錄結構

```
.claude/skills/
├── Vibe-SDLC-README.md              ← 本說明文件
├── local-tunnel/
│   └── skill.md                     ← 發佈本地服務至公網（ngrok / Cloudflare Tunnel）
├── vibe-sdlc/
│   └── skill.md                     ← 總覽與導航
├── vibe-sdlc-spec/
│   ├── skill.md                     ← Phase 1：定義規格文件與計畫
│   ├── templates/
│   │   └── CLAUDE.md.template       ← 新專案 CLAUDE.md 骨架（空專案初始化用）
│   ├── references/
│   │   ├── multi-account-setup.md   ← 多帳號協作配置指南
│   │   └── UI_UX_Writing_Guidelines.md ← UI/UX 規格撰寫 9 條準則
│   └── examples/docs/               ← 規格文件範例
│       ├── 00-Docs_Index.md         ← 文件入口與導航
│       ├── 01-1-PRD.md              ← 產品需求文件範例
│       ├── 01-2-SRD.md              ← 系統需求文件範例
│       ├── 01-3-SDD.md              ← 系統設計文件範例
│       ├── 01-4-GDD.md              ← 遊戲設計文件範例（領域選用）
│       ├── 01-5-API_Spec.md         ← API 介面規格範例
│       ├── 01-6-UI_UX_Design.md     ← UI/UX 設計文件範例
│       ├── ui/                      ← HTML wireframe 視覺參考範例
│       │   ├── home.html            ← 首頁 wireframe
│       │   ├── stats.html           ← 統計頁 wireframe
│       │   ├── history.html         ← 記錄頁 wireframe
│       │   ├── settings.html        ← 設定頁 wireframe
│       │   ├── login.html           ← 登入頁 wireframe
│       │   └── register.html        ← 註冊頁 wireframe
│       ├── 02-Dev_Plan.md           ← 開發計畫範例
│       ├── 03-Docs_Review_Report.md ← 規格審查報告範例
│       ├── 04-CI_CD_Spec.md         ← CI/CD 規格文件範例
│       └── API_Spec.yaml            ← OpenAPI 合約範例
├── vibe-sdlc-issues/
│   └── skill.md                     ← Phase 2：任務掛載
├── vibe-sdlc-dev/
│   └── skill.md                     ← Phase 3：開發循環
├── vibe-sdlc-pr/
│   └── skill.md                     ← Phase 4：CI 監控與合併後作業
├── vibe-sdlc-release/
│   └── skill.md                     ← Phase 5：回饋收集、Release 與迭代
└── vibe-sdlc-status/
    └── skill.md                     ← Agent 狀態查詢與彙整
```

---

## 使用範例

以下展示開發者（導演）在各階段如何下 prompt 與 AI 助手互動。

### 場景一：查看專案進度 — 進度儀表板

```
> /vibe-sdlc
```

AI 會自動收集 GitHub Issues、PR、CI 狀態等數據，產出**進度儀表板**，包含：
- 各里程碑完成進度（進度條 + 百分比）
- 待審 PR 與 CI 狀態
- 進行中 Issue 與待驗證 Issue
- 最近合併的 PR
- 判斷當前 Phase 並給出具體建議

適合在每天開工前、不確定下一步該做什麼時使用。

---

### 場景二：Phase 1 — 撰寫規格文件

**從零開始撰寫 PRD：**

```
> /vibe-sdlc-spec
> 我要開發一個 Todo List API，支援 CRUD 操作，使用者需登入才能存取自己的待辦事項。
> 請幫我撰寫 PRD。
```

**已有規格，請求交叉審查：**

```
> /vibe-sdlc-spec
> 我已經把 PRD、SRD、API Spec、Dev Plan 都放在 /docs 下了，請進行交叉比對審查。
```

**針對審查結果修正：**

```
> 審查報告第 3 項提到 SRD 缺少 rate limiting 規格，請幫我補上，
> 限制為每個使用者每分鐘 60 次請求。
```

---

### 場景三：Phase 2 — 建立 GitHub Issues

**審核 Dev Plan 並建立 Issues（審查報告通過後）：**

```
> /vibe-sdlc-issues
> 規格已經定稿了，審查報告也確認無誤，請幫我建立 GitHub Issues。
```

**只建立特定里程碑的 Issues：**

```
> /vibe-sdlc-issues
> 先只建 Milestone 1 的 Issues 就好，M2 之後的等 M1 完成再說。
```

---

### 場景四：Phase 3 — 日常開發循環

**指派 Issue 給 AI 開發：**

```
> /vibe-sdlc-dev
> 請處理 Issue #5，實作使用者註冊 API。
```

AI 完成開發與測試後，Vibe Check 通過會**立即自動推送分支並建立 PR**，然後向你彙報結果與 PR 連結。開發過程中遇到問題會優先自行排查與解決，無法解決時才上報。你只需在 GitHub 上進行 Code Review。

**若 AI 開發過程中你想追加需求：**

```
> 追加一個測試案例：當 email 格式不正確時應回傳 400 Bad Request。
```

**若你在 Code Review 中發現問題：**

```
> 密碼雜湊請改用 bcrypt，不要用 SHA-256。修正後重新推送。
```

---

### 場景五：Phase 4 — CI 監控與合併後作業

**CI 失敗時（PR 已由 Phase 3 自動建立）：**

```
> /vibe-sdlc-pr
> CI 掛了，這是錯誤報告：[貼上 CI 錯誤訊息]
> 請分析原因並修正。
```

**Merge 後更新進度：**

```
> PR 已經 merge 了，請更新 Dev Plan 的任務狀態。
> 看板上還有 Issue 嗎？有的話繼續處理下一個。
```

---

### 場景六：Phase 5 — 里程碑交付

**確認里程碑完成狀態：**

```
> /vibe-sdlc-release
> M1 的所有 Issue 應該都 merge 了，請確認一下並產出完成報告。
```

**提供回饋並啟動下一輪迭代：**

```
> 測試環境跑過了，有幾個回饋：
> 1. 列表頁需要分頁功能（新需求）
> 2. 刪除操作應改為軟刪除（需求變更）
> 3. 登入頁的文案不好看（暫不處理）
> 請幫我整理並更新 PRD 和 Dev Plan。
```

---

### 場景七：測試/驗收中回報 Bug 或新增需求 — 議題收集與處置流程

當你在開發、測試或驗收過程中**直接描述 Bug、新需求或改善建議**時（例如「XX 壞了」「我想要 XX」），AI 會立刻停下、不動任何檔案，先給你 5 個處理選項。這是 Vibe-SDLC 的核心機制（核心原則第 6 條），會在 Phase 3、4、5 任何階段被觸發。

**情境：M1 驗收期間發現問題與新需求**

```
> 我剛在測試環境試了註冊流程，發現密碼長度只檢核到 6 碼，應該至少 8 碼。
> 另外列表頁載入有點慢，希望加上分頁功能。
```

```
📋 Issue 追蹤選項
─────────────────
您回報了：
  - [Bug] 密碼長度檢核應從 6 碼提升至 8 碼
  - [Feature] 列表頁加入分頁功能

請選擇處理方式：
  1️⃣  小問題，直接修正（不建 Issue）
  2️⃣  建立 Issue 後立即修正
  3️⃣  先記下來，待會一起建立 Issues
  4️⃣  議題收集完成，彙整成 Issues 並開始開發
  5️⃣  議題收集完成，彙整成 Issues 並等待指示

請選擇（1/2/3/4/5）：
```

**選項對應指南**：

| 你的回報內容 | 建議選項 | AI 行為 |
|---|:---:|---|
| Typo、文案微調、簡單 config | **1** | 在 `chore/main-agent/<date>-*` 短命分支修正並提 PR |
| 單一 Bug 或單一需求要立即處理 | **2** | 建 Issue → 立即進入 P3 開發 → 自動建 PR |
| 一連串回饋要先收集 | **3** | 暫存清單，等你說「整理回報」再批量建立 |
| 確認的清單要立刻全部開做 | **4** | 批量建 Issues → 立即依優先序開發 |
| 確認的清單要先 review 優先級 | **5** | 批量建 Issues → 停下等指示 |

**選項 4 範例對話（驗收後一次性處理多項回饋）：**

```
> 4
> 第 1 項是 P0 Bug 要進 M1，第 2 項是新需求進 M2 backlog。
```

AI 會逐一確認每筆 Issue 的標題、Labels、Milestone，批量執行 `gh issue create`，接著直接領取 P0 Issue 進入 Phase 3 開發循環。若回報內容涉及 PRD / API Spec 變更，AI 會在處理完成後**即時回溯更新**對應規格文件並升版（核心原則第 4、5 條）。

> 💡 **何時不會觸發**：透過 `/vibe-sdlc-dev` 領取既有 Issue、純粹的程式碼問答、或你明確說「直接改」「快速修一下」時，AI 會直接執行不再詢問。

---

### 場景八：Multi Sub Agent 並行開發

**讓 AI 產生含 Git 協作策略的 Dev Plan：**

```
> /vibe-sdlc-spec
> Dev Plan 請採用 Multi Sub Agent 架構，包含 A-Backend、A-Frontend、A-QA、A-DevOps，
> 並依照規範加入 Worktree 配置與雙層 PR 審查流程。
```

**Sub Agent 的 Vibe Check 通過後自動建 PR：**

```
> /vibe-sdlc-dev
> 我是 A-Backend，請處理 Issue #12，實作 Auth API。
（AI 完成開發 → Vibe Check → 自動建 PR）
```

**A-Main 監控 CI 並協調合併：**

```
> /vibe-sdlc-pr
> PR #34 的 CI 已通過，A-Main 初審確認範圍正確（僅修改 /backend/**），
> 請 H-Director 進行終審。
```

---

### 提示技巧

| 技巧 | 說明 | 範例 |
|------|------|------|
| **明確指派** | 告訴 AI 處理哪個 Issue | `請處理 Issue #12` |
| **給定約束** | 指定技術選型或限制 | `使用 PostgreSQL，不要用 SQLite` |
| **分段操作** | 一次只做一個階段 | `先只審核 Dev Plan，不要建 Issues` |
| **引用規格** | 指向特定文件章節 | `參考 SRD 3.2 節的安全要求` |
| **附上上下文** | 貼上錯誤訊息或截圖 | `CI 報錯了：[錯誤訊息]` |
| **批次確認** | 一次核准多項操作 | `審查報告的建議全部接受，請一次修正` |

---

## 相關資源

- [Claude Code 官方文件](https://docs.anthropic.com/en/docs/claude-code)：Claude Code CLI 使用說明
- [GitHub CLI (`gh`)](https://cli.github.com/)：Phase 2~4 操作 GitHub 所需的 CLI 工具
