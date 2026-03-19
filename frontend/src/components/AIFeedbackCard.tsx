import type { Persona, AIEngine } from '../stores/index'

interface AIFeedbackCardProps {
  feedbackText: string
  persona: Persona
  aiEngine?: AIEngine
}

const engineLabel: Record<AIEngine, string> = {
  gemini: 'Gemini',
  openai: 'OpenAI',
}

const personaConfig: Record<
  Persona,
  { name: string; emoji: string; icon: string }
> = {
  gentle: { name: '溫柔管家', emoji: '💖', icon: '💬' },
  sarcastic: { name: '毒舌教練', emoji: '🔥', icon: '🔥' },
  guilt_trip: { name: '心疼天使', emoji: '🥺', icon: '❤️' },
}

function AIFeedbackCard({ feedbackText, persona, aiEngine }: AIFeedbackCardProps) {
  const config = personaConfig[persona]

  return (
    <section
      className="bg-primary-light rounded-lg p-lg mx-2xl mb-xl"
      aria-label="AI 回饋"
    >
      <div className="flex items-center gap-sm mb-xs">
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-surface text-lg">
          {config.icon}
        </div>
        <p className="text-caption text-text-secondary">
          {config.name} {config.emoji} 的即時回饋
          {aiEngine && (
            <span className="ml-xs text-small opacity-70">@{engineLabel[aiEngine]}</span>
          )}
        </p>
      </div>
      <p className="text-body text-primary-dark">
        「{feedbackText}」
      </p>
    </section>
  )
}

export default AIFeedbackCard
