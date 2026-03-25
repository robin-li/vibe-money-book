import { useTranslation } from 'react-i18next'
import type { Persona, AIEngine } from '../stores/index'

interface AIFeedbackCardProps {
  feedbackText: string
  persona: Persona
  aiEngine?: AIEngine
}

const engineLabel: Record<AIEngine, string> = {
  gemini: 'Gemini',
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  xai: 'xAI',
}

function AIFeedbackCard({ feedbackText, persona, aiEngine }: AIFeedbackCardProps) {
  const { t } = useTranslation('dashboard')

  const personaConfig: Record<
    Persona,
    { nameKey: string; emoji: string; icon: string }
  > = {
    gentle: { nameKey: 'persona.gentle', emoji: '💖', icon: '💬' },
    sarcastic: { nameKey: 'persona.sarcastic', emoji: '🔥', icon: '🔥' },
    guilt_trip: { nameKey: 'persona.guilt_trip', emoji: '🥺', icon: '❤️' },
  }

  const config = personaConfig[persona]

  return (
    <section
      className="bg-primary-light rounded-lg p-lg mx-2xl mb-xl"
      aria-label={t('aiFeedback.label')}
    >
      <div className="flex items-center gap-sm mb-xs">
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-surface text-lg">
          {config.icon}
        </div>
        <p className="text-caption text-text-secondary">
          {t(config.nameKey)} {config.emoji} {t('aiFeedback.realtimeFeedback')}
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
