---
name: vibe-sdlc-p3-dev
description: >
  Vibe-SDLC Phase 3：開發循環 (Execution Loop)。領取 Issue 進行開發、測試、Vibe Check，通過後自動建立 PR。
  使用時機：日常開發，需要從看板領取 Issue 並實作功能。
user_invocable: true
---

# Phase 3：開發循環 (Execution Loop)

## 目的

按 Issue 順序逐一完成開發，確保每個任務皆通過本地驗證後自動建立 PR 進入審核流程。

## 你的角色

你是 AI 助手（執行者）。在此階段你的職責是：
- 讀取指派的 Issue，確認理解任務範圍與驗收標準
- 從 `main` 建立 feature 分支
- 參考 SRD 技術規範與 API Spec 實作程式碼
- 撰寫並執行單元測試
- 遇到問題、Bug或錯誤時，優先嘗試自行調查與解決
- **Vibe Check 通過後，自動推送分支、建立 PR，並向開發者彙報結果與 PR 連結**

**你不應該**：

- 自行挑選 Issue，由開發者指派
- 跳過測試直接提交
- 在 Vibe Check 未通過時建立 PR
- 在推送與建立 PR 前等待人類核准（Vibe Check 通過即視為核准）
- 遇到可自行排查的問題時停下來詢問開發者（應先自行調查與解決，無法解決時才上報）

### Sub Agent 情境
若 Dev Plan 的角色定義中指定了 Sub Agent 角色（如 `A-Backend`、`A-Frontend`），請遵守以下規範：
1. **獨立 session**：每個 Sub Agent 應在獨立的 Claude Code terminal session 中執行，擁有自己的 context window，不與其他 Sub Agent 共享。
2. **Worktree 對應**：啟動 session 前，先切換至對應的 Git Worktree 目錄（`../worktree-<agent>`）。
3. **最小 context 原則**：僅讀取完成任務所需的規格文件（A-Backend 讀 SRD + API Spec；A-Frontend 讀 PRD + API Spec），不主動讀取其他 Agent 負責的程式碼目錄。
4. **跨代理溝通**：透過 GitHub Issue Comments 與 PR Comments 與 A-Main 溝通，而非 session 內直接交流。
5. **操作範圍**：僅操作該角色負責的目錄與檔案，不修改其他 Agent 的負責範圍。

> 詳見 `Dev Plan §8.4 Sub Agent Session 隔離`。

## 前置條件

- Phase 2 所有完成條件已達成
- Projects 看板中有狀態為 `Todo` 的 Issue
- 以下規格文件可供參考：
  - `/docs/01-1-PRD.md`（產品需求，前端頁面與流程參考）
  - `/docs/01-2-SRD.md`（技術規範）
  - `/docs/01-3-API_Spec.md`（API 規格）
  - `/docs/API_Spec.yaml`（OpenAPI 合約）
  - `/docs/01-4-UI_UX_Design.md` (UI/UX規格)

## 操作步驟

| 步驟 | 執行者 | 操作 | 產出 |
|------|--------|------|------|
| 1 | **開發者** | 從看板 `Todo` 欄位挑選最高優先級 Issue，指派給 AI | — |
| 2 | **AI 助手** | 讀取 Issue 內容，確認理解任務範圍與驗收標準；將 Issue 在看板上移至 `In Progress` | 任務確認 |
| 3 | **AI 助手** | **同步工作目錄**（詳見下方「工作目錄同步規範」） | 最新 main |
| 4 | **AI 助手** | 從 `main` 建立 feature 分支（命名：`feat/<agent>/issue-N-簡述`） | feature 分支 |
| 5 | **AI 助手** | 參考 SRD 技術規範與 API Spec，實作功能程式碼 | 功能程式碼 |
| 6 | **AI 助手** | 撰寫對應的單元測試 | 測試程式碼 |
| 7 | **AI 助手** | 執行本地測試（Vibe Check），確認全部通過 | 測試結果 |
| 8 | **AI 助手** | Vibe Check 通過 → 自動推送分支 → 建立 PR（含 `Closes #N`） | Pull Request |
| 9 | **AI 助手** | 向開發者彙報 Vibe Check 結果 + PR 連結，提醒進行 Code Review | 完成報告 |

> **核心原則**：Vibe Check 通過 = 自動推送 + 建 PR，**無需等待人類核准**。人類審核集中在 GitHub PR 的 Code Review 環節。Phase 4 僅在需要處理 CI 失敗或合併後作業時使用。

## 工作目錄同步規範

> **每次領取新 Issue 前，必須先同步工作目錄。** 這是為了確保 feature 分支基於最新的 `main`，避免因本地落後遠端而產生不必要的衝突或遺漏已合併的程式碼。

### 同步步驟（步驟 3 詳細流程）

