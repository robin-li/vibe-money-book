import { Persona, FinancialContext } from '../types/llm';

export interface ChatReplyInput {
  persona: Persona;
  rawText: string;
  financialContext: FinancialContext;
}

const PERSONA_CHAT_DEFINITIONS: Record<Persona, string> = {
  sarcastic: `你是一個毒舌的財務教練。你的風格是尖酸刻薄但有趣，用諷刺語氣回應使用者。
    - 回應要有趣且帶點嘲諷
    - 若話題與財務相關，用毒舌方式給建議
    - 若是閒聊，要幽默地把話題帶回記帳
    - 保持幽默感，不要真的傷人`,

  gentle: `你是一個溫柔體貼的財務教練。你的風格是溫暖鼓勵。
    - 用溫暖關心的語氣回應
    - 若話題與財務相關，溫柔地給建議
    - 若是閒聊，溫柔地提醒記帳
    - 偶爾給予正面肯定`,

  guilt_trip: `你是一個擅長情緒勒索的財務教練。你的風格是用愧疚感引導使用者。
    - 用讓人感到愧疚的方式回應
    - 若話題與財務相關，暗示不理財的後果
    - 若是閒聊，感性地提醒使用者注意財務
    - 不要太過分，保持可愛的情緒勒索風格`,
};

function formatAmount(amount: number, type?: 'income' | 'expense'): string {
  const prefix = type === 'income' ? '+' : type === 'expense' ? '-' : '';
  return `${prefix}${amount.toLocaleString('zh-TW')}`;
}

function buildFinancialContextBlock(ctx: FinancialContext): string {
  const usedPercent = Math.round(ctx.used_ratio * 100);

  let block = `## 使用者財務現況
- 總資產：${formatAmount(ctx.net_assets)} 元
- 本月收入：${formatAmount(ctx.total_income, 'income')} 元
- 本月支出：${formatAmount(ctx.total_expense, 'expense')} 元
- 月預算：${ctx.monthly_budget.toLocaleString('zh-TW')} 元
- 已消費：${ctx.spent_this_month.toLocaleString('zh-TW')} 元（${usedPercent}%）
- 預算剩餘：${ctx.remaining.toLocaleString('zh-TW')} 元`;

  if (ctx.recent_transactions.length > 0) {
    block += '\n\n## 近期帳目';
    ctx.recent_transactions.forEach((t, i) => {
      const sign = t.type === 'income' ? '+' : '-';
      const merchant = t.merchant || '';
      block += `\n${i + 1}. ${t.date} ${t.category} ${sign}${t.amount.toLocaleString('zh-TW')} ${merchant}`;
    });
  }

  return block;
}

export function buildChatReplyPrompt(input: ChatReplyInput & { aiInstructions?: string | null }): string {
  const financialBlock = buildFinancialContextBlock(input.financialContext);

  const aiInstructionsReminder = input.aiInstructions
    ? `\n\n## 注意：請務必遵從系統指示中的使用者自訂指示來調整你的回覆風格與內容。`
    : '';

  return `根據使用者的輸入，用你的角色風格回應。回覆要簡短有趣（80字以內）。
請根據使用者的真實財務狀況來回應，讓回覆更貼近使用者的實際情況。${aiInstructionsReminder}

${financialBlock}

## 使用者輸入
${input.rawText}

## 輸出格式
僅回傳以下 JSON，不要包含任何其他文字或 markdown 標記：
{
  "text": "<你的回應，80字以內>",
  "emotion_tag": "<情緒標籤>"
}`;
}

export function getChatPersonaSystemPrompt(persona: Persona): string {
  return PERSONA_CHAT_DEFINITIONS[persona] || PERSONA_CHAT_DEFINITIONS.gentle;
}
