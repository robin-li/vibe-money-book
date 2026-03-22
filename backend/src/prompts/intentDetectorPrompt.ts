export function buildIntentDetectorPrompt(rawText: string): string {
  return `判斷以下使用者輸入的意圖。使用者可能使用任何語言（繁體中文、簡體中文、英文、越南文等）。

## 意圖分類
1. **transaction**：使用者想要記帳（記錄收入或消費）。通常包含金額、商家、消費行為等資訊。
   - 範例：「中午吃拉麵 280 元」、「薪水入帳 50000」、「搭計程車 350」
   - English: "Lunch ramen $280", "Salary deposit 50000", "Taxi $350"
   - Tiếng Việt: "Ăn trưa phở 50k", "Lương tháng 10 triệu"
2. **chat**：使用者想要對話、查詢、閒聊，或詢問財務問題。不是要記帳。
   - 範例：「目前還有多少預算可以使用」、「今天天氣真好」、「我這個月花太多了嗎」
   - English: "How much budget left?", "Am I overspending?"
   - Tiếng Việt: "Còn bao nhiêu ngân sách?", "Tháng này tôi tiêu nhiều quá không?"

## 判斷規則
- 若輸入明確包含**金額**和**消費/收入行為**，判定為 transaction
- 若輸入是問句、閒聊、查詢資訊、抱怨、感嘆等，判定為 chat
- 若無法確定，偏向 transaction（避免遺漏記帳）

## 輸出格式
僅回傳以下 JSON，不要包含任何其他文字或 markdown 標記：
{
  "intent": "<transaction | chat>"
}

## 使用者輸入
${rawText}`;
}

export const INTENT_DETECTOR_SYSTEM_PROMPT = '你是一個意圖分類引擎。你只能回傳 JSON 格式的結果，不能包含任何其他文字。你能理解多種語言的輸入（繁體中文、簡體中文、英文、越南文等）。';
