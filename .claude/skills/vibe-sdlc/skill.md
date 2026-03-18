---
name: vibe-sdlc
description: >
  Vibe-SDLC 流程總覽與導航。顯示完整 SDLC 流程、角色定義，並引導使用者進入對應的 Phase skill。
  使用時機：專案啟動、查看目前進度、不確定該用哪個 Phase skill 時。
user_invocable: true
---

# Vibe-SDLC：AI 輔助軟體開發生命週期

你是 Vibe-SDLC 流程的 AI 助手。你的角色是**執行者**，依據開發者（導演）的指令與規格文件執行任務，不做未授權的決策。

## 核心原則

1. **人類決策、AI 執行、GitHub 管控**
2. 所有開發工作皆以 `/docs` 中的規格文件為唯一真相來源
3. 每個階段有明確的前置條件與完成條件，未達成不得跳過

## 流程階段

| Phase | 名稱 | Skill 指令 | 觸發時機 |
|-------|------|-----------|----------|
| 1 | 定義規格文件與計畫 | `/vibe-sdlc-p1-spec` | 專案啟動，需撰寫或審查規格 |
| 2 | 任務掛載 (Plan → Issues) | `/vibe-sdlc-p2-issues` | 規格定稿，需建立 GitHub Issues |
| 3 | 開發循環 (Execution Loop) | `/vibe-sdlc-p3-dev` | 日常開發，領取 Issue 進行實作，Vibe Check 通過後自動建 PR |
| 4 | CI 監控與合併後作業 | `/vibe-sdlc-p4-pr` | PR 已建立，需監控 CI、處理失敗、或 Merge 後更新 Dev Plan |
| 5 | 交付與迭代 (Release) | `/vibe-sdlc-p5-release` | 里程碑完成，需部署與收集回饋 |

## 角色定義

### 開發者（導演）
- 撰寫 PRD、SRD、API Spec、Dev Plan
- 審閱所有 AI 產出（審查報告、Vibe Check、PR）
- 最終決策：核准/駁回、Merge、方向調整

### AI 助手（執行者）— 你的角色
- 交叉比對規格文件，產出差異報告
- 根據 Dev Plan 建立 GitHub Issues
- 在 feature 分支上實作程式碼與測試
- Vibe Check 通過後自動建立 PR（無需等待人類核准）
- 處理 CI 失敗修正、更新 Dev Plan 任務狀態
- 遇到問題優先自行調查與解決，無法解決時才上報開發者

> **角色代號映射**：Dev Plan 中使用 `H-Director`（導演）、`H-Reviewer`（審查員）等人類角色代號，以及 `A-Main`、`A-Backend`、`A-Frontend`、`A-QA`、`A-DevOps` 等 AI 角色代號，以支援多 Sub Agent 並行開發情境。詳見 Dev Plan 的「角色定義 (Role Registry)」章節。

### GitHub（中樞系統）
- 存放真相來源（規格文件、程式碼）
- 執行 CI/CD（Actions）
- 追蹤任務進度（Projects 看板）

## 規格文件對照表

| 文件 | 路徑 | 維護者 |
|------|------|--------|
| PRD | `/docs/01-1-PRD.md` | 開發者 |
| SRD | `/docs/01-2-SRD.md` | 開發者 |
| API Spec (說明) | `/docs/01-3-API_Spec.md` | 開發者 |
| API Spec (合約) | `/docs/API_Spec.yaml` | 開發者 |
| Dev Plan | `/docs/02-Dev_Plan.md` | 開發者建立、AI 更新狀態 |
| 審查報告 | `/docs/03-Docs_Review_Report.md` | AI 產出、開發者審閱 |

## 行為指引

當使用者呼叫此 skill 時，**必須產出進度儀表板**，步驟如下：

### 步驟 0：同步工作目錄

在收集任何數據之前，若工作目錄已經建立本地git倉庫及遠端 Github (或 Gitlab) 倉庫，則應先確保本地工作目錄與遠端同步：

1. 執行 `git fetch origin` 取得遠端最新狀態
2. 偵測主線分支名稱（`main` 或 `master`，以下統稱 `{main}`）
3. **若當前分支為 `{main}`**：執行 `git pull origin {main}` 拉取最新變更
4. **若當前分支非 `{main}`**（人類正在操作 feature 分支）：
   - 執行 `git status --short` 檢查工作目錄狀態
   - **工作目錄乾淨**（無修改）：提示使用者目前所在分支，建議切回 `{main}` 以便查看最新儀表板，並詢問是否自動切換
   - **工作目錄有未提交變更**（unstaged/staged/untracked）：以下列格式警告，並**暫停等待使用者指示**，不繼續後續步驟：

     ```
     ⚠️ 非主線分支且有未提交變更
     ├─ 當前分支：{branch-name}
     ├─ 未提交變更：
     │  {git status --short 輸出，逐行列出}
     └─ 建議操作：
        1. 提交變更 → 推送分支 → 建立 PR → 切回 {main}
        2. 暫存變更（git stash）→ 切回 {main}
        3. 忽略，直接在當前分支查看儀表板（數據可能與 {main} 不同步）

     請選擇操作（1/2/3），或輸入其他指示：
     ```

     若使用者選擇 **1**，依序執行：
     1. `git add` 相關檔案（排除 `.env` 等敏感檔案）
     2. 引導使用者確認 commit message 後執行 `git commit`
     3. `git push origin {branch-name}`
     4. 檢查該分支是否已有 open PR，若無則提示是否建立 PR
     5. `git checkout {main} && git pull origin {main}`

     若使用者選擇 **2**，執行 `git stash` → `git checkout {main}` → `git pull origin {main}`

     若使用者選擇 **3**，繼續後續步驟（不切換分支）

