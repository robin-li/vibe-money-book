---
name: vibe-sdlc-pr
description: >
  Vibe-SDLC Phase 4：CI 監控、失敗修正與合併後作業。處理 CI 結果、修正失敗、Merge 後更新 Dev Plan。
  使用時機：PR 已建立（由 Phase 3 自動建立），需要監控 CI、處理失敗、或執行合併後作業。
user_invocable: true
---

# Phase 4：CI 監控與合併後作業 (CI/CD Gates)

## 目的

監控 PR 的 CI 結果，處理失敗修正，並在合併後執行 Dev Plan 更新與驗證提醒。

> **注意**：PR 的建立已在 Phase 3 中自動完成。Phase 4 聚焦於 CI 監控、失敗修正與合併後作業。

## 你的角色

你是 AI 助手（執行者）。在此階段你的職責是：
- 監控 CI 執行結果
- 若 CI 失敗，根據錯誤報告修正程式碼並重新提交
- Merge 後更新 `02-Dev_Plan.md` 標記任務完成
- 提醒開發者相關的手動驗證 Issues

**你不應該**：
- 自行 Merge PR，由開發者執行
- 跳過 CI 失敗不處理

## 前置條件

- Phase 3 已完成，PR 已建立（由 Phase 3 自動推送與建立）
- PR 正在等待 CI 結果或開發者 Code Review
- 若需修正 CI 失敗，建議先同步工作目錄（參見 P3「工作目錄同步規範」），確保修正基於最新程式碼

## 操作步驟

| 步驟 | 執行者 | 操作 | 產出 |
|------|--------|------|------|
| 1 | **AI 助手** | 使用 `gh pr checks` 監控 CI 結果 | CI 狀態報告 |
| 2a | *CI 通過* | **AI 助手** 通知開發者可進行 Code Review | — |
| 2b | *CI 失敗* | **AI 助手** 讀取失敗報告，分析原因，修正程式碼，**確認 PR 仍為 OPEN 後**推送新 commit | 修正 commit |
|    |           | → 回到步驟 1，GitHub 重新執行 CI | — |
| 2c | *CI 環境問題* | 若單元測試（Backend/Frontend CI）通過，但 E2E 因**環境配置問題**（非代碼問題）失敗，標註為已知環境問題，建議開發者合併（詳見「已知 CI 環境問題處理」） | — |
| 3 | **開發者** | Code Review，核准後點擊 Merge | Merge commit |
| 4 | **GitHub** | 觸發 CD pipeline（如已配置） | 部署 |
| 5 | **AI 助手** | 合併後作業（詳見「合併後作業清單」） | — |

### Merge 後 Issue Comment

PR 合併後，**AI 助手必須**在對應 Issue 發佈完成 Comment：

```markdown
🎉 **任務完成**
- **PR**：#{PR_NUMBER}（已合併）
- **Dev Plan**：已更新為 `[x] Completed`
- **待驗證**：{列出相關驗證 Issues，若無則寫「無」}
```

### 合併後作業清單

PR 合併後，**AI 助手必須依序執行**：

1. **同步 main 並回到快照分支**（**不對 dev/main-agent rebase**）：
   ```bash
   git fetch origin
   git checkout main && git pull origin main
   git checkout dev/main-agent && git reset --hard origin/dev/main-agent
   ```

   > `dev/main-agent` 的歷史由 `/vibe-sdlc-status` 管理，這裡只對齊遠端。**禁止** rebase 或 force push。

2. **清理已合併分支**（依分支類型不同處理）：
   - **若合併的是 feature 分支** (`feat/<agent>/issue-N-簡述`)：刪除本地與遠端分支
     ```bash
     git branch -d feat/<agent>/issue-N-簡述
     git push origin --delete feat/<agent>/issue-N-簡述
     ```
   - **若合併的是 `chore/main-agent/*`**：同樣刪除本地與遠端分支
     ```bash
     git branch -d chore/main-agent/<date>-<簡述>
     git push origin --delete chore/main-agent/<date>-<簡述>
     ```
   - **`dev/main-agent` 不會出現在合併路徑上**（不再承接工作 PR）
