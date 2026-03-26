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
| 2 | **AI 助手** | 讀取 Issue 內容，確認理解任務範圍與驗收標準 | 任務確認 |
| 3 | **AI 助手** | **領取 Issue**：更新看板狀態為 `In Progress`，發佈「領取 Comment」（詳見下方「Issue 狀態追蹤規範」） | Issue Comment |
| 4 | **AI 助手** | **同步工作目錄**（詳見下方「工作目錄同步規範」） | 最新 main |
| 5 | **AI 助手** | 從 `main` 建立 feature 分支（命名：`feat/<agent>/issue-N-簡述`） | feature 分支 |
| 6 | **AI 助手** | 參考 SRD 技術規範與 API Spec，實作功能程式碼 | 功能程式碼 |
| 7 | **AI 助手** | 撰寫對應的單元測試 | 測試程式碼 |
| 8 | **AI 助手** | 執行本地測試（Vibe Check），確認全部通過 | 測試結果 |
| 9 | **AI 助手** | Vibe Check 通過 → 自動推送分支 → 建立 PR（含 `Closes #N`） | Pull Request |
| 10 | **AI 助手** | 向開發者彙報 Vibe Check 結果 + PR 連結，提醒進行 Code Review | 完成報告 |

> **核心原則**：Vibe Check 通過 = 自動推送 + 建 PR，**無需等待人類核准**。人類審核集中在 GitHub PR 的 Code Review 環節。Phase 4 僅在需要處理 CI 失敗或合併後作業時使用。

## 提交與合併規則

根據修改來源與範圍，決定是否需要走 feature branch → PR 流程：

| 情境 | 提交方式 | 說明 |
|------|---------|------|
| **功能開發**（領取 Issue） | feature branch → PR | 必須走完整流程，無論改動大小 |
| **分流選項 1（直接修）且改動 ≤ 5 行** | 直接 commit + push main | 適合 typo、文案、簡單 config |
| **分流選項 1 但改動 > 5 行** | feature branch → PR | 改動較大仍需 PR 審查 |
| **聯調模式連續修正** | 累積修正後統一 commit + push main | 避免頻繁重建，統一部署 |

> **原則**：寧可多走 PR，不可漏走。若不確定，預設走 feature branch。

## 即時回報分流補充

以下為 `/vibe-sdlc` 核心原則中「即時回報分流」的補充規則：

**同一任務的迭代修正不需重複分流**：

若開發者在驗收過程中對**同一 Issue 範圍**連續回報修改（如「排除清單還不夠」→「再加幾個」），這屬於同一任務的迭代修正，不需每次都觸發分流選單。但若是**新功能或新範圍**的請求（如「改成雙軌模式」），仍須觸發分流。

**判斷標準**：
- 修正內容是否在**已領取 Issue 的範圍**內 → 不觸發
- 修正內容是否引入**新概念或新架構變更** → 觸發

## 合併後自動詢問部署

在以下時機，AI 應主動詢問是否重建部署：

- **PR 合併後**：「PR 已合併，是否重建部署？」
- **聯調模式修正 push 後**：「修正已推送，是否重建部署？」

> 若開發者之前已表達「先不部署」等意圖，則不重複詢問。

## 規格文件回溯規則

PR 合併後，若涉及以下改動，AI 應提示開發者是否需要同步更新規格文件：

| 改動類型 | 是否提示更新 | 對應規格文件 |
|----------|-------------|-------------|
| 新增 API endpoint | **必須提示** | API Spec (md + yaml) |
| API 行為或欄位變更 | **必須提示** | API Spec (md + yaml) |
| UI 流程或頁面調整 | 建議提示 | PRD |
| 資料模型變更 | 建議提示 | SRD |
| 基礎設施修正（nginx、timeout） | 不需要 | — |
| 依賴升級、config 調整 | 不需要 | — |

**提示格式**：

```
📝 本次變更涉及 {API endpoint 新增 / UI 流程調整 / ...}，是否需要同步更新規格文件？
   涉及文件：{API Spec / PRD / SRD}
```

## Issue 狀態追蹤規範

> **Issue 是跨 session 的唯一溝通媒介。** 所有角色（AI 與人類）都應能透過 Issue Comments 了解任務的最新進展，而無需進入特定的 session 或 worktree。

### 看板狀態更新

使用 GitHub CLI 更新 Project 看板的 `Status` 欄位：

