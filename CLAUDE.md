# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 專案概述

**Vibe Money Book** — 語音記帳應用，透過自然語言（語音或文字）實現「一句話記帳」。
具備個性化 AI 人設（毒舌、溫柔、情勒），在記帳的同時提供即時財務評論。

- **規格文件目錄**: `/docs/`
- **GitHub Repo**: `robin-li/vibe-money-book2`
- **GitHub Project**: [Vibe Money Book](https://github.com/users/robin-li/projects/3)（Project #3，已連結至 Repo）
- **H-Director**: `robin-li`

---

## 目前進度

- [x] **Phase 1**：規格文件撰寫與審查 — 已完成（所有規格文件已定稿）
- [x] **Phase 2**：任務掛載 — 已完成（19 個 Issues #1~#19 已建立，Project 看板已連結）
- [ ] **Phase 3**：開發循環 — 待開始

---

## 通用要求

### 一般要求

1. 回覆時請儘量使用**繁體中文**，專有名詞可保留原
2. 文件格式我偏好 Markdown，若需描述流程圖或架構圖等請用Mermaid格式，並即時渲染成 png (或 jpg) 圖片，以利我筆記及閱讀。
3. 要請在要求我授權執行某些指令時，請**加上簡短的備註** (請儘量使用繁體中文進行備註)，說明這次指令的目的是什麼，備註內容儘量精簡，不要超過200字。
4. `.env` 含有敏感資訊，嚴格禁止 commit 或傳輸 ！

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

## Vibe-SDLC 技能

本專案使用 Vibe-SDLC 流程管理開發：

| 指令 | 說明 |
|------|------|
| `/vibe-sdlc` | 查看目前所在 Phase |
| `/vibe-sdlc-p1-spec` | Phase 1：規格文件撰寫與審查 |
| `/vibe-sdlc-p2-issues` | Phase 2：將 Dev Plan 轉為 GitHub Issues |
| `/vibe-sdlc-p3-dev` | Phase 3：開發循環（Sub Agents 並行） |
| `/vibe-sdlc-p4-pr` | Phase 4：PR 審查與合併 |
| `/vibe-sdlc-p5-release` | Phase 5：Release 準備 |