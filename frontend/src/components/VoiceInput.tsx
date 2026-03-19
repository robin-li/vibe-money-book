import { useState, useRef, useCallback, useEffect } from 'react'
import {
  useVoiceRecognition,
  isSpeechRecognitionSupported,
} from '../hooks/useVoiceRecognition'

interface VoiceInputProps {
  onSubmit: (text: string) => void
  disabled?: boolean
}

function VoiceInput({ onSubmit, disabled = false }: VoiceInputProps) {
  const [inputText, setInputText] = useState('')
  const [showError, setShowError] = useState(false)
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isSupported = isSpeechRecognitionSupported()

  const handleVoiceResult = useCallback((transcript: string) => {
    setInputText(transcript)
  }, [])

  const handleVoiceInterim = useCallback((interim: string) => {
    setInputText(interim)
  }, [])

  const handleVoiceError = useCallback((error: string) => {
    if (!error) return
    setShowError(true)
    errorTimerRef.current = setTimeout(() => setShowError(false), 3000)
  }, [])

  const { status, errorMessage, toggleRecording } =
    useVoiceRecognition({
      lang: 'zh-TW',
      onResult: handleVoiceResult,
      onInterimResult: handleVoiceInterim,
      onError: handleVoiceError,
    })

  // Cleanup error timer on unmount
  useEffect(() => {
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
    }
  }, [])

  const isRecording = status === 'recording'
  const isRecognizing = status === 'recognizing'
  const isActive = isRecording || isRecognizing

  const handleSubmit = useCallback(() => {
    const text = inputText.trim()
    if (!text || disabled) return
    onSubmit(text)
    setInputText('')
  }, [inputText, onSubmit, disabled])

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
    if (isRecording) return '正在聆聽...'
    if (isRecognizing) return '辨識中...'
    return '例如：中午吃拉麵 280 元'
  }

  return (
    <div
      className="fixed left-0 right-0 bg-surface px-2xl py-md z-40"
      style={{
        bottom: 'calc(56px + env(safe-area-inset-bottom, 0px))',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
      }}
    >
      {/* Error message */}
      {showError && errorMessage && (
        <div
          className="mb-sm px-lg py-sm rounded-md text-small text-danger bg-danger-light text-center"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      <div className="flex items-center gap-sm">
        {/* Text input */}
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
          aria-label="消費描述輸入"
        />

        {/* Mic button - only shown when supported */}
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
            aria-label={isActive ? '停止語音輸入' : '開始語音輸入'}
            aria-pressed={isActive}
          >
            {/* Pulse rings animation when recording */}
            {isActive && (
              <>
                <span className="voice-pulse-ring voice-pulse-ring-1" />
                <span className="voice-pulse-ring voice-pulse-ring-2" />
              </>
            )}
            {isActive ? (
              /* Stop icon (square) when recording */
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="relative z-10"
                aria-hidden="true"
              >
                <rect x="4" y="4" width="16" height="16" rx="2" />
              </svg>
            ) : (
              /* Mic icon when idle */
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="relative z-10"
                aria-hidden="true"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            )}
          </button>
        )}

        {/* Send button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || !inputText.trim()}
          className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-fab transition-opacity duration-[var(--transition-fast)] disabled:opacity-40"
          aria-label="送出"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="22" x2="11" y1="2" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default VoiceInput