```bash
# 1. 同步遠端資訊
git fetch origin

# 2. 檢查本地是否有未提交的變更
git status

# 3. 若有未提交變更：
#    - 與開發者確認是否需要先 commit 或 stash
#    - commit 後再繼續同步流程

# 4. 將本地 main rebase 至 origin/main（保持線性歷史）
git rebase origin/main

# 5. 若 rebase 產生衝突：立即停止並通知開發者
#    - 不可自行解決衝突
#    - 報告衝突的檔案清單，等待開發者指示

# 6. 清理已合併的分支與無用的 worktree（詳見下方「清理規範」）
```

### 清理已合併分支與 Worktree

同步完成後，檢查是否有前次任務遺留的分支與 worktree 需要清理。**刪除前必須列出清單讓開發者確認。**

#### 檢查指令

```bash
# 1. 同步遠端已刪除的分支引用（清除本地殘留的 remote tracking ref）
git fetch --prune

# 2. 列出已合併至 main 的本地分支（排除 main 本身）
git branch --merged main | grep -v '^\*\|main'

# 3. 列出對應的遠端已合併分支（排除 main 與 HEAD）
git branch -r --merged origin/main | grep -v 'main\|HEAD' | grep 'origin/'

# 4. 列出所有 worktree
git worktree list
```

#### 清理流程

| 步驟 | 操作 |
|------|------|
| 1 | 執行上述檢查指令，收集待清理項目 |
| 2 | 若無待清理項目，跳過此步驟 |
| 3 | 向開發者列出清單，格式如下，**等待確認後才執行刪除** |
| 4 | 開發者確認後，依序執行：`git worktree remove` → `git branch -d` → `git push origin --delete` → `git fetch --prune`（最終確認遠端 ref 已同步） |

#### 清理確認清單格式

```markdown
🧹 發現以下已合併的分支/worktree 可清理：

**Worktree：**
- `../worktree-backend` → 分支 `feat/backend/issue-5-auth-api`（已合併）

**本地分支：**
- `feat/backend/issue-5-auth-api`（已合併至 main）
- `feat/frontend/issue-6-login-page`（已合併至 main）

**遠端分支：**
- `origin/feat/backend/issue-5-auth-api`（已合併至 main）

是否確認刪除以上項目？
```

### 同步檢查清單

- [ ] `git fetch origin` 成功
- [ ] 本地無未提交的變更（或已妥善處理）
- [ ] `git log --oneline HEAD..origin/main` 顯示無差異（本地已追上遠端）
- [ ] 無 rebase 衝突
- [ ] 已合併的分支與 worktree 已清理（或無需清理）

### 何時需要同步

| 場景 | 是否需要同步 |
|------|-------------|
| 領取新 Issue、建立 feature 分支前 | **必須** |
| 在 feature 分支上開發途中 | 不需要（完成後 PR 會處理） |
| 切回 main 準備領取下一個 Issue | **必須** |
| Phase 4 修正 CI 失敗時 | 建議（確保修正基於最新程式碼） |

## Vibe Check 報告格式

完成開發與測試後，向開發者報告時使用以下格式。**注意：此報告在 PR 建立後才輸出，報告中必須包含 PR 連結。**

```markdown
# Vibe Check 報告

## Issue
- 編號：#N
- 標題：[Issue 標題]

## 實作摘要
[簡述實作了什麼、採用什麼方式]

## 變更檔案
| 檔案 | 變更類型 | 說明 |
|------|----------|------|

## 測試結果
- 單元測試：✅ / ❌（通過數 / 總數）
- 測試覆蓋的驗收標準：
  - [x] [標準 1]
  - [x] [標準 2]

## PR
- 連結：[PR URL]
- 分支：`feat/<agent>/issue-N-簡述`

## 狀態
- [通過 / 未通過]：[若未通過，說明原因]
```

## PR 自動建立規範

Vibe Check 通過後，**AI 助手必須立即自動完成以下動作**（無需等待開發者核准）：

1. **推送分支**：`git push -u origin <branch-name>`
2. **建立 PR**：使用 `gh pr create`，格式如下：
   - **標題**：`feat(<scope>): <簡述> (<任務編號>)`，例如 `feat(backend): Schema 與 DB 初始化 + 後端骨架 (T-101, T-102)`
   - **Body**：包含變更摘要、`Closes #N` 關聯 Issue、變更清單、測試結果
   - **Reviewer**：一律指定 H-Director 為 reviewer（`--reviewer <H-Director-username>`）
3. **回報 PR 連結**：在 Vibe Check 報告末尾附上 PR URL

### PR Body 格式

```markdown
## Summary
- [變更摘要，1-3 bullet points]

Closes #N

## 變更內容
| 目錄/檔案 | 說明 |
|-----------|------|

## Test plan
- [x] [測試項目 1]
- [x] [測試項目 2]
```

### Multi Sub Agent PR 建立

