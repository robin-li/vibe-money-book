import { useState, useRef, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useVoiceRecognition,
  isSpeechRecognitionSupported,
} from '../hooks/useVoiceRecognition'

interface VoiceInputProps {
  onSubmit: (text: string) => void
  disabled?: boolean
  placeholder?: string
}

function VoiceInput({ onSubmit, disabled = false, placeholder: customPlaceholder }: VoiceInputProps) {
  const { t } = useTranslation('dashboard')
  const [inputText, setInputText] = useState('')
  const [showError, setShowError] = useState(false)
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoSubmitRef = useRef(false)
  const onSubmitRef = useRef(onSubmit)
  const disabledRef = useRef(disabled)
  const isSupported = isSpeechRecognitionSupported()

  useEffect(() => {
    onSubmitRef.current = onSubmit
    disabledRef.current = disabled
  }, [onSubmit, disabled])

  const handleVoiceResult = useCallback((transcript: string) => {
    if (autoSubmitRef.current) {
      autoSubmitRef.current = false
      const text = transcript.trim()
      if (text) {
        setInputText('')
        onSubmitRef.current(text)
      } else {
        setInputText(transcript)
      }
    } else {
      setInputText(transcript)
    }
  }, [])

  const handleVoiceInterim = useCallback((interim: string) => {
    setInputText(interim)
  }, [])

  const handleVoiceError = useCallback((error: string) => {
    if (!error) return
    setShowError(true)
    errorTimerRef.current = setTimeout(() => setShowError(false), 3000)
  }, [])

  const { status, errorMessage, toggleRecording, stopRecording } =
    useVoiceRecognition({
      onResult: handleVoiceResult,
      onInterimResult: handleVoiceInterim,
      onError: handleVoiceError,
    })

  const isRecording = status === 'recording'
  const isRecognizing = status === 'recognizing'
  const isActive = isRecording || isRecognizing

  useEffect(() => {
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
    }
  }, [])

  const handleSubmit = useCallback(() => {
    if (isActive) {
      autoSubmitRef.current = true
      stopRecording()
      return
    }
    const text = inputText.trim()
    if (!text || disabled) return
    onSubmit(text)
    setInputText('')
  }, [inputText, onSubmit, disabled, isActive, stopRecording])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit]
  )

  const handleMicToggle = useCallback(() => {
    if (disabled) return
    toggleRecording()
  }, [toggleRecording, disabled])

  const getPlaceholder = () => {
    if (isRecording) return t('voiceInput.recording')
    if (isRecognizing) return t('voiceInput.recognizing')
    return customPlaceholder ?? t('voiceInput.placeholder')
  }

  return (
    <div
      className="fixed left-0 right-0 bg-surface px-2xl py-md z-40"
      style={{
        bottom: 'calc(56px + env(safe-area-inset-bottom, 0px))',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
      }}
    >
      {showError && errorMessage && (
        <div
          className="mb-sm px-lg py-sm rounded-md text-small text-danger bg-danger-light text-center"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      <div className="flex items-center gap-sm">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder()}
          disabled={disabled || isActive}
          className={`flex-1 h-[44px] rounded-xl px-lg text-body border outline-none transition-colors duration-[var(--transition-fast)] ${
            isActive
              ? 'bg-primary-light border-primary'
              : 'bg-bg border-border focus:border-primary'
          }`}
          aria-label={t('voiceInput.inputLabel')}
        />

        {isSupported && (
          <button
            type="button"
            onClick={handleMicToggle}
            disabled={disabled}
            className={`relative w-9 h-9 flex items-center justify-center rounded-full transition-colors duration-[var(--transition-fast)] select-none ${
              isActive
                ? 'bg-danger text-surface'
                : 'text-text-secondary'
            } disabled:opacity-40`}
            aria-label={isActive ? t('voiceInput.stopVoice') : t('voiceInput.startVoice')}
            aria-pressed={isActive}
          >
            {isActive && (
              <>
                <span className="voice-pulse-ring voice-pulse-ring-1" />
                <span className="voice-pulse-ring voice-pulse-ring-2" />
              </>
            )}
            {isActive ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="relative z-10" aria-hidden="true">
                <rect x="4" y="4" width="16" height="16" rx="2" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10" aria-hidden="true">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            )}
          </button>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || (!inputText.trim() && !isActive)}
          className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-fab transition-opacity duration-[var(--transition-fast)] disabled:opacity-40"
          aria-label={t('voiceInput.send')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="22" x2="11" y1="2" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default VoiceInput
