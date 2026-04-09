---
name: vibe-sdlc-issues
description: >
  Vibe-SDLC Phase 2：任務掛載 (Planning → Issues)。審核 Dev Plan 完整性，並自動建立 GitHub Issues。
  使用時機：規格文件已定稿，需要將開發計畫轉換為 GitHub Issues 與看板任務。
user_invocable: true
---

# Phase 2：任務掛載 (Planning → Issues)

## 目的

將 Dev Plan 轉換為 GitHub Issues，使每項任務皆可追蹤、可分派、可度量，並建立 Project 看板。

## 你的角色

你是 AI 助手（執行者）。在此階段你的職責是：
- 依據 Dev Plan 逐一建立 GitHub Issues
- 依據 GitHub Issues 建立 Project 看板

**你不應該**：自行決定任務優先級或增刪任務，這些由開發者決策。

## 前置條件

- Phase 1 所有完成條件已達成（規格文件已定稿）
- 以下文件存在且已定稿：
  - `/docs/01-1-PRD.md`
  - `/docs/01-2-SRD.md`
  - `/docs/01-5-API_Spec.md`
  - `/docs` 目錄下其它所有規格文件，例如 `API_Spec.yaml`、`01-6-UI_UX_Design.md` 等
  - `/docs/02-Dev_Plan.md`

## 操作步驟

| 步驟 | 執行者 | 操作 | 產出 |
|------|--------|------|------|
| 1 | **AI 助手** | 確認 P1 審查報告 (`03-Docs_Review_Report.md`) 已通過，無未解決的遺漏項目 | 確認結果 |
| 2 | **AI 助手** | 確認 `gh` CLI 已認證、repo 存在，詢問 GitHub repo 名稱（`{owner}/{repo}`）與 H-Director 的 GitHub username | 基本資訊 |
| 3 | **開發者** | 指示 AI 按里程碑建立 Issues（或全部） | — |
| 4 | **AI 助手** | 建立所需的 Labels（優先級、里程碑、類型、角色）與 Milestones | Labels + Milestones |
| 5 | **AI 助手** | 依 Dev Plan 逐一建立 GitHub Issues（開發任務），每個 Issue 包含：標題、描述、優先級標籤、里程碑標籤、角色標籤、依賴關係說明 | GitHub Issues（開發） |
| 6 | **AI 助手** | 掃描所有任務的 `👁️ 手動` 驗證項，為每個手動驗證項建立獨立的驗證 Issue，指派給對應的審查角色 | GitHub Issues（驗證） |
| 7 | **AI 助手** | Issues 全部建立完成後，**主動詢問**開發者是否要建立或連結 GitHub Project 看板 | — |
| 8 | **AI 助手** | 若開發者同意，建立 Project（或連結現有）→ 加入 Issues → **連結至 Repo** | Project 看板就緒 |
| 9 | **開發者** | 前往 Repo 的 Projects tab 確認看板上的 Issue 清單與排序是否正確 | 最終確認 |

## Labels 與 Milestones 規範

建立 Issues 前，**必須**先建立以下 Labels 與 Milestones：

### Labels（使用 `gh label create`）

| 類別 | 標籤 | 色碼 | 說明 |
|------|------|------|------|
| 優先級 | `P0` | `#B60205` | 最高優先級 |
| 優先級 | `P1` | `#D93F0B` | 高優先級 |
| 優先級 | `P2` | `#E4E669` | 中優先級 |
| 優先級 | `P3` | `#0E8A16` | 低優先級 |
| 里程碑 | `M1` ~ `M4` | 自訂 | 對應 Dev Plan 里程碑 |
| 類型 | `feature` / `infra` / `security` / `test` / `verification` / `gate` | 自訂 | 任務類型 |
| 角色 | `A-Backend` / `A-Frontend` / `A-DevOps` / `A-QA` / `A-Main` / `H-Director` | 自訂 | Dev Plan 中定義的角色 |
| 審查類型 | `ux-review` / `review` / `acceptance` | 自訂 | 手動驗證 Issue 專用 |

### Milestones（使用 `gh api repos/{owner}/{repo}/milestones`）

依據 Dev Plan 的里程碑定義建立，包含 `title`、`due_on`、`description`。

## Issue 格式規範

建立每個 Issue 時，**必須**使用以下格式：

```markdown

## 任務描述
[具體要實作的功能或工作內容]

## 任務編號
[任務編號：原先在 Dev Plan 中的任務編號，如 T-XXX]

## 主要步驟
[從 Dev Plan 複製該任務的主要步驟，確保資訊完整]

## 產出文件
- [ ] [文件 1]（如適用）
- [ ] [文件 2]（如適用）

## 驗收標準
- [ ] [標準 1]
- [ ] [標準 2]

## 技術參考
- SRD 相關章節：[章節名稱]
- API 端點：[端點路徑]（如適用）
- 其它參考文件

## 依賴
- 前置任務：#[Issue 編號]（如適用）

## 標籤
- 優先級：P0 / P1 / P2 / P3
- 里程碑：M1 / M2 / M3 / M4
- 類型：feature / infra / security / test
- 負責角色：A-Backend / A-Frontend / A-DevOps / A-QA / A-Main

## PR 策略
[獨立 PR / 與 T-XXX 合併為一個 PR / 無 PR（Review 任務）]
```

