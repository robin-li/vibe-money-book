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
| `/vibe-sdlc` | — | 流程總覽與導航，判斷目前該進入哪個 Phase |
| `/vibe-sdlc-p1-spec` | Phase 1：規格定義 | 撰寫 / 審查 PRD、SRD、API Spec、Dev Plan |
| `/vibe-sdlc-p2-issues` | Phase 2：任務掛載 | 審核 Dev Plan → 自動建立 GitHub Issues |
| `/vibe-sdlc-p3-dev` | Phase 3：開發循環 | 領取 Issue → 實作 → 測試 → Vibe Check |
| `/vibe-sdlc-p4-pr` | Phase 4：自動化驗證 | 推送程式碼 → 建立 PR → 處理 CI 結果 |
| `/vibe-sdlc-p5-release` | Phase 5：交付與迭代 | 部署驗收 → 收集回饋 → 更新規格 |

---

## 典型工作流程

```
專案啟動
  └→ /vibe-sdlc-p1-spec        撰寫規格 → 交叉比對審查 → 定稿
      └→ /vibe-sdlc-p2-issues      審核計畫 → 建立 GitHub Issues
          └→ /vibe-sdlc-p3-dev          領取 Issue → 開發 → Vibe Check
              └→ /vibe-sdlc-p4-pr           推送 → PR → CI → Merge
                  └→ /vibe-sdlc-p3-dev          領取下一個 Issue ...（重複）
                      └→ ...
                          └→ /vibe-sdlc-p5-release  里程碑完成 → 部署 → 回饋
                              └→ /vibe-sdlc-p2-issues  下一輪迭代
```

---

## 各 Phase 詳細說明

### Phase 1：規格定義 (`/vibe-sdlc-p1-spec`)

建立專案的 **Single Source of Truth**。

- **交付物**：PRD (`01-1-PRD.md`)、SRD (`01-2-SRD.md`)、API Spec (`01-3-API_Spec.md` + `API_Spec.yaml`)、Dev Plan (`02-Dev_Plan.md`)
- **AI 職責**：協助撰寫規格、交叉比對四份文件找出不一致或遺漏、產出審查報告
- **Dev Plan 必含**：角色定義（Role Registry）、Gantt、任務清單（AI Sessions / HRH 估算）、並行群組 Mermaid 圖、Multi Sub Agent Git 協作策略（Worktree、分支命名、雙層 PR 審查、PR 範圍限制）
- **完成條件**：規格文件皆已提交至 `/docs`、審查報告無未解決項目、開發者確認定稿

### Phase 2：任務掛載 (`/vibe-sdlc-p2-issues`)

將 Dev Plan 轉換為 **可追蹤的 GitHub Issues**。

- **AI 職責**：審核 Dev Plan 完整性（交叉比對 SRD 非功能性需求）、依里程碑逐一建立 Issues
- **Issue 包含**：任務描述、驗收標準、技術參考、依賴關係、優先級與里程碑標籤
- **完成條件**：所有任務皆轉為 Issues、Projects 看板就緒

### Phase 3：開發循環 (`/vibe-sdlc-p3-dev`)

按 Issue 逐一完成開發，確保**本地驗證通過**才進入審核。

- **AI 職責**：讀取 Issue → 建立 feature 分支 → 參考 SRD / API Spec 實作 → 撰寫測試 → 報告 Vibe Check
- **分支命名**：`feature/issue-N-簡述`
- **完成條件**：功能程式碼完成、單元測試全部通過、開發者核准 Vibe Check

### Phase 4：自動化驗證 (`/vibe-sdlc-p4-pr`)

透過 **CI/CD 與 Code Review** 雙重門檻確保程式碼品質。

- **AI 職責**：推送程式碼、建立 PR（關聯 Issue）、CI 失敗時根據報告修正、Merge 後更新 Dev Plan
- **PR 包含**：變更摘要、關聯 Issue、變更清單、測試結果
- **Multi Sub Agent 雙層審查**：Sub Agent PR → CI → A-Main 初審（PR 範圍確認）→ H-Director 終審 & Merge；衝突由 A-Main rebase 解決
- **完成條件**：CI 綠燈、Code Review 核准、PR 合併、Dev Plan 更新

### Phase 5：交付與迭代 (`/vibe-sdlc-p5-release`)

里程碑完成後的**部署、驗收與回饋收集**。

- **AI 職責**：確認部署狀態、整理回饋、根據指示更新 PRD 與 Dev Plan
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
│   └── skill.md                     ← Phase 1：規格定義
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

### 場景一：新專案啟動 — 不確定從哪開始

```
> /vibe-sdlc
> 我剛建好 repo，docs 目錄是空的，接下來該怎麼做？
```

AI 會讀取專案狀態，判斷你處於 Phase 1，並建議你呼叫 `/vibe-sdlc-p1-spec` 開始撰寫規格。

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

**審核 Dev Plan 並建立 Issues：**

```
> /vibe-sdlc-p2-issues
> 規格已經定稿了，請先審核 Dev Plan 的完整性，然後幫我建立 GitHub Issues。
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

**駁回並要求修改：**

```
> 密碼雜湊請改用 bcrypt，不要用 SHA-256。修正後重新跑測試。
```

---

### 場景五：Phase 4 — 推送 PR

**請 AI 建立 PR：**

```
> /vibe-sdlc-p4-pr
> Vibe Check 通過了，請推送程式碼並建立 PR。
```

**CI 失敗時：**

```
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
