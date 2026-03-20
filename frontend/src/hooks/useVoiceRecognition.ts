import { useState, useCallback, useRef, useEffect } from 'react'

export type VoiceStatus = 'idle' | 'recording' | 'recognizing' | 'error'

interface UseVoiceRecognitionOptions {
  lang?: string
  /** 靜默超時時間（毫秒），預設 5000ms */
  silenceTimeout?: number
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
  const { lang = 'zh-TW', silenceTimeout = 5000, onResult, onInterimResult, onError } = options

  const [isSupported] = useState(() => isSpeechRecognitionSupported())
  const [status, setStatus] = useState<VoiceStatus>('idle')
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const callbacksRef = useRef({ onResult, onInterimResult, onError })
  // Cache the latest transcript computed from event.results for synchronous
  // delivery when stopRecording is called. This ref is NEVER used for
  // accumulation — it is overwritten (not appended) on every onresult event.
  const latestFinalRef = useRef('')
  const latestInterimRef = useRef('')
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stopRecordingRef = useRef<() => void>(() => {})

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

    // Reset latest transcript cache
    latestFinalRef.current = ''
    latestInterimRef.current = ''

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
      // #94: Start silence timer — if no speech detected within timeout, auto-stop
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
      if (silenceTimeout > 0) {
        silenceTimerRef.current = setTimeout(() => {
          stopRecordingRef.current()
        }, silenceTimeout)
      }
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Fix #87: Rebuild transcript from event.results on EVERY onresult call.
      // In continuous mode, event.results is the COMPLETE history of all
      // recognition results. We iterate from index 0 each time and never
      // accumulate via external refs or state — the loop below is the single
      // source of truth.
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      // Cache computed values for synchronous read in stopRecording.
      // These refs are OVERWRITTEN (not appended) on every call.
      latestFinalRef.current = finalTranscript
      latestInterimRef.current = interimTranscript

      // Display combined text as live feedback
      const displayText = finalTranscript + interimTranscript
      if (displayText) {
        setInterimTranscript(displayText)
        setStatus('recognizing')
        callbacksRef.current.onInterimResult?.(displayText)
      }

      // #94: Reset silence timer — auto-stop after silenceTimeout ms of no new results
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
      if (silenceTimeout > 0) {
        silenceTimerRef.current = setTimeout(() => {
          stopRecordingRef.current()
        }, silenceTimeout)
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
  }, [lang, silenceTimeout])

  const stopRecording = useCallback(() => {
    // #94: Clear silence timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      // Deliver the latest computed transcript (final + interim).
      // Include interim so nothing is lost if user stops before the engine
      // finalises the last segment (e.g. short or mid-utterance stops).
      const deliverText = latestFinalRef.current + latestInterimRef.current
      if (deliverText) {
        setTranscript(deliverText)
        callbacksRef.current.onResult?.(deliverText)
      }
      setInterimTranscript('')
      latestFinalRef.current = ''
      latestInterimRef.current = ''
    }
  }, [])

  // Keep stopRecordingRef in sync so silence timer always calls the latest version
  useEffect(() => {
    stopRecordingRef.current = stopRecording
  }, [stopRecording])

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
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
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