### Issue 建立指令範例

```bash
gh issue create -R {owner}/{repo} \
  --title "T-101：Schema 與 DB 初始化" \
  --milestone "M1：基礎架構與認證" \
  --label "P0,M1,infra,A-Backend" \
  --body "$(cat <<'EOF'
[Issue body here...]
EOF
)"
```

**注意事項**：
- 使用 `--milestone` 指定 GitHub Milestone（需先建立）
- 使用 `--label` 一次指定多個標籤（逗號分隔）
- 依賴關係中使用 `#N` 引用 Issue 編號，需在建立時根據實際編號填寫
- 使用 HEREDOC（`<<'EOF'`）傳遞 body 以確保格式正確


## 手動驗證 Issue 格式規範

當 Dev Plan 中的任務包含 `👁️ 手動` 驗證項時，**每個手動驗證項應建立獨立的 Issue**。

### 識別手動驗證項

掃描 Dev Plan §4.2 中每個任務的「驗證」區塊，找出所有標記為 `👁️ 手動` 的項目。

### 指派規則

| 驗證類型 | 指派角色 | 標籤 |
|---------|---------|------|
| 視覺效果、互動體驗、UI 佈局、動畫、裝置相容性 | **H-UxReviewer** | `ux-review` |
| 安全性、合規性、外部 API 整合測試 | **H-Reviewer** | `review` |
| 端到端業務流程、功能完整性驗收 | **H-Director** | `acceptance` |

### Issue 格式

```markdown
## 驗證描述
[具體要驗證的內容與預期行為]

## 來源任務
T-{ID}：{任務名稱}

## 驗證步驟
1. [操作步驟 1]
2. [操作步驟 2]
3. [預期結果]

## 通過標準
- [ ] [標準 1]
- [ ] [標準 2]

## 依賴
- 前置任務：#[對應開發 Issue 編號]（功能完成後才可開始驗證）

## 標籤
- 優先級：P0 / P1
- 里程碑：M1 / M2 / M3 / M4
- 類型：verification
- 角色：H-Director, A-Main, A-Backend, A-Frontend, ...
- 審查類型：ux-review / review / acceptance
```

### 命名規範

標題格式：`[驗證] T-{ID} {驗證項目簡述}`

範例：
- `[驗證] T-201 Gemini/OpenAI 引擎整合測試` → 指派 H-Reviewer
- `[驗證] T-203 語音辨識瀏覽器相容性測試` → 指派 H-UxReviewer
- `[驗證] T-204 完整記帳流程操作驗證` → 指派 H-Director
- `[驗證] T-302 預算血條視覺效果驗收` → 指派 H-UxReviewer
- `[驗證] T-305 PWA 行動裝置安裝體驗` → 指派 H-UxReviewer

## Issue 生命週期與關閉規範

本節定義所有 Issue 類型的生命週期與關閉方式。Issue 一旦建立，**必須**以下列規範之一關閉，禁止無說明地直接關閉。

### Issue 類型總覽

| Issue 類型 | 標籤 | 建立者 | 關閉方式 | 關閉者 |
|-----------|------|--------|---------|--------|
| **開發任務** | `feature` / `infra` / `test` | AI 助手（P2） | PR 合併時自動關閉（`Closes #N`） | GitHub 自動 |
| **手動驗證** | `verification` | AI 助手（P2） | 審查者完成驗證後手動關閉，需附驗證結果 comment | H-Reviewer / H-UxReviewer / H-Director |
| **驗收門（⛳）** | `gate` | AI 助手（P2） | H-Director 驗收通過後手動關閉 | H-Director |
| **取消/延期** | 原標籤 + `wontfix` 或 `deferred` | — | 附說明原因後手動關閉 | H-Director |

### 開發任務 Issue 關閉

- **關閉方式**：在 PR 中使用 `Closes #N` 語法，PR 合併時 GitHub 自動關閉。
- **時機**：Phase 4 PR 合併時。
- **額外動作**：合併後更新 `02-Dev_Plan.md`，將 `- [ ]` 改為 `- [x]`。

### 手動驗證 Issue 關閉

- **前提**：對應的開發任務 Issue 已關閉（功能已合併至 main）。
- **流程**：
  1. 指派的審查角色（H-Reviewer / H-UxReviewer / H-Director）按 Issue 中的「驗證步驟」逐項操作
  2. 在 Issue 中留下**驗證結果 comment**，格式如下：
     ```
     ## 驗證結果
     - 驗證日期：YYYY-MM-DD
     - 驗證者：@username
     - 結果：✅ 通過 / ❌ 不通過
     - 備註：[觀察到的問題或確認事項]
     ```
  3. 若通過：關閉 Issue
  4. 若不通過：在 comment 中描述問題，**不關閉 Issue**，由 H-Director 決定是否建立修復 Issue

