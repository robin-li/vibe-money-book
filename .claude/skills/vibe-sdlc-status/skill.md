---
name: vibe-sdlc-status
description: >
  Vibe-SDLC Agent 狀態查詢與彙整。讀取各 Agent 狀態檔，彙整為全局 STATUS.md，提供即時專案現況。
  使用時機：想掌握各 Agent 工作狀態、專案全局現況、或需要彙整 STATUS.md 時。
user_invocable: true
---

# Agent 狀態查詢與彙整

## 目的

提供單一入口掌握所有 Agent 的工作狀態與專案全局現況，並在適當時機彙整為 `/docs/status/STATUS.md`。

## 狀態檔架構

```
/docs/status/
├── STATUS.md          ← A-Main 彙整的全局現況（覆寫式更新）
├── A-Main.md          ← Main Agent 自行維護
├── A-Backend.md       ← Backend Agent 自行維護
├── A-Frontend.md      ← Frontend Agent 自行維護
├── A-QA.md            ← QA Agent 自行維護
└── A-DevOps.md        ← DevOps Agent 自行維護
```

> **無衝突設計**：每個 Agent 只寫自己的狀態檔，A-Main 負責讀取與彙整。

## A-Main 快照分支：`dev/main-agent`

A-Main 除了維護 `/docs/status/` 下的狀態檔之外，還擁有一條專屬的**快照分支** `dev/main-agent`，用來把 STATUS 寫入版控、讓跨機器與多 session 場景下的其他協作者也能取得最新狀態。

### 角色定義

| 項目 | 說明 |
|------|------|
| **用途** | 承載 A-Main 的 STATUS / dashboard 快照 commit；**不**承載任何工作 commit |
| **生命週期** | 永久存在，**不可刪除** |
| **歷史保證** | **不保證線性**。A-Main 可在必要時 `git reset --hard origin/main` 後重新寫入快照 commit |
| **管理者** | 本 skill (`/vibe-sdlc-status`)，Phase 3 (`/vibe-sdlc-dev`) 不介入其歷史維護 |
| **多 session 併發** | 後啟動的 session 必須先 `git fetch origin && git reset --hard origin/dev/main-agent` 對齊遠端，**禁止** rebase 本地歷史 |

> 把這條分支當成「**可移動的 git tag**」來理解：它指向當前的 A-Main 狀態快照，不是累積歷史的工作基地。

### 嚴格禁令

以下動作會破壞快照分支的協作協議，**任何 session 都不得執行**：

- ❌ 在 `dev/main-agent` 上累積任何工作 commit（feature 實作、小修、文件改動）
- ❌ 從 `dev/main-agent` checkout 新的 feature/chore 分支（必須從 `origin/main` 分出）
- ❌ 對 `dev/main-agent` 執行 `git rebase origin/main` 後 `git push --force-with-lease`（會與其他 session 的快照衝突）

> 所有工作 commit 必須走 `feat/*` 或 `chore/main-agent/*` 短命分支，詳見 `/vibe-sdlc-dev` 的「分支策略」。

### STATUS 快照寫入流程（A-Main 專用）

A-Main 在以下時機可將彙整後的 STATUS 寫入 `dev/main-agent`：

| 時機 | 是否寫入 |
|------|---------|
| 呼叫 `/vibe-sdlc-status` 並確認彙整結果 | 視版控模式（見下） |
| PR 合併後（P4 合併後作業） | 視版控模式 |
| 里程碑完成時 | **建議** |

寫入步驟（**只有 A-Main 可執行**）：

```bash
# 1. 對齊到最新 main，丟棄舊的快照歷史（不保留線性）
git fetch origin
git checkout dev/main-agent
git reset --hard origin/main

# 2. 寫入新的 STATUS 內容
# （此時 /docs/status/STATUS.md 已由彙整步驟更新）
git add docs/status/STATUS.md
git commit -m "status: snapshot $(date +%Y-%m-%d-%H%M)"

# 3. force push 到遠端（這是合法且預期的）
git push --force-with-lease origin dev/main-agent

# 4. 收尾：本 skill 不留在 dev/main-agent 上做其他事，
#    若要繼續工作，從 origin/main 建新分支
```

