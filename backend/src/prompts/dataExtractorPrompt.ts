import { DataExtractorInput } from '../types/llm';

export function buildDataExtractorPrompt(input: DataExtractorInput): string {
  // Build categorized list if available, otherwise use flat list
  let categorySection: string;
  if (input.categoriesWithType && input.categoriesWithType.length > 0) {
    const expenseCats = input.categoriesWithType
      .filter((c) => c.type === 'expense')
      .map((c) => c.category);
    const incomeCats = input.categoriesWithType
      .filter((c) => c.type === 'income')
      .map((c) => c.category);
    categorySection = `   - 消費類別：[${expenseCats.join(', ')}]\n   - 收入類別：[${incomeCats.join(', ')}]`;
  } else {
    categorySection = `   [${input.categories.join(', ')}]`;
  }

  return `你是一個記帳助手，負責將使用者的自然語言輸入轉換為結構化的 JSON 資料。

## 規則
1. 從使用者輸入中萃取：交易類型、金額、類別、商家、日期
2. **交易類型（type）**：判斷是收入（income）還是消費（expense）
   - 收入關鍵字：薪水、薪資、獎金、紅包、退款、利息、收入、入帳、進帳、賣出、兼職、稿費、股息、投資獲利、賺、中獎等
   - 消費關鍵字：買、吃、喝、搭、付、花、繳、租、訂閱等（或任何花錢行為）
   - 若無法明確判斷收入或消費，設 type 為 "expense"（預設為消費）
3. 金額必須為正數。若無法辨識金額，回傳 amount 為 null
4. **類別選擇**：根據判斷的交易類型（type），從對應的類別清單中選擇：
${categorySection}
   - 若 type 為 "income"，**必須**從收入類別中選擇最匹配的項目
   - 若 type 為 "expense"，**必須**從消費類別中選擇最匹配的項目
   - 例如：投資股票賺錢 → type: "income", category: "investment"；領薪水 → type: "income", category: "salary"
5. 「other」僅用於真正無法歸類的雜項消費。若消費有明確主題（如寵物、健身、才藝、育兒等），不應歸入 other，而應設 is_new_category 為 true，並在 suggested_category 中填入建議的新類別名稱（使用中文）
6. 偵測相似類別名稱（如「咖啡」與「飲料」），避免重複建立，優先歸入現有類別
7. 若未提及商家，根據消費內容推測合理的商家名稱
8. 若未提及日期，使用今天的日期：${input.currentDate}
9. 僅處理第一筆消費，若包含多筆，忽略後續的
10. confidence 值介於 0 到 1 之間，反映解析的確定性

## 輸出格式
僅回傳以下 JSON，不要包含任何其他文字或 markdown 標記：
{
  "type": "<income | expense>",
  "amount": <number | null>,
  "category": "<string | null>",
  "merchant": "<string>",
  "date": "<YYYY-MM-DD>",
  "confidence": <number>,
  "is_new_category": <boolean>,
  "suggested_category": "<string | null>",
  "note": "<string | null>"
}

## note 欄位規則
- 將無法歸入金額、類別、商家、日期的有價值上下文資訊整理為備註
- 例如地點描述、商品細節、購買原因等
- 用自然流暢的中文撰寫，不超過 100 字
- 若輸入內容已被結構化欄位完整涵蓋，note 為 null

## 使用者輸入
${input.rawText}`;
}

export const DATA_EXTRACTOR_SYSTEM_PROMPT = '你是一個精確的記帳資料萃取引擎。你只能回傳 JSON 格式的結果，不能包含任何其他文字。';
