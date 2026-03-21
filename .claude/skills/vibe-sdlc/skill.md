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
4. **規格文件版本化管理**：任何對 `/docs` 規格文件的修改，都必須同步更新該文件的版本號、最後更新日期、版本修訂說明表格，確保修訂軌跡可追溯
5. **臨時需求即時同步**：開發過程中若有臨時新增需求、Bug 修正導致規格變更、或新增 Issue，應即時回溯修改對應的規格文件與 Dev Plan，而非等到迭代結束才統一更新
6. **即時回報分流機制**：當開發者在對話中直接回報 Bug、功能修改、改善建議等，AI 必須先詢問處理方式（詳見「即時回報分流」章節），再依選擇執行

## 即時回報分流

當開發者在對話中**直接描述 Bug、功能需求、改善建議**（而非透過 `/vibe-sdlc-p3-dev` 領取既有 Issue）時，**AI 必須立即停止，禁止修改任何檔案或撰寫程式碼**，先提供以下三個選項，**等待開發者選擇後才可開始實作**：

```
📋 Issue 追蹤選項
─────────────────
您回報了：{一句話摘要}

請選擇處理方式：
  1️⃣  小問題，直接修正（不建 Issue）
  2️⃣  建立 Issue 後立即修正
  3️⃣  先記下來，待會一起建立 Issues

請選擇（1/2/3）：
```

**各選項行為**：

| 選項 | 行為 |
|------|------|
| **1 — 直接修正** | 不建 Issue，直接進入開發修正流程。適合 typo、文案調整、簡單 config 變更等小修。 |
| **2 — 建 Issue 再修正** | 先以 `gh issue create` 建立 Issue（含標題、描述、標籤），然後立即進入 P3 開發流程修正。若有對應 Milestone 應掛載。 |
| **3 — 收集後批量建立** | 將此回報暫存於對話上下文中（使用清單格式追蹤）。當開發者說「建立 Issues」或「整理回報」時，一次性列出所有已收集的回報，確認後批量建立 Issues。 |

**暫存回報格式**（選項 3 適用）：

在對話中維護一份待建立清單：

```
📝 待建立 Issues（{N} 筆）
──────────────────────
1. [Bug] {摘要} — {嚴重程度}
2. [Feature] {摘要}
3. [Fix] {摘要}
...
```

當觸發批量建立時，逐一確認標題、標籤、Milestone 後執行 `gh issue create`。

**觸發條件**：

以下情境應觸發此分流機制（**必須阻斷，不可跳過**）：
- 開發者描述了一個 Bug（如「XX 有問題」「XX 壞了」「XX 不正確」）
- 開發者提出功能需求（如「新增需求」「我想要 XX」「加一個 XX」「幫我做 XX」）
- 開發者提出功能修改（如「幫我改 XX」「XX 應該要 YY」）
- 開發者提出改善建議（如「XX 可以優化」「XX 體驗不好」）
- 任何會導致新增或修改程式碼的請求（除非符合下方「不觸發」條件）

以下情境**不觸發**（直接執行）：
- 透過 `/vibe-sdlc-p3-dev` 領取既有 Issue 進行開發
- 開發者明確說「直接改」「快速修一下」等表達不需追蹤的意圖
- 純粹的程式碼問答、架構討論（無實際修改需求）

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

# 5. 部署現況偵測（若專案有部署腳本）
#    見「步驟 1a：偵測部署現況」
```

### 步驟 1a：偵測部署現況

若專案根目錄存在 `docker-compose.yml`（或 `docker-compose.yaml`、`compose.yml`），則偵測部署相關服務的運行狀態。此步驟可與步驟 1 的其他指令並行執行。

**偵測項目與指令**：

```bash
# 1a-1. Docker 容器狀態
docker compose ps --format json 2>/dev/null || echo "DOCKER_NOT_RUNNING"

# 1a-2. Cloudflare Tunnel 狀態（若使用 Tunnel 部署）
#   優先檢查 PID 檔（路徑從 scripts/start.sh 中解析，預設為 {project_root}/.tunnel.pid）
#   若 PID 檔不存在，則 fallback 透過 ps 偵測 cloudflared 進程
if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
    echo "TUNNEL_RUNNING (PID: $(cat "$PID_FILE"))"
