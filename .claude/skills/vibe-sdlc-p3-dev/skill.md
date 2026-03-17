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
- 向開發者報告 Vibe Check 結果
- **Vibe Check 通過後，自動推送分支並建立 PR**

**你不應該**：
- 自行挑選 Issue，由開發者指派
- 跳過測試直接提交
- 在 Vibe Check 未通過時建立 PR

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
| 7 | **AI 助手** | 執行本地測試，確認全部通過 | 測試結果 |
| 8 | **AI 助手** | 向開發者報告本地驗證結果（Vibe Check），含 PR 預覽 | 驗證報告 |
| 9 | **開發者** | 審閱 Vibe Check 結果，核准或駁回 | 核准 / 駁回 |
| — | *若駁回* | **開發者**指出問題，回到步驟 5 修正 | — |
| 10 | **AI 助手** | 核准後自動：推送分支 → 建立 PR（含 `Closes #N`） → 回報 PR 連結 | Pull Request |
| 11 | **AI 助手** | 提醒開發者進行 Code Review，或等待 CI 結果 | — |

> **關鍵變更**：Vibe Check 通過後，AI 自動完成「推送 + 建 PR」，無需額外呼叫 `/vibe-sdlc-p4-pr`。Phase 4 僅在需要處理 CI 失敗或 PR 後續作業時使用。

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
```

### 同步檢查清單

- [ ] `git fetch origin` 成功
- [ ] 本地無未提交的變更（或已妥善處理）
- [ ] `git log --oneline HEAD..origin/main` 顯示無差異（本地已追上遠端）
- [ ] 無 rebase 衝突

### 何時需要同步

| 場景 | 是否需要同步 |
|------|-------------|
| 領取新 Issue、建立 feature 分支前 | **必須** |
| 在 feature 分支上開發途中 | 不需要（完成後 PR 會處理） |
| 切回 main 準備領取下一個 Issue | **必須** |
| Phase 4 修正 CI 失敗時 | 建議（確保修正基於最新程式碼） |

## Vibe Check 報告格式

完成開發與測試後，向開發者報告時使用以下格式：

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

## 分支資訊
- 分支名稱：`feat/<agent>/issue-N-簡述`
- commit 數量：N

## 狀態
- [通過 / 未通過]：[若未通過，說明原因]
```

## PR 自動建立規範

Vibe Check 通過且開發者核准後，**AI 助手必須自動完成以下動作**（無需開發者額外指示）：

1. **推送分支**：`git push -u origin <branch-name>`
2. **建立 PR**：使用 `gh pr create`，格式如下：
   - **標題**：`feat(<scope>): <簡述> (<任務編號>)`，例如 `feat(backend): Schema 與 DB 初始化 + 後端骨架 (T-101, T-102)`
   - **Body**：包含變更摘要、`Closes #N` 關聯 Issue、變更清單、測試結果
   - **Reviewer**：
     - **Bootstrap 階段**（CI 尚未建立時）：直接指定 H-Director 為 reviewer（`--reviewer <H-Director-username>`）
     - **標準流程**（CI 已就緒時）：等 CI 通過後由 A-Main 指定 reviewer
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

當多個 Sub Agent 並行開發時，每個 Agent 在自己的 Vibe Check 通過後**獨立建立 PR**：
- 各 Agent 的 PR 僅包含自己負責範圍的檔案
- PR 分支命名遵循 `feat/<agent>/issue-N-簡述`
- A-Main 在 Vibe Check 報告中彙整所有 Sub Agent 的結果，核准後**批量推送與建立 PR**

## 完成條件

- [ ] 功能程式碼已完成且符合 SRD 規範
- [ ] 單元測試全部通過
- [ ] 開發者已核准 Vibe Check 結果
- [ ] PR 已建立並回報連結

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
8. 產出 Vibe Check 報告，等待開發者審閱
9. **若開發者核准**：自動推送分支 → 建立 PR → 回報 PR 連結
   - 提醒開發者進行 Code Review 或等待 CI 結果
   - 若 CI 失敗需修正，可呼叫 `/vibe-sdlc-p4-pr` 處理
10. 若開發者駁回，根據反饋修正後重新報告