> **與其他分支的根本差異**：對其他分支 `--force-with-lease` 是高危動作；對 `dev/main-agent` 則是**正常操作**——因為它的合約就是「可被 A-Main 重設的快照」。但即便如此，**只有 A-Main session 可以執行**，其他 session 一律走 reset 對齊。

### 顯示與報告規則（跨 skill 通用）

回報 `dev/main-agent` 狀態時（無論是 `/vibe-sdlc-status` 彙整、`/vibe-sdlc` 儀表板、還是 Claude 的自由輸出），**必須**遵守以下規則：

- ❌ **不得**顯示 `dev/main-agent` 相對於 `main` 的 `ahead/behind` commit 數量
- ❌ **不得**使用「落後 main N 個 commit」「需要 rebase」等語句
- ❌ **不得**輸出 `git rev-list --left-right --count` 對快照分支的原始數據
- ✅ **允許**使用相對時間字串（如「2 小時前」「昨天」）表達快照時效
- ✅ **允許**顯示最新快照的 short commit hash 作為參考

> **原因**：快照分支在 `main` 合入新 PR 後天生會「落後」，這是設計合約的一部分，不是需要同步的警告。實測中使用者會把 `behind: N` 誤讀為警告並反覆追問。
>
> **取得時效的唯一正確方式**：`git log -1 --format='%cr %h' dev/main-agent`
>
> 完整的顯示規則表與 Agent 活動區塊的呈現格式詳見 `/vibe-sdlc` skill 的「快照分支顯示規則」章節。

### 各 Agent 狀態檔格式

每個 Agent 的狀態檔遵循以下格式：

```markdown
# Agent: {agent-id}
更新時間: {YYYY-MM-DD HH:MM}

## 當前任務
- {🟢/🟡/🔴/⚪} #{issue-number} {簡述} — {狀態說明}

## 注意事項
- {⚠️/❌/💡} {事項描述}

## 近期待辦
- [ ] #{issue-number} {簡述}
- [ ] #{issue-number} {簡述}
```

**狀態圖示**：

| 圖示 | 意義 |
|------|------|
| 🟢 | 順利進行中 / 已完成 |
| 🟡 | 遇到阻塞但仍在排查 |
| 🔴 | 無法繼續，需人類介入 |
| ⚪ | 閒置中（無任務） |

### 狀態檔寫入時機

Agent 必須在以下事件發生時更新自己的狀態檔：

| 事件 | 更新內容 |
|------|---------|
| 領取任務 | 「當前任務」新增該 Issue，狀態 🟢 |
| 重要進度節點 | 更新狀態說明（如「API 完成，開始寫測試」） |
| 遇到阻塞 | 狀態改 🟡，「注意事項」新增阻塞描述 |
| 無法繼續 | 狀態改 🔴，「注意事項」新增原因與所需決策 |
| Vibe Check 通過 | 狀態改 🟢，說明更新為「PR #N 已建立」 |
| 任務完成（PR 合併） | 從「當前任務」移除，更新「近期待辦」 |

## 版控策略

`/docs/status/` 下的檔案更新頻率高於一般規格文件，需要明確的版控策略避免兩類問題：

1. **全都 commit** → commit 歷史被狀態更新淹沒，有意義的變更難以追蹤
2. **全都忽略** → 跨機器 / 跨 worktree / 新 session 時找不到當前狀態

本 skill **不預設任何版控策略**，而是要求**每個啟用此 skill 的專案必須從下列三種模式中選定一種，並寫入專案 `CLAUDE.md`**：

| 模式 | 適用情境 | 操作 |
|------|---------|------|
| **A：全版控** | 多人協作、重視完整歷史追溯 | `docs/status/**` 全 commit，每次彙整後 commit 一次（commit message 建議帶 `status:` 前綴便於過濾） |
| **B：全忽略** | 單人單機、STATUS 純本地即時快照 | `.gitignore` 加入 `docs/status/` |
| **C：混合**（推薦預設） | 單人多機、希望 STATUS 跨機器但不要 Agent 細節噪音 | `docs/status/STATUS.md` 進版控，`A-*.md` 加入 `.gitignore` |

### 落實方式

