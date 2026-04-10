---
name: vibe-sdlc-dev
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
- 根據分支策略建立對應分支（有 Issue → `feat/*` 分支；無 Issue 小修 → `chore/main-agent/*` 短命分支）
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
  - `/docs/01-5-API_Spec.md`（API 規格）
  - `/docs/API_Spec.yaml`（OpenAPI 合約）
  - `/docs/01-6-UI_UX_Design.md` (UI/UX規格)

## 操作步驟

| 步驟 | 執行者 | 操作 | 產出 |
|------|--------|------|------|
| 1 | **開發者** | 從看板 `Todo` 欄位挑選最高優先級 Issue，指派給 AI | — |
| 2 | **AI 助手** | 讀取 Issue 內容，確認理解任務範圍與驗收標準 | 任務確認 |
| 3 | **AI 助手** | **領取 Issue**：更新看板狀態為 `In Progress`，發佈「領取 Comment」（詳見下方「Issue 狀態追蹤規範」） | Issue Comment |
| 4 | **AI 助手** | **同步工作目錄**（詳見下方「工作目錄同步規範」） | 最新 main |
| 5 | **AI 助手** | 根據分支策略建立分支（詳見「分支策略」章節） | 工作分支 |
| 6 | **AI 助手** | 參考 SRD 技術規範與 API Spec，實作功能程式碼 | 功能程式碼 |
| 7 | **AI 助手** | 撰寫對應的單元測試 | 測試程式碼 |
| 8 | **AI 助手** | 執行本地測試（Vibe Check），確認全部通過 | 測試結果 |
| 9 | **AI 助手** | Vibe Check 通過 → 自動推送分支 → 建立 PR（含 `Closes #N`） | Pull Request |
| 10 | **AI 助手** | 向開發者彙報 Vibe Check 結果 + PR 連結，提醒進行 Code Review | 完成報告 |

> **核心原則**：Vibe Check 通過 = 自動推送 + 建 PR，**無需等待人類核准**。人類審核集中在 GitHub PR 的 Code Review 環節。Phase 4 僅在需要處理 CI 失敗或合併後作業時使用。

## 分支策略

**⛔ 嚴格禁止直接 push 至 main**，無論改動大小，一律透過分支 + PR 流程。

### 分支類型總覽

| 類型 | 分支名稱 | 生命週期 | 用途 |
|------|---------|---------|------|
| **主線**（唯讀） | `main` / `master` | 永久 | 唯讀基準分支，只接受 PR 合併，禁止任何直接修改 |
| **A-Main 快照分支** | `dev/main-agent` | 永久（**允許 force-update**） | A-Main 的 STATUS / dashboard 快照點。**零工作 commit 累積**，由 `/vibe-sdlc-status` 管理；多 session 併發時可能被其他 session 重設。**嚴禁**承接任何 Issue 實作或小修 commit |
| **功能分支** | `feat/<agent>/issue-N-簡述` | 短期 | 所有 Issue-based 開發，PR 合併後刪除 |
| **A-Main 收斂分支** | `chore/main-agent/<YYYYMMDD>-<簡述>` | 短期 | 無 Issue 的小修累積（typo、文案、config、聯調連續小修）。從 `origin/main` 建出，PR 合併後刪除 |

> **核心語意**：`dev/main-agent` 是「可移動的 git tag」，不是工作基地。所有會產生 commit 的工作（包含小修）都必須走**短命分支**（`feat/*` 或 `chore/main-agent/*`），用後即刪。

### 分支判斷規則

| 條件 | 分支類型 | 分支命名 | 說明 |
|------|---------|---------|------|
| **有 Issue**（領取 Issue 開發） | Feature 分支 | `feat/<agent>/issue-N-簡述` | 所有 Issue-based 開發，無論改動大小 |
| **無 Issue 小修**（分流選項 1、聯調小修正） | Chore 分支 | `chore/main-agent/<YYYYMMDD>-<簡述>` | typo、文案、簡單 config、聯調連續小修；用後即刪 |
| **任務之間**（無進行中工作） | — | 停留在 `dev/main-agent` 檢視，但**不在其上 commit** | 只作為預設停留位置，要動手時立刻從 `origin/main` 建新分支 |

