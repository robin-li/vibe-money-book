import { useState, useCallback, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getVoiceLang } from '../i18n/index'

// #99: 偵測 Android 平台，用於語音辨識重複 workaround
const isAndroid =
  typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent)

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
  const { i18n } = useTranslation()
  // Use i18n current language to determine voice recognition language
  const effectiveLang = options.lang ?? getVoiceLang(i18n.language)
  const { silenceTimeout = 5000, onResult, onInterimResult, onError } = options

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
  // #99: 追蹤錄音狀態，供 Android onend 自動重啟判斷
  const isRecordingRef = useRef(false)
  // #99: Android 累積 transcript（跨 recognition session）
  const accumulatedTranscriptRef = useRef('')

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
    // #99: 重置 Android 累積 transcript
    accumulatedTranscriptRef.current = ''
    isRecordingRef.current = true

    const recognition = new SpeechRecognitionClass()
    recognition.lang = effectiveLang
    recognition.interimResults = true
    // #99: Android Chrome continuous:true 會導致重複詞句（Chromium 已知 Bug）
    // 改用 continuous:false，停頓後自動重啟
    recognition.continuous = !isAndroid
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

      // #99: Android 模式下，加上先前 session 累積的 transcript
      const fullFinalTranscript = isAndroid
        ? accumulatedTranscriptRef.current + finalTranscript
        : finalTranscript

      // Cache computed values for synchronous read in stopRecording.
      latestFinalRef.current = fullFinalTranscript
      latestInterimRef.current = interimTranscript

      // Display combined text as live feedback
      const displayText = fullFinalTranscript + interimTranscript
      if (displayText) {
        setInterimTranscript(displayText)
        setStatus('recognizing')
        callbacksRef.current.onInterimResult?.(displayText)
      }

      // #94: Reset silence timer
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
      const message = getErrorMessage(event.error, i18n.t)
      setErrorMessage(message)
      setStatus('error')
      callbacksRef.current.onError?.(message)
    }

    recognition.onend = () => {
      // #99: Android continuous:false — 停頓觸發 onend，若仍在錄音狀態則自動重啟
      if (isAndroid && isRecordingRef.current) {
        accumulatedTranscriptRef.current = latestFinalRef.current
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
        if (silenceTimeout > 0) {
          silenceTimerRef.current = setTimeout(() => {
            stopRecordingRef.current()
          }, silenceTimeout)
        }
        try {
          recognition.start()
        } catch {
          isRecordingRef.current = false
          setStatus('idle')
          recognitionRef.current = null
        }
        return
      }
      setStatus((prev) => (prev === 'error' ? 'error' : 'idle'))
      recognitionRef.current = null
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [effectiveLang, silenceTimeout, i18n.t])

  const stopRecording = useCallback(() => {
    isRecordingRef.current = false
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      const deliverText = latestFinalRef.current + latestInterimRef.current
      if (deliverText) {
        setTranscript(deliverText)
        callbacksRef.current.onResult?.(deliverText)
      }
      setInterimTranscript('')
      latestFinalRef.current = ''
      latestInterimRef.current = ''
      accumulatedTranscriptRef.current = ''
    }
  }, [])

  // Keep stopRecordingRef in sync
  useEffect(() => {
    stopRecordingRef.current = stopRecording
  }, [stopRecording])

  // Toggle recording
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
      isRecordingRef.current = false
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

function getErrorMessage(error: string, _t?: (key: string) => string): string {
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
