# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 專案概述

**Vibe Money Book** — 語音記帳應用，透過自然語言（語音或文字）實現「一句話記帳」。
具備個性化 AI 人設（毒舌、溫柔、情勒），在記帳的同時提供即時財務評論。

- **規格文件目錄**: `/docs/`
- **GitHub Repo**: `robin-li/vibe-money-book`
- **GitHub Project**: [Vibe Money Book](https://github.com/users/robin-li/projects/3)（Project #3，已連結至 Repo）
- **H-Director**: `robin-li`

---

## 目前進度

- [x] **Phase 1**：規格文件撰寫與審查 — 已完成（所有規格文件已定稿，v1.1）
- [x] **Phase 2**：任務掛載 — 已完成（Issues 已建立，Project 看板已連結）
- [x] **Phase 3-5**：M1~M4 開發循環 — 已完成（所有功能開發、測試、部署皆完成）
- [x] **M5 迭代**：語音/自然語義篩選查詢（PRD-F-014）— 已完成
  - T-501：AI 語義查詢 API（PR #131）
  - T-502：記錄頁語義查詢 UI（PR #132）
  - T-503：E2E 測試更新（PR #133）
  - 驗收通過（#130 closed）
- [x] **M6 迭代**：i18n 多語系支援（PRD-F-015）— 已完成（v1.1.0 + v1.2.0）
  - T-601：i18n 基礎建設（後端）（PR #148）
  - T-602：後端錯誤訊息多語化（PR #150）
  - T-603：AI Prompt 多語化（PR #150）
  - T-604：i18n 基礎建設（前端）（PR #149）
  - T-605：前端 UI 多語化（PR #151）
  - T-606：語言設定與偏好持久化（PR #151）
  - T-607：i18n E2E 測試（PR #152）
  - 額外修復：登入頁語系選擇(#155)、Note語言(#156)、語言偏好保留(#159)、分類語言(#160)
  - 額外修復：統計頁日期篩選(#161)、AI查詢範圍防護(#164)、同名類別支援(#167)、類別篩選(#169)
- [x] **M7 迭代**：統計頁互動 + AI 引擎進階設定（PRD-F-016、PRD-F-017）— 已完成
  - T-701：多供應商 LLM 引擎擴展（PR #176）
  - T-702：AI 供應商與模型 API（PR #178）
  - T-703：統計頁條狀圖交互展開（PR #180）
  - T-704：設定頁 AI 引擎進階設定 UI（PR #184）
  - T-705：M7 E2E 測試更新（PR #185）
  - 額外修復：動態模型清單(#187)、Key/Model 驗證區分(#188)、Anthropic 模型擴充(#191)、.env 模型過濾(#194)
  - 額外修復：語意查詢空結果訊息(#195)、預設引擎改 OpenAI(#196) — PR #197

---

## 通用要求

### 一般要求

1. 回覆時請儘量使用**繁體中文**，專有名詞可保留原
2. 文件格式我偏好 Markdown，若需描述流程圖或架構圖等請用Mermaid格式，並即時渲染成 png (或 jpg) 圖片，以利我筆記及閱讀。
3. 要請在要求我授權執行某些指令時，請**加上簡短的備註** (請儘量使用繁體中文進行備註)，說明這次指令的目的是什麼，備註內容儘量精簡，不要超過200字。
4. `.env` 含有敏感資訊，嚴格禁止 commit 或傳輸 ！
5. 技能的使用與修改，請以當前專案目錄下的技能`./.claude/skills/`為優先。
6. **即時回報分流（強制阻斷）**：當我直接描述 Bug、功能需求、改善建議時（包含但不限於「新增需求」「幫我改」「我想要」「加一個」「應該要」等措辭），**必須立即停止，禁止直接動手寫程式碼或修改檔案**，先顯示分流選單詢問處理方式：
   - 1️⃣ 小問題，直接修正（不建 Issue）
   - 2️⃣ 建立 Issue 後再修正
   - 3️⃣ 先記下來，待會一起建立 Issues

   **只有在我回覆選項後，才可開始實作。** 違反此規則等同流程失控。詳見 `.claude/skills/vibe-sdlc/skill.md` 的「即時回報分流」章節。

### Performance & Execution Efficiency

* **輸出持久化 (Output Persistence)**：
若某個指令（如 `curl`, `java`, `python`, 或 `sql`）的輸出結果需要透過 `grep`, `sed`, `awk`, 或 `jq` 進行多次分析，**務必**先將該輸出結果儲存至暫存檔中。
* **避免重複執行 (Avoid Redundant Execution)**：
若參數未曾變更，**請勿**重複執行相同的 `java` 或 `python` 腳本。在執行之前，請先檢查當前目錄下是否已存在先前生成的輸出檔案。
* **偏好的工作流程 (Preferred Workflow)**：
1. 執行高成本指令：`python script.py > temp_output.txt`
2. 進行多次分析：`grep "error" temp_output.txt`、`awk '{print $1}' temp_output.txt`
3. 當作業階段結束後再進行清理。


---

## 開發輔助技能

| 指令 | 說明 |
|------|------|
| `/local-tunnel` | 發佈本地前後端服務至公網，供遠端裝置測試（ngrok / Cloudflare Tunnel） |

---

## Vibe-SDLC 技能

本專案使用 Vibe-SDLC 流程管理開發：

技能所在目錄 `./.claude/skills/`

| 指令 | 說明 |
|------|------|
| `/vibe-sdlc` | 查看目前所在 Phase 與進度儀表板 |
| `/vibe-sdlc-spec` | Phase 1：規格文件撰寫與審查 |
| `/vibe-sdlc-issues` | Phase 2：將 Dev Plan 轉為 GitHub Issues |
| `/vibe-sdlc-dev` | Phase 3：開發循環（Sub Agents 並行） |
| `/vibe-sdlc-pr` | Phase 4：CI 監控、失敗修正與合併後作業 |
| `/vibe-sdlc-release` | Phase 5：回饋收集、Release 與迭代規劃 |
| `/vibe-sdlc-status` | Agent 狀態查詢與彙整（產出 `docs/status/STATUS.md`） |

### STATUS.md 版控模式

本專案採 **C（混合）** 模式：

- `docs/status/STATUS.md` **進版控**（跨機器可見、有歷史追溯）
- `docs/status/A-*.md` **加入 `.gitignore`**（Agent 個別狀態檔屬本地即時資訊，不納入版控）

詳見 `.claude/skills/vibe-sdlc-status/skill.md` §版控策略。