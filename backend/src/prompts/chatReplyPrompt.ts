import { Persona, BudgetContext } from '../types/llm';

export interface ChatReplyInput {
  persona: Persona;
  rawText: string;
  budgetContext: BudgetContext;
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

export function buildChatReplyPrompt(input: ChatReplyInput): string {
  const { budgetContext } = input;
  const usedPercent = Math.round(budgetContext.used_ratio * 100);

  return `根據使用者的輸入，用你的角色風格回應。回覆要簡短有趣（80字以內）。

## 使用者的預算狀況
- 月預算總額：${budgetContext.monthly_budget} 元
- 已花費：${budgetContext.spent_this_month} 元（${usedPercent}%）
- 剩餘預算：${budgetContext.remaining} 元

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