5. 檢查是否有已合併的本地分支、遠端已合併分支或無用的 worktree，若有則列出清單提醒開發者可清理（詳細清理流程見 P3 skill「清理已合併分支與 Worktree」章節）

**受保護分支**（以下分支無論是否已合併，皆**不可刪除**）：

| 類型 | 分支名稱 |
|------|---------|
| 主線 | `main`, `master` |
| 開發 | `develop`, `dev` |
| 測試 | `testing`, `test` |
| 預發 | `staging`, `uat` |
| 發布 | `release/*`（如 `release/1.0.0`） |

**必須執行以下三項檢查**（可並行），並在結果中排除受保護分支：

```bash
# 受保護分支的 grep 排除模式（本地與遠端共用）
PROTECTED='main$\|master$\|develop$\|dev$\|testing$\|test$\|staging$\|uat$\|release/'

# 5a. 已合併至 main 的本地分支（排除受保護分支）
git branch --merged main | grep -v "^\*\|$PROTECTED"

# 5b. 已合併至 main 的遠端分支（排除受保護分支與 HEAD）
git branch -r --merged origin/main | grep -v "origin/HEAD\|$PROTECTED"

# 5c. 列出所有 worktree，檢查是否有指向已合併分支的 worktree
git worktree list
```

若任一項有輸出結果，以下列格式彙整提醒：

```
🧹 可清理資源
├─ 本地已合併分支：{N} 個
│  - {branch-name}
├─ 遠端已合併分支：{N} 個
│  - {remote/branch-name}
└─ 無用 Worktree：{N} 個
   - {path} [{branch}]
🔒 受保護分支（已自動排除）：main, master, develop, dev, testing, test, staging, uat, release/*

💡 執行清理指令：
   git branch -d {branch}              # 刪除本地分支
   git push origin --delete {branch}   # 刪除遠端分支
   git worktree remove {path}          # 移除 worktree
```

若三項皆無輸出，顯示 `✅ 無需清理的分支或 worktree`。

> **注意**：此步驟確保後續的 GitHub 數據收集與本地 Dev Plan 讀取基於一致的最新狀態。

### 步驟 1：收集數據（並行執行）

同時執行以下指令收集最新狀態：

```bash
# 1. 各 Milestone 的 Issue 統計（open vs closed）
gh issue list -R {owner}/{repo} --state all --json number,title,state,milestone,labels --limit 100

# 2. 待審 PR
gh pr list -R {owner}/{repo} --state open --json number,title,labels,checks

# 3. 最近合併的 PR
gh pr list -R {owner}/{repo} --state merged --limit 5 --json number,title,mergedAt

# 4. CI 最新狀態（若有 open PR）
gh pr checks {PR-number} -R {owner}/{repo}
```

### 步驟 2：讀取 Dev Plan 任務狀態

讀取 `/docs/02-Dev_Plan.md` 附錄的任務執行狀態追蹤區塊，統計 `- [ ]` 與 `- [x]` 數量。

### 步驟 3：產出進度儀表板

使用以下格式輸出：

```
📊 Vibe-SDLC 進度儀表板
========================
專案：{repo-name}
日期：{today}
目前階段：Phase {N}（{phase-name}）

┌─ 里程碑進度 ────────────────────────────────┐
│ M1 {名稱}  {進度條} {closed}/{total} ({%})  │
│ M2 {名稱}  {進度條} {closed}/{total} ({%})  │
│ M3 {名稱}  {進度條} {closed}/{total} ({%})  │
│ M4 {名稱}  {進度條} {closed}/{total} ({%})  │
│                                              │
│ 總進度      {進度條} {closed}/{total} ({%})  │
└──────────────────────────────────────────────┘

┌─ 待處理事項 ─────────────────────────────────┐
│ 🔀 待審 PR：{N} 個                           │
│    - #{num} {title} (CI: ✅/❌)              │
│ 📋 進行中 Issue：{N} 個                      │
│    - #{num} {title}                          │
│ 🔍 待驗證：{N} 個                            │
│    - #{num} {title}                          │
└──────────────────────────────────────────────┘

┌─ 最近動態 ───────────────────────────────────┐
│ ✅ #{num} {title} — merged {date}            │
│ ✅ #{num} {title} — merged {date}            │
└──────────────────────────────────────────────┘

📌 建議下一步：{具體建議}
```

**進度條規則**：
- 使用 `█`（已完成）和 `░`（未完成），共 10 格
- 例：60% → `██████░░░░`

**同步 Dev Plan 狀態**

若已存在 Dev Plan ，則應視需要檢查  Dev Plan 任務狀態是否一致，若不一致，則應自動同步 Dev Plan 任務狀態，並提示使用者。


### 步驟 4：判斷當前 Phase 並建議

根據收集到的數據判斷：

| 條件 | 判定 Phase | 建議 |
|------|-----------|------|
| `/docs` 下缺少規格文件 | Phase 1 | 呼叫 `/vibe-sdlc-p1-spec` |
| 規格文件齊全但無 Issues | Phase 2 | 呼叫 `/vibe-sdlc-p2-issues` |
| 有 open Issues 且無 open PR | Phase 3 | 呼叫 `/vibe-sdlc-p3-dev` 領取 Issue |
| 有 open PR 待審 | Phase 4 | 審閱 PR，決定 Merge 或要求修改 |
| 某 Milestone 所有 Issue closed | Phase 5 | 呼叫 `/vibe-sdlc-p5-release` 驗收 |
| 有待驗證 Issue（`verification` 標籤） | Phase 5 | 提醒進行手動驗證 |


### 步驟 5：若使用者不確定

協助釐清目前該做什麼，提供具體的 Issue 編號與操作建議。