### 驗收門（⛳）Issue 關閉

- **前提**：該 Milestone 所有開發任務 Issue 與手動驗證 Issue 皆已關閉。
- **關閉者**：H-Director（唯一有權關閉驗收門的角色）。
- **流程**：
  1. H-Director 確認該 Milestone 所有 Issue（開發 + 驗證）皆已關閉
  2. H-Director 在 Issue 中留下驗收結論 comment
  3. 關閉驗收門 Issue，表示正式進入下一個 Milestone

### 取消或延期 Issue

- **適用情境**：需求變更導致 Issue 不再需要，或因優先級調整延期至未來 Milestone。
- **流程**：
  1. H-Director 決定取消或延期
  2. 加上 `wontfix`（取消）或 `deferred`（延期）標籤
  3. 在 Issue 中留下說明原因的 comment
  4. 關閉 Issue
  5. 若延期：在下一輪迭代的 Dev Plan 中重新規劃

### Issue 看板狀態流轉

| 狀態 | 說明 | 觸發時機 |
|------|------|---------|
| **Todo** | 待處理 | Issue 建立時 |
| **In Progress** | 進行中 | 開發者指派 Issue 給 AI / 審查者開始驗證 |
| **In Review** | 審查中 | PR 已建立 / 驗證結果待確認 |
| **Done** | 已完成 | Issue 關閉時 |

## 完成條件

- [ ] 所需 Labels（優先級、里程碑、類型、角色、審查類型）皆已建立
- [ ] 所需 Milestones 皆已建立
- [ ] Dev Plan 中的所有開發任務皆已轉為 GitHub Issues
- [ ] 所有 `👁️ 手動` 驗證項皆已建立獨立的驗證 Issues，並指派給正確的審查角色
- [ ] 每個 Milestone 的驗收門（⛳）皆已建立為 Issue
- [ ] 每個 Issue 皆有完整的驗收標準與標籤（含角色標籤）
- [ ] GitHub Project 已建立（或連結現有）且已連結至 Repo
- [ ] 所有 Issues 已加入 Project 看板
- [ ] Repo 的 Projects tab 可正確顯示該 Project

## GitHub Project 看板規範

### 建立與連結

Issues 全部建立完成後，**必須主動詢問開發者（導演）是否建立 GitHub Project 看板**。

- **Project 命名**：默認與 Repo 名稱相同（例如 repo 為 `vibe-money-book`，Project 名稱即為 `vibe-money-book`）
- **檢查現有 Project**：建立前先用 `gh project list --owner {owner}` 檢查是否已有同名 Project，避免重複建立
- **建立 Project**：使用 `gh project create --owner {owner} --title {repo-name}`
- **加入 Issues**：使用 `gh project item-add {project-number} --owner {owner} --url {issue-url}` 逐一加入
- **連結至 Repo**：**關鍵步驟！** 使用 `gh project link {project-number} --owner {owner} --repo {owner}/{repo}` 將 Project 連結至 Repo，否則 Repo 的 Projects tab 不會顯示該 Project
- **清理舊項目**：若 Project 中存在來自其他 Repo 的舊項目，應提醒開發者是否清理

### 常見問題

| 問題 | 原因 | 解法 |
|------|------|------|
| Repo Projects tab 顯示空白 | Project 未連結至 Repo | 執行 `gh project link` |
| 看板有不相關的項目 | Project 被多個 Repo 共用 | 用 `gh project item-delete` 移除舊項目 |
| Issues 未出現在看板上 | 未執行 `item-add` | 逐一加入 Issues |

## 行為指引

當使用者呼叫此 skill 時：

1. 先確認前置條件：檢查 `/docs` 下的規格文件是否存在
2. 若缺少前置文件，提示使用者先完成 Phase 1（`/vibe-sdlc-spec`）
3. 確認 `gh` CLI 已認證，詢問 GitHub repo 名稱（`{owner}/{repo}`）與 H-Director 的 GitHub username
4. 讀取 `02-Dev_Plan.md` 與 `/docs` 目錄下所有規格文件，確認已執行過完整性審核
5. 檢查審核報告 `03-Docs_Review_Report.md`，等待開發者確認
6. 開發者核准後，詢問要建立哪個里程碑的 Issues（或全部）
7. 建立所需的 Labels（優先級、里程碑、類型、角色）與 Milestones
8. 使用 `gh` CLI 逐一建立 Issues（可並行建立以提高效率），每批次回報進度
9. 全部建立完成後，列出總覽表，並**主動詢問開發者是否要建立 GitHub Project 看板**
10. 若同意，建立（或連結現有）Project → 加入 Issues → **連結至 Repo**（`gh project link`）
11. 提示開發者前往 Repo 的 Projects tab 確認看板，並告知可進入 Phase 3（`/vibe-sdlc-dev`）