> **零例外規則**：有 Issue → `feat/*`；無 Issue 也要做事 → `chore/main-agent/*`。**不得**在 `dev/main-agent` 上新增任何工作 commit。

### `dev/main-agent` 快照分支規則

`dev/main-agent` 是 Vibe-SDLC 的**永久快照分支**，永遠存在但不累積工作歷史。其完整定義由 `/vibe-sdlc-status` 管理（見該 skill 的「A-Main 快照分支」章節）。

**首次建立**（若倉庫尚未存在此分支，由 skill 自動建立）：
```bash
git fetch origin
git checkout -b dev/main-agent origin/main
git push -u origin dev/main-agent
```

**定位**：
- 角色：A-Main 的狀態快照點（STATUS.md / dashboard），類似可移動的 tag
- 歷史：**不保證線性**，A-Main 可從 `origin/main` 重設後重新寫入 STATUS commit
- 管理者：`/vibe-sdlc-status`，Phase 3 不介入其歷史維護

**Phase 3 對 `dev/main-agent` 的規則**：

| 動作 | 允許 | 原因 |
|------|------|------|
| `git checkout dev/main-agent` 檢視狀態 | ✅ | 讀取不影響歷史 |
| 從 `dev/main-agent` 新建 feature/chore 分支 | ❌ | 必須從 `origin/main` 建出，避免帶上快照歷史 |
| 在 `dev/main-agent` 上新增任何 commit | ❌ | 零工作 commit 累積原則 |
| 對 `dev/main-agent` 執行 rebase / force push | ❌ | 是 `/vibe-sdlc-status` 的職責 |
| 刪除 `dev/main-agent` | ❌ | 永久分支 |

**若本地 `dev/main-agent` 與 `origin/dev/main-agent` 不一致**（通常是另一個 session 做了 STATUS 快照）：

```bash
# 正確做法：直接對齊遠端，不保留本地歷史
git fetch origin
git checkout dev/main-agent
git reset --hard origin/dev/main-agent
```

> **禁止** 在 `dev/main-agent` 上 rebase 或 force push。若本地有未 push 的 commit（理論上不該發生），依下方「Push 被拒的處置規則」改走 `chore/main-agent/*`。

### `chore/main-agent/*` 收斂分支生命週期

用於承接無 Issue 的小修，取代舊版 `dev/main-agent` 的「停車場」角色。

**建立時機**：
- 分流選項 1（直接修正）
- 聯調模式的連續小修正（無 Issue）
- 任何「要動手改檔案但沒有對應 Issue」的情境

**建立方式**（必須從 `origin/main` 分出）：
```bash
git fetch origin
git checkout -b chore/main-agent/$(date +%Y%m%d)-<簡述> origin/main
```

**命名範例**：
- `chore/main-agent/20260410-typo-readme`
- `chore/main-agent/20260410-integration-fixes`（聯調多筆小修用同一條）

**PR 提交時機**（滿足任一即提交）：
- 小修達到一個自然停止點
- 聯調測試結束
- 開發者明確說「push」或「推送」

**PR 合併後處理**：與 feature 分支相同，**刪除本地與遠端分支**，依下方「PR 合併後 HEAD 收尾」回到 `dev/main-agent`。

### 提交與合併規則

| 情境 | 分支 | 提交方式 | PR 合併後 |
|------|------|---------|----------|
| **功能開發**（領取 Issue） | `feat/<agent>/issue-N-簡述` | feature → PR | 刪除分支 |
| **分流選項 1（直接修，無 Issue）** | `chore/main-agent/<date>-<簡述>` | chore → PR | 刪除分支 |
| **聯調模式連續修正（無 Issue）** | `chore/main-agent/<date>-<簡述>` | 累積修正後 chore → PR | 刪除分支 |
| **聯調模式修正（有 Issue）** | `feat/<agent>/issue-N-簡述` | feature → PR | 刪除分支 |
| **A-Main STATUS 快照寫入** | `dev/main-agent` | 由 `/vibe-sdlc-status` 管理（可 reset + commit） | 不 PR、不刪除 |

> **原則**：所有工作變更一律走 PR 且用後即刪。`dev/main-agent` 不接受工作 commit，只接受由 status skill 管理的快照更新；嚴禁直接 push main。

