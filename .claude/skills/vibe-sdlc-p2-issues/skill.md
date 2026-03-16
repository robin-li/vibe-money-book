---
name: vibe-sdlc-p2-issues
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
  - `/docs/01-3-API_Spec.md`
  - `/docs` 目錄下其它所有規格文件，例如 `API_Spec.yaml`、`01-4-UI_UX_Spec.md` 等
  - `/docs/02-Dev_Plan.md`
- GitHub Projects 看板已建立

## 操作步驟

| 步驟 | 執行者 | 操作 | 產出 |
|------|--------|------|------|
| 1 | **AI 助手** | 確認 P1 審查報告 (`03-Docs_Review_Report.md`) 已通過，無未解決的遺漏項目 | 確認結果 |
| 2 | **開發者** | 指示 AI 按里程碑建立 Issues | — |
| 3 | **AI 助手** | 依 Dev Plan 逐一建立 GitHub Issues，每個 Issue 包含：標題、描述、優先級標籤、里程碑標籤、依賴關係說明 | GitHub Issues |
| 4 | **GitHub** | 自動將 Issues 同步至 Projects 看板 | 看板就緒 |
| 5 | **開發者** | 確認看板上的 Issue 清單與排序是否正確 | 最終確認 |

## Issue 格式規範

建立每個 Issue 時，**必須**使用以下格式：

```markdown

## 任務描述
[具體要實作的功能或工作內容]

## 任務編號
[任務編號：原先在 Dev Plan 中的任務編號，如 T-XXX]

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
```


## 完成條件

- [ ] Dev Plan 中的所有任務皆已轉為 GitHub Issues
- [ ] 每個 Issue 皆有完整的驗收標準與標籤
- [ ] Projects 看板已正確顯示所有 Issues

## 行為指引

當使用者呼叫此 skill 時：

1. 先確認前置條件：檢查 `/docs` 下的規格文件是否存在
2. 若缺少前置文件，提示使用者先完成 Phase 1（`/vibe-sdlc-p1-spec`）
3. 讀取 `02-Dev_Plan.md` 與 `/docs` 目錄下所有規格文件，確認已執行過完整性審核
4. 檢查審核報告 `03-Docs_Review_Report.md`，等待開發者確認
5. 開發者核准後，詢問要建立哪個里程碑的 Issues（或全部）
6. 使用 `gh` CLI 逐一建立 Issues，每建立一個即回報
7. 全部建立完成後，提示開發者確認看板，並告知可進入 Phase 3（`/vibe-sdlc-p3-dev`）