```bash
# 取得 Issue 在 Project 中的 Item ID
ITEM_ID=$(gh project item-list <PROJECT_NUMBER> --owner <OWNER> --format json \
  | jq -r '.items[] | select(.content.number == <ISSUE_NUMBER>) | .id')

# 更新狀態
gh project item-edit --project-id <PROJECT_ID> --id "$ITEM_ID" --field-id <STATUS_FIELD_ID> --single-select-option-id <OPTION_ID>
```

> **提示**：若 `gh project item-edit` 操作複雜，可改用 `gh issue edit` 加 label 方式標註進度（如 `in-progress`），或直接在 Issue Comment 中說明狀態變更。選擇最簡單可行的方式即可。

### Issue Comment 規範

在以下時機**必須**發佈 Issue Comment：

#### 1. 領取任務時（步驟 3）

```markdown
🚀 **任務領取**
- **角色**：{角色代號}（如 A-Backend、A-Frontend、A-Main）
- **分支**：`feat/<agent>/issue-N-簡述`
- **Worktree**：`../worktree-<agent>`（若適用）
- **開始時間**：{YYYY-MM-DD HH:MM}
```

#### 臨時需求與規格變更處理

開發過程中若遇到以下情況，應**即時**回溯更新規格文件，而非等到迭代結束：

| 情況 | 處理方式 |
|------|---------|
| 開發者臨時新增需求 | 先回 P1 更新 PRD/SRD/API Spec（含版本修訂記錄）→ 更新 Dev Plan 新增任務 → 建立對應 Issue → 繼續開發 |
| Bug 修正導致 API 行為變更 | 更新 API Spec（md + yaml）（含版本修訂記錄）→ 在 Issue/PR 中標註規格變更 |
| 開發中發現規格遺漏或矛盾 | 在 Issue 中標記疑問 → 與開發者討論 → 確認後更新對應規格文件（含版本修訂記錄） |
| 新增未規劃的 Issue | 同步更新 Dev Plan 任務清單（含版本修訂記錄） |

> **原則**：規格文件是唯一真相來源，任何對產品行為的變更都必須反映在規格文件中，且每次修改都必須更新版本修訂記錄。

#### 2. 重要進度更新時（視情況）

當遇到以下情況時，應在 Issue 發佈進度 Comment：
- 完成重要階段（如「API 端點已實作完成，開始撰寫單元測試」）
- 遇到阻塞或需要等待其他任務（如「前端串接需等待 T-201 API 完成」）
- 發現規格疑問或需要開發者決策（應即時標記，參見「臨時需求與規格變更處理」）
- 任務範圍超出預期，需要調整

```markdown
📋 **進度更新**
- **已完成**：{已完成的項目}
- **進行中**：{目前正在做的}
- **阻塞/待處理**：{阻塞原因或待處理事項}（若無則省略）
```

#### 3. Vibe Check 完成時（步驟 9，建立 PR 後）

```markdown
✅ **Vibe Check 通過**
- **PR**：#{PR_NUMBER}
- **測試結果**：單元測試 {passed}/{total} 通過
- **備註**：{任何需要 reviewer 注意的事項}（若無則省略）
```

### 何時發佈 Comment

| 時機 | 是否必須 | Comment 類型 |
|------|---------|-------------|
| 領取任務 | **必須** | 🚀 任務領取 |
| 完成重要階段 | 建議 | 📋 進度更新 |
| 遇到阻塞 | **必須** | 📋 進度更新（含阻塞原因） |
| 發現規格疑問 | **必須** | 📋 進度更新（含問題描述） |
| Vibe Check 通過 | **必須** | ✅ Vibe Check 通過 |

### 原則

- **簡潔為主**：Comment 不需冗長，重點在於讓他人快速了解狀態
- **避免噪音**：不需要為每一行程式碼的變更發佈 Comment，僅在有意義的節點更新
- **跨 Agent 溝通**：Sub Agent 之間不直接溝通，但可透過 Issue Comment 讓 A-Main 了解進度與阻塞

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

| 場景 | 是否需要同步 | 是否切回 main |
|------|-------------|--------------|
| 領取新 Issue、建立 feature 分支前 | **必須** | **必須** |
| PR 合併後，準備下一個任務 | **必須** | **必須**（pull 最新） |
| 在 feature 分支上開發途中 | 不需要 | 不切換 |
| 聯調/驗收中連續修正 | 不需要 | 不切換（保持 feature 分支） |
| Phase 4 修正 CI 失敗時 | 建議 | 不切換（在 feature 分支修正） |
| 查看儀表板（`/vibe-sdlc`） | `git fetch` 即可 | 建議但不強制 |

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
   - **Body**：必須遵循 P4「PR 格式規範」（變更摘要 / 關聯 Issue `Closes #N` / 變更清單 / 測試結果）
   - **Reviewer**：一律指定 H-Director 為 reviewer（`--reviewer <H-Director-username>`）
