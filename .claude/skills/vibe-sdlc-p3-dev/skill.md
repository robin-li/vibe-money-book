---
name: vibe-sdlc-p3-dev
description: >
  Vibe-SDLC Phase 3：開發循環 (Execution Loop)。領取 Issue 進行開發、測試，並執行 Vibe Check。
  使用時機：日常開發，需要從看板領取 Issue 並實作功能。
user_invocable: true
---

# Phase 3：開發循環 (Execution Loop)

## 目的

按 Issue 順序逐一完成開發，確保每個任務皆通過本地驗證後才進入審核流程。

## 你的角色

你是 AI 助手（執行者）。在此階段你的職責是：
- 讀取指派的 Issue，確認理解任務範圍與驗收標準
- 從 `main` 建立 feature 分支
- 參考 SRD 技術規範與 API Spec 實作程式碼
- 撰寫並執行單元測試
- 向開發者報告 Vibe Check 結果

**你不應該**：
- 自行挑選 Issue，由開發者指派
- 跳過測試直接提交
- 在未獲開發者核准的情況下進入 Phase 4

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

## 操作步驟

| 步驟 | 執行者 | 操作 | 產出 |
|------|--------|------|------|
| 1 | **開發者** | 從看板 `Todo` 欄位挑選最高優先級 Issue，指派給 AI | — |
| 2 | **AI 助手** | 讀取 Issue 內容，確認理解任務範圍與驗收標準；將 Issue 在看板上移至 `In Progress` | 任務確認 |
| 3 | **AI 助手** | 從 `main` 建立 feature 分支（命名：`feat/<agent>/issue-N-簡述`） | feature 分支 |
| 4 | **AI 助手** | 參考 SRD 技術規範與 API Spec，實作功能程式碼 | 功能程式碼 |
| 5 | **AI 助手** | 撰寫對應的單元測試 | 測試程式碼 |
| 6 | **AI 助手** | 執行本地測試，確認全部通過 | 測試結果 |
| 7 | **AI 助手** | 向開發者報告本地驗證結果（Vibe Check） | 驗證報告 |
| 8 | **開發者** | 審閱 Vibe Check 結果，決定是否進入 Phase 4 | 核准 / 駁回 |
| — | *若駁回* | **開發者**指出問題，回到步驟 4 修正 | — |

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

## 完成條件

- [ ] 功能程式碼已完成且符合 SRD 規範
- [ ] 單元測試全部通過
- [ ] 開發者已核准 Vibe Check 結果

## 行為指引

當使用者呼叫此 skill 時：

1. 詢問開發者要處理哪個 Issue（編號或讓 AI 從看板挑選最高優先級）
2. 使用 `gh issue view N` 讀取 Issue 內容
3. 向開發者確認你對任務的理解，列出：
   - 任務範圍
   - 驗收標準
   - 需參考的規格文件
4. 獲得確認後，建立 feature 分支並開始實作
5. 實作過程中，參考 `/docs/01-2-SRD.md` 的技術規範與 `/docs/01-3-API_Spec.md` 的介面定義
6. 完成後撰寫測試並執行
7. 產出 Vibe Check 報告，等待開發者審閱
8. 若開發者核准，提示可進入 Phase 4（`/vibe-sdlc-p4-pr`）
9. 若開發者駁回，根據反饋修正後重新報告