3. **更新 Dev Plan**：將對應任務標記為 `[x] Completed`
4. **更新看板狀態**：標記 Issue 為 `Done`
5. **發佈完成 Comment**：含 PR 連結與 Dev Plan 更新
6. **更新 Agent 狀態檔**：將已完成任務從「當前任務」移除，更新「近期待辦」
7. **彙整 STATUS.md**：呼叫 `/vibe-sdlc-status` 彙整全局現況至 `/docs/status/STATUS.md`
8. **TG 推播完成通知**：若有設定 TG 推播，發送 `✅ {agent} #{N} 完成，PR #{M} 已合併`
9. **提示規格文件同步**：若 PR 涉及 API/行為變更（詳見「規格文件同步觸發條件」）
10. **詢問是否重建部署**：「PR 已合併，是否重建部署？」
11. **提醒驗證 Issues**：若有對應的手動驗證 Issues
12. **里程碑收尾判斷**：檢查當前里程碑是否所有 Issues（開發 + 驗證）皆已關閉，若是則執行「里程碑收尾作業」

### 已知 CI 環境問題處理

若 CI 失敗的原因為**環境配置問題**（非代碼邏輯錯誤），AI 可標註為已知問題並建議合併：

**判斷標準**：

| 條件 | 判定 |
|------|------|
| Backend CI ✅ + Frontend CI ✅ + E2E ❌（環境錯誤如 DB URL、Docker 配置） | 已知環境問題，可合併 |
| Backend CI ❌ 或 Frontend CI ❌ | **代碼問題，必須修正** |
| E2E ❌ 且錯誤訊息涉及業務邏輯（assertion failed、element not found 等） | **代碼問題，必須修正** |

**環境問題特徵**（常見）：
- `Prisma schema validation` / `P1012` 錯誤
- `ECONNREFUSED` / 服務未啟動
- Docker image build 失敗（非 Dockerfile 錯誤）
- Timeout 在等待服務就緒

**處理方式**：向開發者報告 CI 狀態，標註「E2E 因環境問題失敗（非代碼問題），Backend + Frontend 單元測試全部通過」，建議合併。

### 規格文件同步觸發條件

PR 合併後，若涉及以下改動，AI 應提示開發者是否需要同步更新規格文件：

| 改動類型 | 是否提示更新 | 對應規格文件 |
|----------|-------------|-------------|
| 新增 API endpoint | **必須提示** | API Spec (md + yaml) |
| API 行為或欄位變更 | **必須提示** | API Spec (md + yaml) |
| UI 流程或頁面調整 | 建議提示 | PRD |
| 資料模型變更 | 建議提示 | SRD |
| 基礎設施修正（nginx、timeout） | 不需要 | — |
| 依賴升級、config 調整 | 不需要 | — |

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

## 追加 Commit 至既有 PR 的安全檢查

> **⚠️ 重要：向已有 PR 的分支推送新 commit 前，必須先確認 PR 仍為 OPEN。已合併的 PR 不會包含後續推送的 commit。**

若需對已建立 PR 的分支追加 commit（例如修正 CI 失敗、回應 Code Review 意見），**必須**在推送前執行：

```bash
# 檢查 PR 狀態
gh pr view <PR-NUMBER> -R <OWNER>/<REPO> --json state -q '.state'
```

| PR 狀態 | 處理方式 |
|---------|---------|
| `OPEN` | 正常推送至該分支，commit 會自動加入 PR |
| `MERGED` | **禁止推送至該分支**。必須從最新 `main` 建立新分支、建立新 PR |
| `CLOSED` | 確認是否需要重新開啟，或建立新分支與新 PR |

## Multi Sub Agent PR 流程

當 Dev Plan 採用多 Sub Agent 並行開發時，PR 流程擴展為雙層審查：

### 分支命名規範

Sub Agent 建立的分支必須遵循：`feat/<agent>/issue-N-簡述`

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
| A-DevOps | `.github/**`, `docker/**`, `Dockerfile`, `docker-compose.yml` |
| A-Main | 全專案 (整合用) |

### 合併衝突處理

- 同一並行群組內的 PR 依完成先後合併，無強制順序。
- 合併後若其他 PR 產生衝突，由 **A-Main** 負責 rebase 解決。
- Sub Agent **不得** 自行解決跨目錄衝突。

## 里程碑收尾作業

當合併後作業第 12 步判定**當前里程碑所有 Issues（開發 + 驗證）皆已關閉**時，AI 應在該次合併後作業中一併執行以下收尾：

### 里程碑完成確認報告

```markdown
# 里程碑完成確認報告

## 里程碑資訊
- 里程碑：M[N] - [名稱]
- 完成日期：[日期]

## 任務完成狀態
| Issue | 標題 | 狀態 | 合併日期 |
|-------|------|------|----------|

## Dev Plan 對應狀態
- 總任務數：N
- 已完成：N
- 未完成：0

## 部署狀態
- 測試環境：[已部署 / 未部署]
- 部署版本：[版本號或 commit hash]
```

