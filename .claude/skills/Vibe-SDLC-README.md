# Vibe-SDLC Skills for Claude Code

> 將 Vibe-SDLC 流程封裝為 Claude Code 的 **Slash Command Skills**，讓 AI 助手在開發過程中依階段引導你完成整個軟體開發生命週期。

---

## 概述

Vibe-SDLC Skills 是一組可直接在 [Claude Code](https://claude.ai/code) 中呼叫的 Slash Command，對應 Vibe-SDLC 的五個開發階段。每個 skill 內建了：

- **角色定義**：AI 助手在該階段的職責與限制
- **操作步驟**：按步驟引導的標準作業流程
- **報告模板**：審查報告、Vibe Check、PR 等標準格式
- **前置 / 完成條件**：確保流程不被跳過

---

## Skills 一覽

| Slash Command | 階段 | 用途 |
|---------------|------|------|
| `/vibe-sdlc` | — | 進度儀表板（里程碑進度、待審 PR、待驗證 Issue）+ Phase 導航 |
| `/vibe-sdlc-p1-spec` | Phase 1：定義規格文件與計畫 | 撰寫 / 審查 PRD、SRD、API Spec、Dev Plan，產出完整性審查報告 |
| `/vibe-sdlc-p2-issues` | Phase 2：任務掛載 | 依 Dev Plan 建立 GitHub Issues，建立 Project 看板 |
| `/vibe-sdlc-p3-dev` | Phase 3：開發循環 | 領取 Issue → 實作 → 測試 → Vibe Check → 自動建 PR |
| `/vibe-sdlc-p4-pr` | Phase 4：CI 監控與合併後作業 | 監控 CI → 修正失敗 → Merge 後更新 Dev Plan |
| `/vibe-sdlc-p5-release` | Phase 5：交付與迭代 | 部署驗收 → 收集回饋 → 更新規格 |

---

## 典型工作流程

```
專案啟動
  └→ /vibe-sdlc-p1-spec        撰寫規格 → 交叉比對審查 → 定稿
      └→ /vibe-sdlc-p2-issues      審核計畫 → 建立 GitHub Issues
          └→ /vibe-sdlc-p3-dev          領取 Issue → 開發 → Vibe Check → 自動建 PR
              └→ /vibe-sdlc-p4-pr           監控 CI → 修正失敗 → Merge → 更新 Dev Plan
                  └→ /vibe-sdlc-p3-dev          領取下一個 Issue ...（重複）
                      └→ ...
                          └→ /vibe-sdlc-p5-release  里程碑完成 → 部署 → 回饋
                              └→ /vibe-sdlc-p2-issues  下一輪迭代
```

---

## 各 Phase 詳細說明

### Phase 1：定義規格文件與計畫 (`/vibe-sdlc-p1-spec`)

建立專案的 **Single Source of Truth**。

- **交付物**：
  - PRD (`01-1-PRD.md`)：產品需求文件，偏重產品面或客戶的需求
  - SRD (`01-2-SRD.md`)：系統需求文件，偏重技術棧、安全及性能要求
  - API Spec (`01-3-API_Spec.md` + `API_Spec.yaml`)：API 介面規格說明與 OpenAPI 合約
  - UI/UX 設計文件 (`01-4-UI_UX_Design.md`)：視覺與互動設計規格（如適用）
  - Dev Plan (`02-Dev_Plan.md`)：里程碑、任務拆解、依賴關係
  - 審查報告 (`03-Docs_Review_Report.md`)：交叉比對結果、不一致與遺漏項目
  - CI/CD 規格 (`04-CI_CD_Spec.md`)：CI Workflow 定義、品質閘門、Docker 部署配置（選用，複雜專案建議獨立）
- **AI 職責**：協助撰寫與優化規格、交叉比對所有規格文件找出不一致或遺漏、產出完整性審查報告
- **Dev Plan 格式**：角色定義（Role Registry）、里程碑 Gantt、任務清單（含 AI Sessions / HRH 工作量估算）、任務詳細描述、並行群組視覺化（Mermaid）、技術棧、風險、Vibe Check 計畫、溝通協作
- **Dev Plan 設計原則**：
  - CI/CD 時序原則：CI Workflow 必須在 M1 建立，正確依賴鏈為 `骨架任務 → CI 任務 → 功能開發任務`
  - Bootstrap PR 規則：CI 建立前的初始化 PR 由 H-Director 直接審查合併
  - 手動驗證任務：`👁️ 手動` 驗證項應建立獨立 Issue，指派給對應審查角色
  - 同 Agent 多任務合併：同一並行群組中同 Agent 的多個無依賴任務應合併為一個 PR
- **Multi Sub Agent 協作規範**（Dev Plan 必含）：Worktree 使用（每 Sub Agent 獨立 Worktree）、分支命名 `feat/<agent>/<issue-N>-<簡述>`、雙層 PR 審查（A-Main 初審 → H-Director 終審）、PR 範圍限制、Bootstrap 階段特殊處理
- **完成條件**：規格文件皆已提交至 `/docs`、審查報告無未解決項目、開發計畫合理可行、開發者確認定稿
- **參考範例**：`vibe-sdlc-p1-spec/examples/docs/`

### Phase 2：任務掛載 (`/vibe-sdlc-p2-issues`)

將 Dev Plan 轉換為 **可追蹤的 GitHub Issues**，並建立 Project 看板。

- **AI 職責**：確認 P1 審查報告通過 → 建立 Labels 與 Milestones → 依里程碑建立開發 Issues → 掃描 `👁️ 手動` 驗證項建立驗證 Issues → 建立 Project 看板
- **Issue 包含**：任務描述、任務編號（對應 Dev Plan）、主要步驟、驗收標準、技術參考、依賴關係、PR 策略、優先級（P0–P3）與里程碑標籤
- **手動驗證 Issue**：每個 `👁️ 手動` 驗證項建立獨立 Issue，指派給對應審查角色（H-UxReviewer / H-Reviewer / H-Director）
- **Issue 生命週期**：開發任務由 PR `Closes #N` 自動關閉；手動驗證由審查者附驗證結果後關閉；驗收門由 H-Director 關閉
- **GitHub Project 看板**：建立後必須使用 `gh project link` 連結至 Repo
- **完成條件**：所有開發任務與驗證 Issues 皆已建立、Labels / Milestones 就緒、Projects 看板已連結至 Repo

### Phase 3：開發循環 (`/vibe-sdlc-p3-dev`)

按 Issue 逐一完成開發，Vibe Check 通過後**自動建立 PR**。

- **AI 職責**：讀取 Issue → 建立 feature 分支 → 參考 SRD / API Spec 實作 → 撰寫測試 → 報告 Vibe Check → **核准後自動推送分支並建立 PR**
- **分支命名**：`feat/<agent>/issue-N-簡述`
- **PR 自動建立**：Vibe Check 通過且開發者核准後，AI 自動推送分支、建立 PR（含 `Closes #N`）、回報 PR 連結，無需額外呼叫 `/vibe-sdlc-p4-pr`
- **Sub Agent 情境**：每個 Sub Agent 獨立 session、獨立 Worktree、最小 context 原則（僅讀取任務所需規格）、跨代理透過 GitHub Comments 溝通、操作範圍限於負責目錄
- **完成條件**：功能程式碼完成、單元測試全部通過、開發者核准 Vibe Check、PR 已建立

### Phase 4：CI 監控與合併後作業 (`/vibe-sdlc-p4-pr`)

監控 PR 的 CI 結果，處理失敗修正，並在合併後執行後續作業。

> **注意**：PR 的建立已在 Phase 3 中自動完成。Phase 4 僅在需要處理 CI 失敗或 Merge 後作業時使用。

- **AI 職責**：監控 CI 結果、CI 失敗時修正程式碼並重新提交、Merge 後更新 Dev Plan、提醒手動驗證
- **Multi Sub Agent 雙層審查**：Sub Agent 提交 PR → GitHub CI 自動檢查 → A-Main 初審（確認 PR 範圍僅限負責目錄）→ H-Director 終審 & Merge；合併衝突由 A-Main 負責 rebase 解決
- **手動驗證提醒**：Merge 後若該任務有對應的 `verification` Issue，提醒開發者通知審查角色開始驗證
- **完成條件**：CI 綠燈、Code Review 核准、PR 合併、Dev Plan 更新

### Phase 5：交付與迭代 (`/vibe-sdlc-p5-release`)

里程碑完成後的**部署、驗收與回饋收集**。

- **前置條件**：所有開發任務 Issues 已合併、所有手動驗證 Issues 已由審查角色關閉（附驗證結果）、Dev Plan 任務已標記完成
- **AI 職責**：確認部署狀態（分別檢查開發任務、手動驗證、驗收門三類 Issue）、整理回饋、根據指示更新 PRD 與 Dev Plan
- **產出**：里程碑完成確認報告、迭代回饋整理
- **完成條件**：部署成功、驗收通過、回饋已反映至規格文件

---

## 部署方式

Claude Code 的 skills 要求每個 skill 為獨立子目錄，內含 `skill.md`。支援三種部署位置：

### 全域部署（所有專案可用）

```bash
cp -r skills/vibe-sdlc* ~/.claude/skills/
```

### 專案層級部署（僅限特定專案）

```bash
# 在目標專案根目錄下執行
mkdir -p .claude/skills
cp -r /path/to/Vibe-SDLC/skills/vibe-sdlc* .claude/skills/
```

### 共享部署（團隊共用，納入版本控制）

```bash
mkdir -p .claude/skills
cp -r /path/to/Vibe-SDLC/skills/vibe-sdlc* .claude/skills/
git add .claude/skills/
git commit -m "Add Vibe-SDLC skills for AI-assisted development workflow"
```

部署後輸入 `/vibe-sdlc` 驗證，若看到流程總覽表示成功。

---

## 目錄結構

```
skills/
├── README.md                        ← 本說明文件
├── DEPLOY.md                        ← 部署詳細說明
├── vibe-sdlc/
│   └── skill.md                     ← 總覽與導航
├── vibe-sdlc-p1-spec/
│   ├── skill.md                     ← Phase 1：定義規格文件與計畫
│   └── examples/docs/               ← 規格文件範例
│       ├── 01-1-PRD.md              ← 產品需求文件範例
│       ├── 01-2-SRD.md              ← 系統需求文件範例
│       ├── 01-3-API_Spec.md         ← API 介面規格範例
│       ├── 01-4-UI_UX_Design.md     ← UI/UX 設計文件範例
│       ├── 02-Dev_Plan.md           ← 開發計畫範例
│       ├── 03-Docs_Review_Report.md ← 規格審查報告範例
│       ├── 04-CI_CD_Spec.md         ← CI/CD 規格文件範例
│       └── API_Spec.yaml            ← OpenAPI 合約範例
├── vibe-sdlc-p2-issues/
│   └── skill.md                     ← Phase 2：任務掛載
├── vibe-sdlc-p3-dev/
│   └── skill.md                     ← Phase 3：開發循環
├── vibe-sdlc-p4-pr/
│   └── skill.md                     ← Phase 4：自動化驗證
└── vibe-sdlc-p5-release/
    └── skill.md                     ← Phase 5：交付與迭代
```

---

## 使用範例

以下展示開發者（導演）在各階段如何下 prompt 與 AI 助手互動。

### 場景一：查看專案進度 — 進度儀表板

```
> /vibe-sdlc
```

AI 會自動收集 GitHub Issues、PR、CI 狀態等數據，產出**進度儀表板**，包含：
- 各里程碑完成進度（進度條 + 百分比）
- 待審 PR 與 CI 狀態
- 進行中 Issue 與待驗證 Issue
- 最近合併的 PR
- 判斷當前 Phase 並給出具體建議

適合在每天開工前、不確定下一步該做什麼時使用。

---

### 場景二：Phase 1 — 撰寫規格文件

**從零開始撰寫 PRD：**

```
> /vibe-sdlc-p1-spec
> 我要開發一個 Todo List API，支援 CRUD 操作，使用者需登入才能存取自己的待辦事項。
> 請幫我撰寫 PRD。
```

**已有規格，請求交叉審查：**

```
> /vibe-sdlc-p1-spec
> 我已經把 PRD、SRD、API Spec、Dev Plan 都放在 /docs 下了，請進行交叉比對審查。
```

**針對審查結果修正：**

```
> 審查報告第 3 項提到 SRD 缺少 rate limiting 規格，請幫我補上，
> 限制為每個使用者每分鐘 60 次請求。
```

---

### 場景三：Phase 2 — 建立 GitHub Issues

**審核 Dev Plan 並建立 Issues（審查報告通過後）：**

```
> /vibe-sdlc-p2-issues
> 規格已經定稿了，審查報告也確認無誤，請幫我建立 GitHub Issues。
```

**只建立特定里程碑的 Issues：**

```
> /vibe-sdlc-p2-issues
> 先只建 Milestone 1 的 Issues 就好，M2 之後的等 M1 完成再說。
```

---

### 場景四：Phase 3 — 日常開發循環

**指派 Issue 給 AI 開發：**

```
> /vibe-sdlc-p3-dev
> 請處理 Issue #5，實作使用者註冊 API。
```

**AI 完成後會產出 Vibe Check 報告，你審閱後回應：**

```
> Vibe Check 看起來沒問題，但我想追加一個測試案例：
> 當 email 格式不正確時應回傳 400 Bad Request。請補上後再報一次。
```

**核准後 AI 自動建 PR：**

```
> LGTM，核准。
```

AI 會自動推送分支、建立 PR（含 `Closes #N`）、回報 PR 連結，無需額外呼叫 `/vibe-sdlc-p4-pr`。

**駁回並要求修改：**

```
> 密碼雜湊請改用 bcrypt，不要用 SHA-256。修正後重新跑測試。
```

---

### 場景五：Phase 4 — CI 監控與合併後作業

**CI 失敗時（PR 已由 Phase 3 自動建立）：**

```
> /vibe-sdlc-p4-pr
> CI 掛了，這是錯誤報告：[貼上 CI 錯誤訊息]
> 請分析原因並修正。
```

**Merge 後更新進度：**

```
> PR 已經 merge 了，請更新 Dev Plan 的任務狀態。
> 看板上還有 Issue 嗎？有的話繼續處理下一個。
```

---

### 場景六：Phase 5 — 里程碑交付

**確認里程碑完成狀態：**

```
> /vibe-sdlc-p5-release
> M1 的所有 Issue 應該都 merge 了，請確認一下並產出完成報告。
```

**提供回饋並啟動下一輪迭代：**

```
> 測試環境跑過了，有幾個回饋：
> 1. 列表頁需要分頁功能（新需求）
> 2. 刪除操作應改為軟刪除（需求變更）
> 3. 登入頁的文案不好看（暫不處理）
> 請幫我整理並更新 PRD 和 Dev Plan。
```

---

### 場景七：Multi Sub Agent 並行開發

**讓 AI 產生含 Git 協作策略的 Dev Plan：**

```
> /vibe-sdlc-p1-spec
> Dev Plan 請採用 Multi Sub Agent 架構，包含 A-Backend、A-Frontend、A-QA、A-DevOps，
> 並依照規範加入 Worktree 配置與雙層 PR 審查流程。
```

**Sub Agent 的 Vibe Check 通過後自動建 PR：**

```
> /vibe-sdlc-p3-dev
> 我是 A-Backend，請處理 Issue #12，實作 Auth API。
（AI 完成開發 → Vibe Check → 核准後自動建 PR）
```

**A-Main 監控 CI 並協調合併：**

```
> /vibe-sdlc-p4-pr
> PR #34 的 CI 已通過，A-Main 初審確認範圍正確（僅修改 /backend/**），
> 請 H-Director 進行終審。
```

---

### 提示技巧

| 技巧 | 說明 | 範例 |
|------|------|------|
| **明確指派** | 告訴 AI 處理哪個 Issue | `請處理 Issue #12` |
| **給定約束** | 指定技術選型或限制 | `使用 PostgreSQL，不要用 SQLite` |
| **分段操作** | 一次只做一個階段 | `先只審核 Dev Plan，不要建 Issues` |
| **引用規格** | 指向特定文件章節 | `參考 SRD 3.2 節的安全要求` |
| **附上上下文** | 貼上錯誤訊息或截圖 | `CI 報錯了：[錯誤訊息]` |
| **批次確認** | 一次核准多項操作 | `審查報告的建議全部接受，請一次修正` |

---

## 前置需求

- [Claude Code](https://claude.ai/code) CLI
- [GitHub CLI (`gh`)](https://cli.github.com/)：Phase 2 建立 Issues、Phase 4 建立 PR 時需要
- 專案使用 GitHub 作為版本管理與 CI/CD 平台

---

## 相關資源

- [Vibe-SDLC SOP 完整文件](../Vibe-SDLC.md)：流程規範的完整定義
- [DEPLOY.md](./DEPLOY.md)：部署方式的詳細說明
