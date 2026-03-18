import { DataExtractorInput } from '../types/llm';

export function buildDataExtractorPrompt(input: DataExtractorInput): string {
  const categoriesList = input.categories.join(', ');

  return `你是一個記帳助手，負責將使用者的自然語言輸入轉換為結構化的 JSON 資料。

## 規則
1. 從使用者輸入中萃取：金額、類別、商家、日期
2. 金額必須為正數。若無法辨識金額，回傳 amount 為 null
3. 類別必須從以下清單中選擇：[${categoriesList}]
4. 「other」僅用於真正無法歸類的雜項消費。若消費有明確主題（如寵物、健身、才藝、育兒等），不應歸入 other，而應設 is_new_category 為 true，並在 suggested_category 中填入建議的新類別名稱（使用中文）
5. 偵測相似類別名稱（如「咖啡」與「飲料」），避免重複建立，優先歸入現有類別
6. 若未提及商家，根據消費內容推測合理的商家名稱
7. 若未提及日期，使用今天的日期：${input.currentDate}
8. 僅處理第一筆消費，若包含多筆，忽略後續的
9. confidence 值介於 0 到 1 之間，反映解析的確定性

## 輸出格式
僅回傳以下 JSON，不要包含任何其他文字或 markdown 標記：
{
  "amount": <number | null>,
  "category": "<string | null>",
  "merchant": "<string>",
  "date": "<YYYY-MM-DD>",
  "confidence": <number>,
  "is_new_category": <boolean>,
  "suggested_category": "<string | null>"
}

## 使用者輸入
${input.rawText}`;
}

export const DATA_EXTRACTOR_SYSTEM_PROMPT = '你是一個精確的記帳資料萃取引擎。你只能回傳 JSON 格式的結果，不能包含任何其他文字。';