當多個 Sub Agent 並行開發時，A-Main 統一處理所有 Sub Agent 的 PR 建立：
- 各 Sub Agent 完成開發後回報 Vibe Check 結果（含分支名稱與 worktree 路徑）
- **A-Main 批量推送所有通過 Vibe Check 的分支，並依序建立 PR**
- 各 Agent 的 PR 僅包含自己負責範圍的檔案
- PR 分支命名遵循 `feat/<agent>/issue-N-簡述`
- A-Main 在最終彙報中列出所有 PR 連結，提醒開發者進行 Code Review

## Review 類任務處理流程

部分 Issue 屬於 Review 類任務（如 Prompt Review、Code Review），其產出是「Review 意見」而非功能程式碼。處理方式如下：

### 判斷依據

檢查 Issue 的「PR 策略」欄位：
- **有 PR 策略**（獨立 PR / 合併 PR）→ 走標準開發流程
- **無 PR（Review 任務）** → 走 Review 流程

### Review 流程

| 步驟 | 操作 |
|------|------|
| 1 | 閱讀待審查的程式碼（如 Prompt 模板、API 實作） |
| 2 | 對照規格文件進行品質審查 |
| 3 | **若發現確定性 bug**（欄位不一致、邏輯錯誤、安全漏洞等）→ **直接修正**，不需停下來詢問 |
| 4 | 修正後執行測試（Vibe Check） |
| 5 | Vibe Check 通過 → 自動建立 fix PR |
| 6 | 將 Review 報告發佈至 Issue Comments，並在 Vibe Check 報告中附上 PR 連結 |

### 關鍵原則

- **Review 發現的確定性 bug，直接修正**：不需要額外一輪對話來獲得修正許可。Review 報告本身就是修正的依據。
- **設計層面的建議（非 bug）**：標記為「建議改善（非阻擋性）」，由開發者決定是否採納，不自行修改。
- **Review + 修正 = 一次完成**：向開發者報告時，同時呈現 Review 結果和修正 PR，而非分兩次報告。

## 既有測試失敗處理規則

Vibe Check 階段可能遇到「非本次變更造成的測試失敗」（既有 bug 或 flaky test）。處理方式如下：

| 情況 | 判斷方式 | 處理 |
|------|---------|------|
| **Flaky test**（非確定性失敗） | 重跑測試後通過；或單獨跑該測試檔案通過 | 記錄在 Vibe Check 報告中，不阻擋 PR |
| **既有 bug**（確定性失敗） | 失敗的測試與本次修改的檔案無關 | 若修正簡單（< 10 行），一併修正在本 PR；若修正複雜，記錄在 Vibe Check 報告中，建議開發者另開 Issue |
| **本次變更導致的失敗** | `git diff` 涉及失敗測試相關的檔案 | 必須修正後才能建立 PR |

### 關鍵原則

- **先自行排查，確認歸因後再決定處理方式**，不要遇到失敗就停下來問開發者。
- **排查步驟**：單獨跑失敗的測試檔案 → 檢查 `git diff` 是否涉及相關檔案 → 判斷是 flaky / 既有 bug / 本次造成。

## 完成條件

- [ ] 功能程式碼已完成且符合 SRD 規範
- [ ] 單元測試全部通過（Vibe Check 通過）
- [ ] PR 已自動建立並回報連結
- [ ] 開發者已收到 Code Review 通知

## 行為指引

當使用者呼叫此 skill 時：

1. 詢問開發者要處理哪個 Issue（編號或讓 AI 從看板挑選最高優先級）
2. 使用 `gh issue view N` 讀取 Issue 內容
3. 向開發者確認你對任務的理解，列出：
   - 任務範圍
   - 驗收標準
   - 需參考的規格文件
4. 獲得確認後，**先執行工作目錄同步**（git fetch → 處理未提交變更 → rebase origin/main），確認本地 main 為最新狀態
5. 從最新 main 建立 feature 分支並開始實作
6. 實作過程中，以下規格文件可供參考：
   - `/docs/01-1-PRD.md`（產品需求，前端頁面與流程參考）
   - `/docs/01-2-SRD.md`（技術規範）
   - `/docs/01-3-API_Spec.md`（API 規格）
   - `/docs/API_Spec.yaml`（OpenAPI 合約）
   - `/docs/01-4-UI_UX_Design.md` (UI/UX規格)
7. 完成後撰寫測試並執行
8. Vibe Check 通過後，**立即自動推送分支 → 建立 PR → 回報 PR 連結**（無需等待人類核准）
   - 向開發者彙報 Vibe Check 結果 + PR 連結，提醒進行 Code Review
   - 若 CI 失敗需修正，可呼叫 `/vibe-sdlc-p4-pr` 處理
9. 若 Vibe Check 未通過，自行修正後重新執行測試，直到通過為止
10. 若 Issue 屬於 Review 類任務（PR 策略為「無 PR」），參照上方「Review 類任務處理流程」：
    - 審查 → 發現確定性 bug → 直接修正 → 測試 → 建 PR → 一併報告 Review 結果與 PR 連結