## 議題收集與處置流程補充

以下為 `/vibe-sdlc` 核心原則中「議題收集與處置流程」的補充規則：

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

> 詳見 `/vibe-sdlc-pr`「規格文件同步觸發條件」。PR 合併後，AI 應根據該規則提示開發者是否需要同步更新規格文件。

## Agent 狀態檔維護規範

> 詳細的狀態檔架構與格式定義見 `/vibe-sdlc-status`。以下為 P3 開發過程中的寫入規則。

每個 Agent 在開發過程中**必須**維護自己的狀態檔（`/docs/status/{agent-id}.md`），確保其他人可隨時掌握該 Agent 的工作狀態。

### 寫入時機

| 事件 | 狀態檔操作 |
|------|-----------|
| 領取任務（步驟 3） | 「當前任務」新增 Issue，狀態 🟢 |
| 完成重要階段 | 更新狀態說明 |
| 遇到阻塞（自行排查中） | 狀態改 🟡，「注意事項」新增描述 |
| 無法繼續（需人類介入） | 狀態改 🔴，「注意事項」新增原因 |
| Vibe Check 通過 + PR 建立 | 狀態說明更新為「PR #N 已建立」 |
| 任務完成（PR 合併後） | 從「當前任務」移除，更新「近期待辦」 |

### 單 Agent 模式

若專案僅有一個 Agent（A-Main），可省略狀態檔維護。狀態將由 `/vibe-sdlc-status` 從 GitHub Issues/PR 自動聚合。

## Telegram 推播規範

> 若 Dev Plan 協作策略中定義了 TG 推播設定（Bot Token + Chat ID），Agent 在關鍵事件發生時**必須**透過 TG sendMessage API 推送通知。

### 推播事件

| 事件 | 推播內容 | 推播條件 |
|------|---------|---------|
| 領取任務 | `🚀 {agent} 領取 #{N} {標題}` | 必須 |
| 遇到阻塞 | `⚠️ {agent} #{N} 遇到阻塞：{簡述}` | 必須 |
| 無法繼續 | `❌ {agent} #{N} 無法繼續：{原因}` | 必須 |
| Vibe Check 通過 | `✅ {agent} #{N} 完成，PR #{M} 已建立` | 必須 |
| 重要進度 | `📋 {agent} #{N} {進度描述}` | 建議 |

### 推播方式

使用 curl 呼叫 TG Bot API：

```bash
curl -s -X POST "https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage" \
  -d chat_id="${TG_CHAT_ID}" \
  -d text="${MESSAGE}" \
  -d parse_mode="Markdown"
```

> **Bot Token 與 Chat ID** 定義於 Dev Plan 的「協作策略 — 通知設定」段落中，或透過環境變數 `TG_BOT_TOKEN` / `TG_CHAT_ID` 注入。Agent 應優先讀取 Dev Plan 設定，若無則 fallback 至環境變數。若兩者皆無，則跳過推播（不阻擋開發流程）。

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

> **每次領取新 Issue 前，必須先同步工作目錄。** 這是為了確保新建的分支基於最新的 `main`，避免因本地落後遠端而產生不必要的衝突或遺漏已合併的程式碼。
>
> **預設停留分支為 `dev/main-agent`**：任務間無進行中工作時停留在此分支**檢視**即可，但任何動手的工作（feature / chore）都必須從 `origin/main` 新建分支，**絕對不得**在 `dev/main-agent` 上 commit。

### 同步步驟（步驟 3 詳細流程）

```bash
# 1. 同步遠端資訊
git fetch origin

# 2. 偵測主線分支名稱（main 或 master，以下統稱 {main}）

# 3. 確保快照分支 dev/main-agent 存在，若不存在則建立
git show-ref --verify --quiet refs/heads/dev/main-agent || \
  git checkout -b dev/main-agent origin/{main} && \
  git push -u origin dev/main-agent

# 4. 檢查本地是否有未提交的變更
git status --short
```

#### 情境 A：當前在 `dev/main-agent`（快照分支，預期停留位置）

