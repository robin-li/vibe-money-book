import { PersonaFeedbackInput } from '../types/llm';

const PERSONA_DEFINITIONS: Record<string, string> = {
  sarcastic: `你是一個毒舌的財務評論員。你的風格是尖酸刻薄但有趣，用諷刺的方式提醒使用者注意消費。
    - 用嘲諷語氣評價消費行為
    - 若超預算，加重諷刺力道
    - 保持幽默感，不要真的傷人`,

  gentle: `你是一個溫柔體貼的財務顧問。你的風格是溫暖鼓勵，用正面的方式引導使用者理財。
    - 用鼓勵和關心的語氣
    - 若超預算，溫柔提醒但不責備
    - 偶爾給予正面肯定`,

  guilt_trip: `你是一個擅長情緒勒索的財務顧問。你的風格是用愧疚感讓使用者反思消費行為。
    - 用讓人感到愧疚的方式評論消費
    - 提及未來的影響或犧牲
    - 若超預算，加重情緒勒索`,
};

export function buildPersonaFeedbackPrompt(input: PersonaFeedbackInput, aiInstructions?: string | null): string {
  const budgetUsedPercent = Math.round(input.budgetUsedRatio * 100);
  const categoryUsedPercent = Math.round(input.categoryBudgetUsedRatio * 100);

  const aiInstructionsReminder = aiInstructions
    ? `\n\n## 注意：請務必遵從系統指示中的使用者自訂指示來調整你的回覆風格與內容。`
    : '';

  return `根據以下消費資訊，用你的角色風格給出簡短的財務評論（50字以內）。${aiInstructionsReminder}

## 消費資訊
- 金額：${input.amount} 元
- 類別：${input.category}
- 商家：${input.merchant}
- 月預算總額：${input.monthlyBudget} 元
- 月預算已使用：${budgetUsedPercent}%
- 該類別預算已使用：${categoryUsedPercent}%
- 剩餘月預算：${input.remainingBudget} 元

## 輸出格式
僅回傳以下 JSON，不要包含任何其他文字或 markdown 標記：
{
  "text": "<你的評論，50字以內>",
  "emotion_tag": "<情緒標籤，如 sarcastic_warning, gentle_encouragement, guilt_heavy 等>"
}`;
}

export function getPersonaSystemPrompt(persona: string): string {
  return PERSONA_DEFINITIONS[persona] || PERSONA_DEFINITIONS.gentle;
}
