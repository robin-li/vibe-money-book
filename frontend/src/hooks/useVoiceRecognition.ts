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
      let finalTranscript = ''
      let interim = ''

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interim += result[0].transcript
        }
      }

      // In continuous mode, show combined final + interim as live feedback
      const liveText = finalTranscript + interim
      if (liveText) {
        setInterimTranscript(liveText)
        setStatus('recognizing')
        callbacksRef.current.onInterimResult?.(liveText)
      }
    }

    // When stop() is called, onend fires — deliver accumulated result
    recognition.onspeechend = () => {
      // Collect all final results
      const recognition_ = recognitionRef.current
      if (!recognition_) return
      // The final result will be delivered via onresult before onend
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
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
      // Deliver whatever we have as final result
      setInterimTranscript((current) => {
        if (current) {
          setTranscript(current)
          callbacksRef.current.onResult?.(current)
        }
        return ''
      })
    }
  }, [])

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
