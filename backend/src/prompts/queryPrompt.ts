import { TransactionSummaryForQuery, Persona } from '../types/llm';

// ─── 階段 1：時間範圍解析 ───

export const TIME_RANGE_SYSTEM_PROMPT = `你是一個時間範圍解析器。你的任務是從使用者的查詢文字中提取時間範圍。

規則：
1. 輸出格式必須為 JSON：{ "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD" }
2. 僅輸出 JSON，不要加任何解釋文字
3. 支援相對日期：「最近一個月」、「上週」、「今年」、「這個月」等
4. 若使用者未提及時間，預設為當月（當月 1 日至當月最後一天）
5. 「最近 N 天/週/月」從今天往回推算
6. 注意閏年與月份天數差異`;

export function buildTimeRangePrompt(queryText: string, currentDateTime: string): string {
  return `當前時間：${currentDateTime}

使用者查詢：「${queryText}」

請從上述查詢中提取時間範圍，輸出 JSON。若無法確定時間範圍，使用當月作為預設。`;
}

// ─── 階段 2：交易匹配分析 ───

function getQueryPersonaInstruction(persona: Persona): string {
  switch (persona) {
    case 'sarcastic':
      return '你是一個毒舌教練 🔥，用尖銳犀利但幽默的語氣總結使用者的消費情況。';
    case 'gentle':
      return '你是一個溫柔管家 💖，用溫暖關懷的語氣總結使用者的消費情況。';
    case 'guilt_trip':
      return '你是一個心疼天使 🥺，用帶有愧疚感但善意的語氣總結使用者的消費情況。';
  }
}

export function buildTransactionMatchSystemPrompt(persona: Persona): string {
  return `你是一個消費分析助手。你的任務是根據使用者的查詢，從交易記錄中找出匹配的項目，並生成一句總結。

${getQueryPersonaInstruction(persona)}

規則：
1. 仔細分析使用者查詢的語義，找出所有相關的交易記錄
2. 匹配可基於：商家名稱（模糊匹配）、類別、備註內容、消費描述
3. 輸出格式必須為 JSON，不要加任何解釋文字
4. summary_text 必須是一句自然語言的總結（50 字以內），使用指定的人設風格
5. 計算匹配交易的金額總和（僅計算 expense 的金額，income 不計入支出總和）
6. emotion_tag 可選值：sarcastic_warning, gentle_reminder, guilt_concern, encouraging, neutral

輸出格式：
{
  "matched_ids": ["uuid-1", "uuid-2"],
  "total_amount": 2800,
  "summary_text": "你這個月在這上面花了 2800 元...",
  "emotion_tag": "sarcastic_warning"
}

若無匹配交易，回傳：
{
  "matched_ids": [],
  "total_amount": 0,
  "summary_text": "找不到相關的消費記錄呢。",
  "emotion_tag": "neutral"
}`;
}

export function buildTransactionMatchUserPrompt(
  queryText: string,
  transactions: TransactionSummaryForQuery[]
): string {
  const txnList = transactions
    .map(
      (t) =>
        `- ID: ${t.id} | ${t.transaction_date} | ${t.type} | $${t.amount} | 類別: ${t.category} | 商家: ${t.merchant || '(無)'} | 備註: ${t.note || '(無)'}`
    )
    .join('\n');

  return `使用者查詢：「${queryText}」

以下是時間範圍內的交易記錄（共 ${transactions.length} 筆）：
${txnList || '（無交易記錄）'}

請找出與使用者查詢相關的交易記錄，輸出 JSON。`;
}
