import { useState, useCallback, useRef, useEffect } from 'react'

export type VoiceStatus = 'idle' | 'recording' | 'recognizing' | 'error'

interface UseVoiceRecognitionOptions {
  lang?: string
  onResult?: (transcript: string) => void
  onInterimResult?: (transcript: string) => void
  onError?: (error: string) => void
}

interface UseVoiceRecognitionReturn {
  isSupported: boolean
  status: VoiceStatus
  transcript: string
  interimTranscript: string
  errorMessage: string
  startRecording: () => void
  stopRecording: () => void
  toggleRecording: () => void
}

// Feature Detection: check SpeechRecognition support
function getSpeechRecognition(): (new () => SpeechRecognition) | null {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null
}

export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognition() !== null
}

export function useVoiceRecognition(
  options: UseVoiceRecognitionOptions = {}
): UseVoiceRecognitionReturn {
  const { lang = 'zh-TW', onResult, onInterimResult, onError } = options

  const [isSupported] = useState(() => isSpeechRecognitionSupported())
  const [status, setStatus] = useState<VoiceStatus>('idle')
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const callbacksRef = useRef({ onResult, onInterimResult, onError })
  // Track accumulated final transcript to avoid duplication (#69)
  const finalTranscriptRef = useRef('')

  // Keep callbacks ref updated
  useEffect(() => {
    callbacksRef.current = { onResult, onInterimResult, onError }
  }, [onResult, onInterimResult, onError])

  const startRecording = useCallback(() => {
    const SpeechRecognitionClass = getSpeechRecognition()
    if (!SpeechRecognitionClass) return

    // Stop any existing recognition
    if (recognitionRef.current) {
      recognitionRef.current.abort()
      recognitionRef.current = null
    }

    // Reset accumulated final transcript
    finalTranscriptRef.current = ''

    const recognition = new SpeechRecognitionClass()
    recognition.lang = lang
    recognition.interimResults = true
    recognition.continuous = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setStatus('recording')
      setErrorMessage('')
      setTranscript('')
      setInterimTranscript('')
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Fix #69: Properly accumulate final results without duplication.
      // Each result in event.results transitions from interim to final exactly once.
      // We rebuild the full text from all results on every event to avoid
      // double-counting previously finalized segments.
      let finalText = ''
      let interimText = ''

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalText += result[0].transcript
        } else {
          interimText += result[0].transcript
        }
      }

      // Store the accumulated final transcript for delivery on stop
      finalTranscriptRef.current = finalText

      // Show combined final + interim as live feedback
      const liveText = finalText + interimText
      if (liveText) {
        setInterimTranscript(liveText)
        setStatus('recognizing')
        callbacksRef.current.onInterimResult?.(liveText)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // Ignore 'no-speech' errors during continuous recording — they are harmless
      if (event.error === 'no-speech') return
      const message = getErrorMessage(event.error)
      setErrorMessage(message)
      setStatus('error')
      callbacksRef.current.onError?.(message)
    }

    recognition.onend = () => {
      setStatus((prev) => (prev === 'error' ? 'error' : 'idle'))
      recognitionRef.current = null
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [lang])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      // Deliver the accumulated final transcript (or interim if no finals yet)
      const finalText = finalTranscriptRef.current
      setInterimTranscript((current) => {
        // Prefer accumulated final results; fall back to whatever interim we have
        const deliverText = finalText || current
        if (deliverText) {
          setTranscript(deliverText)
          callbacksRef.current.onResult?.(deliverText)
        }
        return ''
      })
      finalTranscriptRef.current = ''
    }
  }, [])

  // Toggle recording: start if idle, stop if active (#70)
  const toggleRecording = useCallback(() => {
    if (recognitionRef.current) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [startRecording, stopRecording])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
        recognitionRef.current = null
      }
    }
  }, [])

  return {
    isSupported,
    status,
    transcript,
    interimTranscript,
    errorMessage,
    startRecording,
    stopRecording,
    toggleRecording,
  }
}

function getErrorMessage(error: string): string {
  switch (error) {
    case 'not-allowed':
      return '麥克風權限被拒絕，請在瀏覽器設定中允許麥克風存取'
    case 'no-speech':
      return '未偵測到語音，請再試一次'
    case 'audio-capture':
      return '找不到麥克風裝置'
    case 'network':
      return '網路連線異常，請檢查網路後重試'
    case 'aborted':
      return ''
    default:
      return '語音辨識失敗，請重試或改用文字輸入'
  }
}