- **工作目錄乾淨**：**不要 rebase、不要 force push**。直接從 `origin/main` 建立新的工作分支（feature / chore）：

  ```bash
  git fetch origin
  # 若本地 dev/main-agent 落後遠端（他人做了 STATUS 快照），直接對齊
  git reset --hard origin/dev/main-agent
  # 建立新工作分支（不從 dev/main-agent 分出）
  git checkout -b <feat|chore>/... origin/main
  ```

- **工作目錄有未提交變更**（⚠️ 異常狀態，不應發生）：`dev/main-agent` 上不該有未 commit 的變更。處理方式：

  ```
  ⚠️ 快照分支 dev/main-agent 出現未提交變更（不應發生）
  ├─ 當前分支：dev/main-agent
  ├─ 未提交變更：
  │  {git status --short 輸出}
  └─ 建議操作：
     1. 搬移至新的 chore 分支（推薦）— 自動接管變更
     2. 暫存變更（git stash）→ 對齊遠端 → 建立 chore 分支 → stash pop
     3. 捨棄全部變更（⚠️ 不可逆）
  ```

  - 選擇 **1**：`git checkout -b chore/main-agent/$(date +%Y%m%d)-<簡述> origin/main`（變更自動帶過去）
  - 選擇 **2**：`git stash` → `git fetch origin && git reset --hard origin/dev/main-agent` → `git checkout -b chore/main-agent/$(date +%Y%m%d)-<簡述> origin/main` → `git stash pop`
  - 選擇 **3**：再次確認後 `git checkout -- . && git clean -fd`

#### 情境 B：當前在 `{main}` 分支（應避免）

- **工作目錄乾淨**：`git pull origin {main}` 後切回快照分支：`git checkout dev/main-agent && git reset --hard origin/dev/main-agent`
- **工作目錄有未提交變更**（⚠️ 異常狀態）：以下列格式警告，暫停等待開發者指示：

  ```
  ⚠️ 主線分支有未提交變更（{main} 應為唯讀，禁止 commit）
  ├─ 當前分支：{main}
  ├─ 未提交變更：
  │  {git status --short 輸出}
  └─ 建議操作：
     1. 搬移至新的 chore/main-agent 分支（推薦）
     2. 暫存變更（git stash）→ pull main → 切回 dev/main-agent → 建 chore 分支 → stash pop
     3. 捨棄全部變更（⚠️ 不可逆，慎用）
  ```

  - 選擇 **1**：`git checkout -b chore/main-agent/$(date +%Y%m%d)-<簡述>`（變更自動帶過去）→ 後續走 chore 分支開發
  - 選擇 **2**：`git stash` → `git pull origin {main}` → `git checkout dev/main-agent && git reset --hard origin/dev/main-agent` → `git checkout -b chore/main-agent/$(date +%Y%m%d)-<簡述> origin/{main}` → `git stash pop`
  - 選擇 **3**：再次確認後 `git checkout -- . && git clean -fd` → `git pull origin {main}` → `git checkout dev/main-agent && git reset --hard origin/dev/main-agent`

#### 情境 C：當前在 feature / chore 分支（`feat/*` 或 `chore/main-agent/*`）

- **工作目錄乾淨**：若繼續開發同一任務，停留在當前分支即可；若任務已完成或要切換任務，`git checkout dev/main-agent && git reset --hard origin/dev/main-agent`
- **工作目錄有未提交變更**：與開發者確認是否需要先 commit 或 stash，處理完畢後再繼續同步流程

#### 收尾步驟（所有情境共通）

```bash
# 5. 若 rebase 產生衝突：立即停止並通知開發者
#    - 不可自行解決衝突
#    - 報告衝突的檔案清單，等待開發者指示

# 6. 清理已合併的分支與無用的 worktree（詳見下方「清理規範」）
```

### 清理已合併分支與 Worktree

同步完成後，檢查是否有前次任務遺留的分支與 worktree 需要清理。**刪除前必須列出清單讓開發者確認。**

#### 檢查指令

