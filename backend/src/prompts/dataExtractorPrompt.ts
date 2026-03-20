import { DataExtractorInput } from '../types/llm';

export function buildDataExtractorPrompt(input: DataExtractorInput): string {
  // Build categorized list if available, otherwise use flat list
  // Category name mapping for display in prompt
  const categoryNames: Record<string, string> = {
    entertainment: '娛樂', food: '飲食', daily: '日用品', education: '教育',
    medical: '醫療', transport: '交通', pets: '寵物用品', other: '其它', adjustment_expense: '帳務調整',
    salary: '薪資收入', investment: '投資收益', pension: '退休金', insurance: '保險理賠',
    other_income: '其它', adjustment_income: '帳務調整',
  };
  const formatCat = (key: string) => {
    const name = categoryNames[key];
    return name && name !== key ? `${key}(${name})` : key;
  };

  let categorySection: string;
  if (input.categoriesWithType && input.categoriesWithType.length > 0) {
    const expenseCats = input.categoriesWithType
      .filter((c) => c.type === 'expense')
      .map((c) => formatCat(c.category));
    const incomeCats = input.categoriesWithType
      .filter((c) => c.type === 'income')
      .map((c) => formatCat(c.category));
    categorySection = `   - 消費類別：[${expenseCats.join(', ')}]\n   - 收入類別：[${incomeCats.join(', ')}]`;
  } else {
    categorySection = `   [${input.categories.map(formatCat).join(', ')}]`;
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
5. **類別匹配與新類別建議（重要！必須嚴格遵守）**：
   - **第一步：優先匹配現有類別**。遍歷類別清單，若有語義上匹配的項目（包括自訂類別），直接使用該 category，設 catalogtype_confidence 為匹配程度，is_new_category = false
     例如：類別清單有「戶外運動」→ 輸入「攀岩」→ 直接選 category: "戶外運動", catalogtype_confidence: 0.9, is_new_category: false
   - **第二步：若第一步找不到匹配度 >= 0.8 的現有類別**，才評估是否建議新類別
   - **若 catalogtype_confidence < 0.8，你必須設定 is_new_category = true，並在 suggested_category 填入建議的中文類別名稱**。這是強制規則，不可忽略。
   - 「other」僅用於完全無法歸類的雜項。若消費有任何明確主題，都應建議新類別
   - 範例：
     ✓ 攀岩 → 清單有「戶外運動」→ category: "戶外運動", catalogtype_confidence: 0.9, is_new_category: false（正確！優先匹配現有類別）
     ✗ 飛行傘 → category: "entertainment", catalogtype_confidence: 0.5, is_new_category: false（錯誤！0.5 < 0.8 必須建議新類別）
     ✓ 飛行傘 → category: "entertainment", catalogtype_confidence: 0.5, is_new_category: true, suggested_category: "戶外運動"（正確）
     ✓ 吃拉麵 → category: "food", catalogtype_confidence: 1.0, is_new_category: false（正確）
     ✗ 健身房 → category: "entertainment", catalogtype_confidence: 0.6, is_new_category: false（錯誤！0.6 < 0.8）
     ✓ 健身房 → category: "entertainment", catalogtype_confidence: 0.6, is_new_category: true, suggested_category: "健身"（正確）
     ✗ 逛街 → suggested_category: "休閒娛樂"（錯誤！「休閒娛樂」與現有「entertainment(娛樂)」語義重複，應直接使用 entertainment）
     ✓ 逛街 → category: "entertainment", catalogtype_confidence: 0.85, is_new_category: false（正確！逛街屬於娛樂範疇）
6. **相似類別去重（必須遵守）**：建議新類別前，必須檢查 suggested_category 是否與現有類別語義重複或為其同義詞。若重複，直接使用現有類別，不建議新類別。
   - 例如：「休閒娛樂」≈「entertainment(娛樂)」→ 直接用 entertainment
   - 例如：「飲料」≈「food(飲食)」→ 直接用 food
   - 例如：「出行」≈「transport(交通)」→ 直接用 transport
7. 若未提及商家，根據消費內容推測合理的商家名稱。若不適用商家概念（如帳務調整、轉帳、調帳等），merchant 填入空字串 ""
8. 日期推算規則：
   - 現在是 ${input.currentDateTime}
   - 若未提及日期，使用今天的日期
   - 「周X」或「星期X」指最近的**過去**該星期X（含今天）。例如今天是周五，「周二」= 本周二（3天前）
   - 「昨天」= 今天減 1 天，「前天」= 今天減 2 天
   - 「上周X」= 上一個完整周的星期X（7天前的那一周）
   - 日期不可為未來日期
9. 僅處理第一筆消費，若包含多筆，忽略後續的
10. confidence 值介於 0 到 1 之間，反映解析的確定性
${input.aiInstructions ? `\n## 使用者自訂指示（請優先遵從）\n${input.aiInstructions}\n` : ''}
## 輸出格式
僅回傳以下 JSON，不要包含任何其他文字或 markdown 標記。各欄位說明如下：

| 欄位 | 型別 | 說明 |
|------|------|------|
| type | "income" 或 "expense" | 交易類型：income（收入）或 expense（消費），依規則2判斷交易類型 |
| amount | number 或 null | 交易金額：正數金額，無法辨識則為 null |
| category | string | 交易分類(交易子類別)：依 type 從對應類別清單選擇（見規則4） |
| merchant | string | 商家名稱：未提及則推測（見規則7） |
| date | "YYYY-MM-DD" | 交易日期：依日期推算規則計算（見規則8） |
| confidence | number (0-1) | 解析確定性：0~1之間，越接近1代表越確定 （見規則10）|
| catalogtype_confidence | number (0-1) | 類別匹配度：所選 category 與使用者輸入內容的語義匹配程度。1.0=完全匹配（如「拉麵」→food），0.5=勉強匹配（如「飛行傘」→entertainment），0=完全不匹配 |
| is_new_category | boolean | **強制規則：catalogtype_confidence < 0.8 時必須為 true**（見規則5） |
| suggested_category | string 或 null | is_new_category 為 true 時，填入建議的中文類別名稱 |
| note | string 或 null | 備註：無法歸入結構化欄位的有價值上下文（店名、地點、對象、購買原因等），不超過100字，若已完整涵蓋則為 null |

JSON 結構：
{
  "type": "",
  "amount": 0,
  "category": "",
  "merchant": "",
  "date": "",
  "confidence": 0,
  "catalogtype_confidence": 0,
  "is_new_category": false,
  "suggested_category": null,
  "note": null
}

## 使用者輸入
${input.rawText}`;
}

export const DATA_EXTRACTOR_SYSTEM_PROMPT = '你是一個精確的記帳資料萃取引擎。你只能回傳 JSON 格式的結果，不能包含任何其他文字。';