### 規格文件盤點

盤點本輪迭代中**所有已合併 PR**（含議題收集選項 1 透過 `chore/main-agent/*` 提交的小改動），檢查是否有遺漏的規格文件更新：

1. 列出本輪迭代已合併的所有 PR
2. 檢查是否有涉及 API endpoint 新增/變更、UI 流程調整、資料模型變更
3. 比對規格文件是否已同步更新
4. 若有遺漏，列出清單提醒開發者確認後補充

> **注意**：基礎設施修正（nginx config、timeout 調整）不需要更新規格文件。

### 引導下一步

根據專案狀態引導開發者：

| 條件 | 引導 |
|------|------|
| 有部署環境（docker-compose 或 CI/CD 配置） | 進入 Phase 5（`/vibe-sdlc-release`）— 完整流程：回饋收集 → Release 發佈 → 迭代規劃 |
| 無部署環境（純規範 / Library 專案） | 進入 Phase 5 快速模式（`/vibe-sdlc-release`）— 直接問：是否發佈 Release？有無回饋？ |
| 開發者選擇跳過 | 直接回 Phase 2（`/vibe-sdlc-issues`）— 繼續下一輪迭代 |

## 完成條件

- [ ] CI 全部通過（綠燈）
- [ ] 開發者 Code Review 核准
- [ ] PR 已合併至 `main`
- [ ] Dev Plan 對應任務已標記完成
- [ ] 若為里程碑最後一個 Issue：里程碑完成報告已產出、規格盤點已完成

## 行為指引

當使用者呼叫此 skill 時：

1. 先確認前置條件：
   - 是否有已建立的 open PR？（由 Phase 3 自動建立）
   - 若無 open PR，提示使用者先完成 Phase 3（`/vibe-sdlc-dev`）
2. 列出所有 open PR，使用 `gh pr list` 查看
3. 監控 CI 結果：
   - 使用 `gh pr checks <PR-number>` 查看 CI 狀態
   - CI 通過：通知開發者可進行 Code Review
   - CI 失敗：讀取失敗報告，分析原因，修正程式碼
   - **推送前必須確認 PR 狀態**：`gh pr view <PR-number> --json state -q '.state'`
     - `OPEN` → 正常推送
     - `MERGED` → 禁止推送，從最新 main 建新分支與新 PR
     - `CLOSED` → 確認是否需重新開啟或建新 PR
4. 開發者 Merge 後：
   - **先同步 main 與快照分支**（**不對 dev/main-agent rebase / force push**）：`git fetch origin && git checkout main && git pull origin main && git checkout dev/main-agent && git reset --hard origin/dev/main-agent`
   - **若合併的是 feature 分支**：刪除本地與遠端的 feature 分支
   - **若合併的是 `chore/main-agent/*`**：同樣刪除本地與遠端分支
   - **PR 合併後 HEAD 收尾**：依 `/vibe-sdlc-dev` 的「PR 合併後的 HEAD 收尾檢查」執行 `git branch --show-current`，若停在 main 則立刻切回 `dev/main-agent`
   - 讀取 `/docs/02-Dev_Plan.md`
   - 找到對應任務，將 `- [ ]` 改為 `- [x]`
   - 提交更新並推送
5. 更新 Issue 狀態：
   - 更新看板狀態為 `Done`（或以可行的方式標註）
   - 在 Issue 發佈「🎉 任務完成」Comment（含 PR 編號、Dev Plan 更新確認、待驗證 Issues 清單）
6. 檢查該任務是否有對應的手動驗證 Issues（標籤 `verification`，標題以 `[驗證] T-{ID}` 開頭）：
   - 若有：提醒開發者通知對應的審查角色（H-Reviewer / H-UxReviewer）開始驗證
   - 列出相關驗證 Issues 的編號與標題
7. 提示開發者：
   - 若還有待處理的開發 Issue → 回到 Phase 3（`/vibe-sdlc-dev`）
   - 若當前里程碑的開發 Issues 已全部完成，但仍有未關閉的驗證 Issues → 提醒等待驗證完成
   - 若當前里程碑所有 Issues（開發 + 驗證）皆已關閉 → 執行「里程碑收尾作業」（產出里程碑完成報告 + 規格盤點 + 引導下一步）