```bash
# 受保護分支的 grep 排除模式（含快照分支 dev/main-agent）
PROTECTED='main$\|master$\|dev/main-agent$\|develop$\|dev$\|testing$\|test$\|staging$\|uat$\|release/'

# 1. 同步遠端已刪除的分支引用（清除本地殘留的 remote tracking ref）
git fetch --prune

# 2. 列出已合併至 main 的本地分支（排除受保護分支）
git branch --merged main | grep -v "^\*\|$PROTECTED"

# 3. 列出對應的遠端已合併分支（排除受保護分支與 HEAD）
git branch -r --merged origin/main | grep -v "origin/HEAD\|$PROTECTED"

# 4. 列出所有 worktree
git worktree list
```

> **快照分支保護**：`dev/main-agent` 是永久分支，**不可刪除**。它保護的是「分支存在性」，不是「歷史線性」——A-Main 可透過 `/vibe-sdlc-status` 在必要時將其 reset 到 `origin/main` 後重寫快照 commit。
>
> **Chore 分支不在保護清單**：`chore/main-agent/*` 屬於短命分支，用後即刪（與 feature 分支相同處理）。

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

| 場景 | 是否需要同步 | 新分支 base |
|------|-------------|------------|
| 領取新 Issue、建立 feature 分支前 | **必須** | `origin/main` |
| 分流選項 1 / 聯調小修，建立 chore 分支前 | **必須** | `origin/main` |
| PR 合併後，準備下一個任務 | **必須** | `origin/main`（從新 base 建新分支） |
| 在 feature / chore 分支上開發途中 | 不需要 | — |
| 聯調/驗收中連續修正 | 不需要 | — |
| Phase 4 修正 CI 失敗時 | 建議 | 不切換（在失敗分支修正） |
| 查看儀表板（`/vibe-sdlc`） | `git fetch` 即可 | — |

> **關鍵**：所有新工作分支的 base **必須**是 `origin/main`，不得是 `dev/main-agent` 或任何本地分支。這是避免再次撞上「從快照分支分出導致歷史交錯」的核心規則。

### Push 被拒的處置規則

若 `git push` 被拒絕（non-fast-forward），**禁止**採取以下動作：

- ❌ `git push --force` / `--force-with-lease` 到 `dev/main-agent`（會覆蓋其他 session 的 STATUS 快照）
- ❌ 在 `dev/main-agent` 上 `git rebase origin/dev/main-agent` 後 force push
- ❌ 在任何 feature 分支上 force push（除非是自己剛剛才推上去的 WIP）

應依情境採取以下處置：

| 情境 | 處置 |
|------|------|
| 當前在 feature 分支，被拒是因為他人推了相同分支 | 停下並報告，不自行處理（可能有 session 衝突） |
| 當前在 `dev/main-agent`，本地有未 push 的 commit（理論上不該發生） | 從 `origin/main` 建 `chore/main-agent/<date>-*` → `git cherry-pick` 本地 commit 過去 → 走 PR 流程；原本 `dev/main-agent` 本地 `git reset --hard origin/dev/main-agent` 對齊 |
| 當前在 `chore/main-agent/*`，被拒（另一 session 推過同名分支） | 報告衝突，與開發者討論是否改名或合併 |

> **原則**：`dev/main-agent` 被視為「他人也會動的快照分支」，本地 commit 不保證能直接 push 上去；遇到衝突一律走新分支 cherry-pick 而非硬 rebase。

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

> 詳見 `/vibe-sdlc-pr`「追加 Commit 至既有 PR 的安全檢查」。推送前必須確認 PR 仍為 OPEN。

### PR 合併後的 HEAD 收尾檢查（強制）

`gh pr merge --delete-branch` 會在當前分支被刪時自動把 HEAD 切到 PR 的 base 分支（通常是 `main`）。為避免「不知不覺停留在 `main` 或被刪除的 feature branch」，**merge 指令執行後必須**依序執行：

1. `git branch --show-current` 確認當前分支
2. 若當前在 `main` / `master` 或已被刪除的 feature/chore 分支 → **立刻** `git checkout dev/main-agent && git reset --hard origin/dev/main-agent`
3. 在 Vibe Check 報告末尾標註「**Post-merge branch**: {branch}」供人類審計
4. 嚴禁在 `main` 上停留超過單一 checkout 指令的時間