| 模式 | `.gitignore` 設定 | 備註 |
|------|-------------------|------|
| A | 無需額外設定 | 約定「狀態更新獨立 commit 不與其他變更混用」 |
| B | `docs/status/` | 所有狀態檔純本地 |
| C | `docs/status/A-*.md` | 僅 `STATUS.md` 進版控 |

### 寫入 CLAUDE.md

專案 CLAUDE.md 的 Vibe-SDLC 章節應包含類似如下的一行宣告：

```
STATUS.md 版控模式：C（混合）— STATUS.md 進版控、A-*.md 忽略
```

若專案 CLAUDE.md 未宣告模式，A-Main 在首次執行 `/vibe-sdlc-status` 時應**主動詢問使用者選擇**，並協助寫入 CLAUDE.md 與設定對應的 `.gitignore`，建立基準後再開始彙整。

## 彙整版 STATUS.md 格式

A-Main 彙整時產出以下格式：

```markdown
# 專案現況
更新時間: {YYYY-MM-DD HH:MM}（由 A-Main 彙整）
專案：{repo-name}

## 里程碑進度
| 里程碑 | 進度 | 完成/總數 |
|--------|------|----------|
| M1 {名稱} | ██████░░░░ | {N}/{M} (60%) |

## Agent 狀態
| Agent | 狀態 | 當前任務 | 備註 |
|-------|------|---------|------|
| A-Main | 🟢 | 彙整中 | — |
| A-Backend | 🟡 | #12 auth API | 等待 JWT 決策 |
| A-Frontend | ⚪ | idle | 等待 #12 完成 |

## 注意事項
- ⚠️ {彙整各 Agent 的注意事項}
- ❌ {需人類介入的事項}

## 近期待辦
- [ ] #{N} {簡述} ({Agent})
- [ ] #{N} {簡述} ({Agent})

## 最近動態
- ✅ #{N} {title} — merged {date}
- 🚀 #{N} {title} — PR #{M} 待審
```

## 彙整觸發時機

| 時機 | 觸發者 |
|------|--------|
| 呼叫 `/vibe-sdlc-status` | 手動觸發 |
| `/vibe-sdlc` 儀表板中引用 | 自動觸發 |
| PR 合併後（P4 合併後作業） | A-Main 自動觸發 |
| 里程碑完成時 | A-Main 自動觸發 |

## 行為指引

當使用者呼叫此 skill 時：

### 步驟 1：收集 Agent 狀態

1. 檢查 `/docs/status/` 目錄是否存在，若不存在則建立
2. 讀取所有 `A-*.md` 狀態檔
3. 若無任何狀態檔（首次使用或單 Agent 專案），從 GitHub Issues 推斷狀態：
   ```bash
   # 進行中的 Issues
   gh issue list --state open --label "in-progress" --json number,title,assignees
   # 最近關閉的 Issues
   gh issue list --state closed --limit 5 --json number,title,closedAt
   # Open PRs
   gh pr list --state open --json number,title,headRefName
   ```

### 步驟 2：收集里程碑數據

```bash
gh issue list -R {owner}/{repo} --state all --json number,state,milestone --limit 200
```

### 步驟 3：彙整並輸出

1. 依格式產出彙整版 STATUS.md 內容
2. 寫入 `/docs/status/STATUS.md`（覆寫）
3. 在終端輸出彙整結果供使用者即時查看

### 步驟 4：異常提醒

若發現以下異常，主動提醒：

| 異常 | 提醒 |
|------|------|
| 某 Agent 狀態檔超過 2 小時未更新 | ⚠️ {Agent} 狀態檔超過 2 小時未更新，可能需要確認 |
| 有 🔴 狀態的 Agent | ❌ {Agent} 無法繼續，需要人類介入：{原因} |
| 阻塞鏈（A 等 B，B 也在等） | ⚠️ 偵測到阻塞鏈：{描述} |

### 單 Agent 模式

若專案僅有一個 Agent（A-Main），流程簡化為：
- 不需要各 Agent 分別維護狀態檔
- A-Main 直接從 GitHub Issues/PR 聚合狀態
- 仍產出 STATUS.md，但省略 Agent 狀態表格