3. **回報 PR 連結**：在 Vibe Check 報告末尾附上 PR URL

### 追加 Commit 至既有 PR 的安全檢查

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

### PR Body 格式

> **必須遵循 Phase 4 定義的「PR 格式規範」**（見 `/vibe-sdlc-p4-pr` skill）。

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

## 聯調模式（Integration Testing & Debugging）

當開發者在**部署後進行聯合調試**（部署 → 測試 → 發現問題 → 修正 → 重新部署）的連續循環中，每一筆回報的 Bug 或修改需求都必須先觸發「即時回報分流」機制（定義於 `/vibe-sdlc` 核心原則）。

### 聯調流程

```
部署 → 開發者測試 → 發現問題 → 回報分流（1/2/3）→ 修正 → 重新部署 → 繼續測試
                                    ↑                              ↓
                                    └──────────────────────────────┘
```

### 分流選項行為

| 選項 | 聯調中的行為 |
|------|------------|
| **1 — 直接修正** | 立即修正，修正完成後詢問是否重新部署（`docker compose up -d --build`）。適合 UI 微調、文案、簡單邏輯錯誤。 |
| **2 — 建 Issue 再修正** | 先 `gh issue create` 建立 Issue（含重現步驟、截圖引用、嚴重程度標籤），然後立即修正，修正完成後詢問是否重新部署。 |
| **3 — 先記下來** | 暫存至待建立清單，繼續聯調。開發者說「整理」或「建立 Issues」時批量建立。適合非阻塞性問題、改善建議。 |

### 連續修正與部署

聯調過程中可能連續修正多個問題。AI 應：

1. **累積修正後一次部署**：若開發者連續回報多個小問題且都選「1 — 直接修正」，可累積修正後統一詢問是否重新部署，避免頻繁重建
2. **每次部署前確認**：列出本輪已修正的項目，確認後再執行部署
3. **部署後主動提示**：部署完成後提示開發者繼續測試

### 聯調結束

當開發者明確表示聯調結束（如「OK 了」「沒問題了」「先這樣」），AI 應：

1. 檢查是否有選項 3 暫存的待建立 Issues，若有則提醒
2. 列出本輪聯調的修正摘要（含哪些已建 Issue、哪些直接修正）
3. 詢問是否需要 commit 並推送

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
4. 獲得確認後，**領取 Issue**：
   - 將看板狀態更新為 `In Progress`（或以可行的方式標註）
   - 發佈「🚀 任務領取」Comment 至 Issue（含角色、分支名稱、worktree 路徑）
5. **執行工作目錄同步**（git fetch → 處理未提交變更 → rebase origin/main），確認本地 main 為最新狀態
6. 從最新 main 建立 feature 分支並開始實作
7. 實作過程中，以下規格文件可供參考：
   - `/docs/01-1-PRD.md`（產品需求，前端頁面與流程參考）
   - `/docs/01-2-SRD.md`（技術規範）
   - `/docs/01-3-API_Spec.md`（API 規格）
   - `/docs/API_Spec.yaml`（OpenAPI 合約）
   - `/docs/01-4-UI_UX_Design.md` (UI/UX規格)
8. 完成後撰寫測試並執行
9. 若遇到阻塞或重要進度節點，發佈「📋 進度更新」Comment 至 Issue
10. Vibe Check 通過後，**立即自動推送分支 → 建立 PR → 回報 PR 連結**（無需等待人類核准）
    - 發佈「✅ Vibe Check 通過」Comment 至 Issue（含 PR 連結與測試結果）
    - 向開發者彙報 Vibe Check 結果 + PR 連結，提醒進行 Code Review
    - 若 CI 失敗需修正，可呼叫 `/vibe-sdlc-p4-pr` 處理
11. 若 Vibe Check 未通過，自行修正後重新執行測試，直到通過為止
12. 若 Issue 屬於 Review 類任務（PR 策略為「無 PR」），參照上方「Review 類任務處理流程」：
    - 審查 → 發現確定性 bug → 直接修正 → 測試 → 建 PR → 一併報告 Review 結果與 PR 連結