```bash
# 標準收尾流程（放在 gh pr merge 之後）
gh pr merge <N> --squash --auto --delete-branch
git fetch origin
CUR=$(git branch --show-current)
if [ "$CUR" = "main" ] || [ "$CUR" = "master" ] || [ -z "$CUR" ]; then
  git checkout dev/main-agent
  git reset --hard origin/dev/main-agent
fi
git branch --show-current  # 最終確認
```

### PR Body 格式

> **必須遵循 Phase 4 定義的「PR 格式規範」**（見 `/vibe-sdlc-pr`「PR 格式規範」）。

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

當開發者在**部署後進行聯合調試**（部署 → 測試 → 發現問題 → 修正 → 重新部署）的連續循環中，每一筆回報的 Bug 或修改需求都必須先觸發「議題收集與處置流程」機制（定義於 `/vibe-sdlc` 核心原則）。

### 聯調流程

```
部署 → 開發者測試 → 發現問題 → 回報分流（1/2/3）→ 修正 → 重新部署 → 繼續測試
                                    ↑                              ↓
                                    └──────────────────────────────┘
```

### 分流選項行為

| 選項 | 聯調中的行為 |
|------|------------|
| **1 — 直接修正** | 從 `origin/main` 建 `chore/main-agent/$(date +%Y%m%d)-<簡述>` 分支（聯調多筆小修共用同一條），立即修正，修正完成後詢問是否重新部署（`docker compose up -d --build`）。適合 UI 微調、文案、簡單邏輯錯誤。 |
| **2 — 建 Issue 再修正** | 先 `gh issue create` 建立 Issue（含重現步驟、截圖引用、嚴重程度標籤），然後立即修正，修正完成後詢問是否重新部署。 |
| **3 — 先記下來** | 暫存至待建立清單，繼續聯調。開發者說「整理」或「建立 Issues」時批量建立。適合非阻塞性問題、改善建議。 |

### 連續修正與部署

聯調過程中可能連續修正多個問題。AI 應：

1. **累積修正後一次部署**：若開發者連續回報多個小問題且都選「1 — 直接修正」，在同一條 `chore/main-agent/<date>-*` 分支上累積修正後統一詢問是否重新部署，避免頻繁重建
2. **每次部署前確認**：列出本輪已修正的項目，確認後再執行部署
3. **部署後主動提示**：部署完成後提示開發者繼續測試

### 聯調結束

當開發者明確表示聯調結束（如「OK 了」「沒問題了」「先這樣」），AI 應：

1. 檢查是否有選項 3 暫存的待建立 Issues，若有則提醒
2. 列出本輪聯調的修正摘要（含哪些已建 Issue、哪些直接修正）
3. 若 `chore/main-agent/*` 分支有未推送的 commit，提交 PR 並在合併後刪除該分支

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
6. 根據分支策略，從 `origin/main` 建立對應分支（有 Issue → `feat/<agent>/issue-N-簡述`；無 Issue 小修 → `chore/main-agent/<YYYYMMDD>-<簡述>`）並開始實作
7. 實作過程中，以下規格文件可供參考：
   - `/docs/01-1-PRD.md`（產品需求，前端頁面與流程參考）
   - `/docs/01-2-SRD.md`（技術規範）
   - `/docs/01-5-API_Spec.md`（API 規格）
   - `/docs/API_Spec.yaml`（OpenAPI 合約）
   - `/docs/01-6-UI_UX_Design.md` (UI/UX規格)
8. 完成後撰寫測試並執行
9. 若遇到阻塞或重要進度節點，發佈「📋 進度更新」Comment 至 Issue
10. Vibe Check 通過後，**立即自動推送分支 → 建立 PR → 回報 PR 連結**（無需等待人類核准）
    - 發佈「✅ Vibe Check 通過」Comment 至 Issue（含 PR 連結與測試結果）
    - 向開發者彙報 Vibe Check 結果 + PR 連結，提醒進行 Code Review
    - 若 CI 失敗需修正，可呼叫 `/vibe-sdlc-pr` 處理
11. 若 Vibe Check 未通過，自行修正後重新執行測試，直到通過為止
12. 若 Issue 屬於 Review 類任務（PR 策略為「無 PR」），參照上方「Review 類任務處理流程」：
    - 審查 → 發現確定性 bug → 直接修正 → 測試 → 建 PR → 一併報告 Review 結果與 PR 連結