else
    # Fallback：直接搜尋 cloudflared 進程（涵蓋非透過 start.sh 啟動的情況）
    TUNNEL_PID=$(ps aux | grep 'cloudflared tunnel' | grep -v grep | awk '{print $2}' | head -1)
    if [ -n "$TUNNEL_PID" ]; then
        # 嘗試從進程參數取得 config 檔名
        TUNNEL_INFO=$(ps aux | grep 'cloudflared tunnel' | grep -v grep | head -1)
        echo "TUNNEL_RUNNING_NO_PID_FILE (PID: $TUNNEL_PID)"
    else
        echo "TUNNEL_NOT_RUNNING"
    fi
fi

# 1a-3. 服務健康檢查（從 docker-compose.yml 解析 ports 與環境變數）
#   後端：curl -sf http://localhost:{backend_port}/health
#   前端：curl -sf -o /dev/null -w "%{http_code}" http://localhost:{frontend_port}

# 1a-4. 公網端點檢查（從 docker-compose.yml 環境變數中解析對外 URL）
#   例：CORS_ORIGIN, VITE_API_BASE_URL 等可能包含公網域名
#   curl -sf -o /dev/null -w "%{http_code}" {public_url}
```

**偵測邏輯**：

1. **解析 `docker-compose.yml`**：讀取 services 定義，取得各服務的 port mapping 與環境變數
2. **解析啟動腳本**（如 `scripts/start.sh`）：取得 Tunnel 設定檔路徑、PID 檔路徑、公網 URL 等
3. **判定部署狀態**：

| 狀態 | 條件 |
|------|------|
| 🟢 運行中 | Docker 容器 running + 健康檢查通過 |
| 🟡 部分運行 | 部分容器 running 或健康檢查失敗 |
| 🔴 未運行 | 無容器運行或 Docker 未啟動 |
| ⚪ 未配置 | 無 docker-compose.yml |

Tunnel 狀態獨立判定：

| 狀態 | 條件 |
|------|------|
| 🟢 連線中 | PID 檔或 ps 偵測到 cloudflared 進程運行中 + 公網端點可達 |
| 🟡 程序運行但端點不可達 | cloudflared 進程存在但公網 curl 失敗 |
| 🔴 未運行 | PID 檔不存在且 ps 未偵測到 cloudflared 進程 |
| ⚪ 未配置 | 無啟動腳本或 Tunnel 設定 |

> **注意**：Tunnel 可能透過 `scripts/start.sh`（產生 PID 檔）或直接以 `cloudflared tunnel run` 啟動（無 PID 檔）。偵測時應同時檢查 PID 檔與 `ps aux | grep cloudflared` 兩種途徑。

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

┌─ 部署現況 ───────────────────────────────────┐
│ 🐳 Docker：{🟢 運行中 / 🟡 部分運行 / 🔴 未運行 / ⚪ 未配置}  │
│    - {service_name}: {status} (port: {port})  │
│    - {service_name}: {status} (port: {port})  │
│ 🔗 Tunnel：{🟢 連線中 / 🔴 未運行 / ⚪ 未配置}               │
│ 🌐 公網端點：                                 │
│    - {url} → {HTTP status / 不可達}           │
│    - {url} → {HTTP status / 不可達}           │
│ 📅 上次部署 commit：{short_hash} {message}    │
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

**部署現況區塊規則**：
- 若專案無 `docker-compose.yml` 且無部署腳本，則**省略整個「部署現況」區塊**，不顯示
- 「上次部署 commit」：比對目前正在運行的容器 image 與本地最新 commit，若無法取得容器資訊則顯示最近一次與部署相關的 commit（搜尋關鍵字：`deploy`, `部署`, `release`, `docker`, `tunnel`）
- 公網端點：從 `docker-compose.yml` 的環境變數（如 `CORS_ORIGIN`、`VITE_API_BASE_URL`）或啟動腳本中解析；若無公網端點則省略該行
- 健康檢查逾時設為 5 秒（`curl --max-time 5`）

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
