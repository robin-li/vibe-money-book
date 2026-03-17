---
name: vibe-sdlc-p4-pr
description: >
  Vibe-SDLC Phase 4：自動化驗證與合併 (CI/CD Gates)。推送程式碼、建立 PR、處理 CI 結果。
  使用時機：Phase 3 Vibe Check 通過後，需要推送程式碼並建立 Pull Request。
user_invocable: true
---

# Phase 4：自動化驗證與合併 (CI/CD Gates)

## 目的

透過自動化測試與人工審閱雙重門檻，確保合併至 `main` 的程式碼符合品質標準。

## 你的角色

你是 AI 助手（執行者）。在此階段你的職責是：
- 推送程式碼至遠端
- 建立 Pull Request，撰寫變更摘要並關聯 Issue
- 若 CI 失敗，根據錯誤報告修正程式碼並重新提交
- Merge 後更新 `02-Dev_Plan.md` 標記任務完成

**你不應該**：
- 自行 Merge PR，由開發者執行
- 跳過 CI 失敗不處理
- 在未獲開發者指示的情況下推送程式碼

## 前置條件

- Phase 3 所有完成條件已達成（Vibe Check 通過）
- 目前在 feature 分支上，所有變更已 commit

## 操作步驟

| 步驟 | 執行者 | 操作 | 產出 |
|------|--------|------|------|
| 1 | **開發者** | 指示 AI 推送程式碼並建立 PR | — |
| 2 | **AI 助手** | 執行 `git push`，建立 Pull Request | Pull Request |
| 3 | **GitHub** | 自動觸發 Actions，執行 CI 檢查 | CI 報告 |
| 4a | *CI 通過* | **開發者**進行 Code Review，審閱程式碼邏輯 | Review 意見 |
| 4b | *CI 失敗* | **開發者**將 CI 報告轉交 AI | — |
| 5b | *CI 失敗* | **AI 助手**根據 CI 錯誤報告修正程式碼，推送新 commit | 修正 commit |
|    |           | → 回到步驟 3，GitHub 重新執行 CI | — |
| 5a | *Review 通過* | **開發者**點擊 Merge，合併至 `main` | Merge commit |
| 6 | **GitHub** | 觸發 CD pipeline（如已配置） | 部署 |
| 7 | **AI 助手** | 將 `02-Dev_Plan.md` 中對應任務標記為 `[x] Completed` | Dev Plan 更新 |
| 8 | **AI 助手** | 提醒開發者：若該任務有對應的手動驗證 Issues，現在可交由審查角色開始驗證 | 驗證提醒 |

## PR 格式規範

建立 PR 時，**必須**使用以下格式：

```markdown
## 變更摘要
[一段話描述本次變更的目的與內容]

## 關聯 Issue
Closes #N

## 變更清單
- [變更項目 1]
- [變更項目 2]

## 測試結果
- 單元測試：✅ 全部通過（N/N）
- 本地驗證：✅ Vibe Check 通過
```

## Multi Sub Agent PR 流程

當 Dev Plan 採用多 Sub Agent 並行開發時，PR 流程擴展為雙層審查：

### 分支命名規範

Sub Agent 建立的分支必須遵循：`feat/<agent>/<issue-N>-<簡述>`

例如：`feat/backend/issue-12-auth-api`、`feat/frontend/issue-15-login-ui`

### Worktree 使用

每個 Sub Agent 使用獨立的 Git Worktree：

```bash
git worktree add ../worktree-backend feat/backend/issue-12-auth-api
git worktree add ../worktree-frontend feat/frontend/issue-15-login-ui
```

### 雙層審查流程

| 步驟 | 執行者 | 操作 | 說明 |
|------|--------|------|------|
| 1 | **Sub Agent** | 提交 PR，標題含任務編號 | PR 範圍僅限該 Agent 負責的目錄 |
| 2 | **GitHub** | 觸發 CI | Lint、Type Check、Unit Test |
| 3 | **A-Main** | 初審 | 確認 PR 範圍正確、CI 通過、無跨目錄修改 |
| 4 | **H-Director** | 終審 & Merge | Code Review 後合併至 `main` |

### PR 範圍限制

Sub Agent 的 PR **禁止** 修改其負責範圍以外的檔案：

| Agent | 允許路徑 |
|-------|---------|
| A-Backend | `/backend/**` |
| A-Frontend | `/frontend/**` |
| A-QA | `/tests/**` |
| A-DevOps | `.github/**`, `docker/**` |
| A-Main | 全專案 (整合用) |

### 合併衝突處理

- 同一並行群組內的 PR 依完成先後合併，無強制順序。
- 合併後若其他 PR 產生衝突，由 **A-Main** 負責 rebase 解決。
- Sub Agent **不得** 自行解決跨目錄衝突。

## 完成條件

- [ ] CI 全部通過（綠燈）
- [ ] 開發者 Code Review 核准
- [ ] PR 已合併至 `main`
- [ ] Dev Plan 對應任務已標記完成

## 行為指引

當使用者呼叫此 skill 時：

1. 先確認前置條件：
   - 是否在 feature 分支上？
   - 是否有未 commit 的變更？
   - Vibe Check 是否已通過？
2. 若前置條件未滿足，提示使用者先完成 Phase 3（`/vibe-sdlc-p3-dev`）
3. 執行 `git push -u origin <branch>`
4. 使用 `gh pr create` 建立 PR，按格式規範撰寫內容
5. 等待 CI 結果：
   - 使用 `gh pr checks <PR-number>` 查看 CI 狀態
   - CI 通過：通知開發者可進行 Code Review
   - CI 失敗：讀取失敗報告，分析原因，修正後推送新 commit
6. 開發者 Merge 後：
   - 讀取 `/docs/02-Dev_Plan.md`
   - 找到對應任務，將 `- [ ]` 改為 `- [x]`
   - 提交更新
7. 檢查該任務是否有對應的手動驗證 Issues（標籤 `verification`，標題以 `[驗證] T-{ID}` 開頭）：
   - 若有：提醒開發者通知對應的審查角色（H-Reviewer / H-UxReviewer）開始驗證
   - 列出相關驗證 Issues 的編號與標題
8. 提示開發者：
   - 若還有待處理的開發 Issue → 回到 Phase 3（`/vibe-sdlc-p3-dev`）
   - 若當前里程碑的開發 Issues 已全部完成，但仍有未關閉的驗證 Issues → 提醒等待驗證完成
   - 若當前里程碑所有 Issues（開發 + 驗證）皆已關閉 → 進入 Phase 5（`/vibe-sdlc-p5-release`）
