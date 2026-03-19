import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  useVoiceRecognition,
  isSpeechRecognitionSupported,
} from '../hooks/useVoiceRecognition'

// Mock SpeechRecognition
function createMockRecognition() {
  return {
    lang: '',
    interimResults: false,
    continuous: false,
    maxAlternatives: 1,
    onstart: null as (() => void) | null,
    onresult: null as ((e: unknown) => void) | null,
    onerror: null as ((e: unknown) => void) | null,
    onend: null as (() => void) | null,
    start: vi.fn(),
    stop: vi.fn(),
    abort: vi.fn(),
  }
}

type MockRecognition = ReturnType<typeof createMockRecognition>

describe('isSpeechRecognitionSupported', () => {
  afterEach(() => {
    // Clean up mock
    delete (window as unknown as Record<string, unknown>).SpeechRecognition
    delete (window as unknown as Record<string, unknown>).webkitSpeechRecognition
  })

  it('returns true when SpeechRecognition is available', () => {
    ;(window as unknown as Record<string, unknown>).SpeechRecognition = vi.fn()
    expect(isSpeechRecognitionSupported()).toBe(true)
  })

  it('returns true when webkitSpeechRecognition is available', () => {
    ;(window as unknown as Record<string, unknown>).webkitSpeechRecognition = vi.fn()
    expect(isSpeechRecognitionSupported()).toBe(true)
  })

  it('returns false when neither is available', () => {
    delete (window as unknown as Record<string, unknown>).SpeechRecognition
    delete (window as unknown as Record<string, unknown>).webkitSpeechRecognition
    expect(isSpeechRecognitionSupported()).toBe(false)
  })
})

describe('useVoiceRecognition', () => {
  let mockRecognition: MockRecognition

  beforeEach(() => {
    mockRecognition = createMockRecognition()
    // Must use function keyword for `new` to work
    ;(window as unknown as Record<string, unknown>).SpeechRecognition = function () {
      return mockRecognition
    }
  })

  afterEach(() => {
    delete (window as unknown as Record<string, unknown>).SpeechRecognition
    delete (window as unknown as Record<string, unknown>).webkitSpeechRecognition
  })

  it('reports supported when SpeechRecognition exists', () => {
    const { result } = renderHook(() => useVoiceRecognition())
    expect(result.current.isSupported).toBe(true)
  })

  it('reports unsupported when SpeechRecognition missing', () => {
    delete (window as unknown as Record<string, unknown>).SpeechRecognition
    const { result } = renderHook(() => useVoiceRecognition())
    expect(result.current.isSupported).toBe(false)
  })

  it('starts with idle status', () => {
    const { result } = renderHook(() => useVoiceRecognition())
    expect(result.current.status).toBe('idle')
    expect(result.current.transcript).toBe('')
    expect(result.current.interimTranscript).toBe('')
    expect(result.current.errorMessage).toBe('')
  })

  it('transitions to recording on startRecording', () => {
    const { result } = renderHook(() => useVoiceRecognition())

    act(() => {
      result.current.startRecording()
    })

    expect(mockRecognition.start).toHaveBeenCalledOnce()
    expect(mockRecognition.lang).toBe('zh-TW')
    expect(mockRecognition.interimResults).toBe(true)

    // Simulate onstart callback
    act(() => {
      mockRecognition.onstart?.()
    })

    expect(result.current.status).toBe('recording')
  })

  it('handles interim results', () => {
    const onInterimResult = vi.fn()
    const { result } = renderHook(() =>
      useVoiceRecognition({ onInterimResult })
    )

    act(() => {
      result.current.startRecording()
      mockRecognition.onstart?.()
    })

    act(() => {
      mockRecognition.onresult?.({
        results: [{ 0: { transcript: '午餐' }, isFinal: false, length: 1 }],
        resultIndex: 0,
      } as unknown)
    })

    expect(result.current.status).toBe('recognizing')
    expect(onInterimResult).toHaveBeenCalledWith('午餐')
  })

  it('handles final results and calls onResult', () => {
    const onResult = vi.fn()
    const { result } = renderHook(() => useVoiceRecognition({ onResult }))

    act(() => {
      result.current.startRecording()
      mockRecognition.onstart?.()
    })

    act(() => {
      mockRecognition.onresult?.({
        results: [
          { 0: { transcript: '午餐吃拉麵 180 元' }, isFinal: true, length: 1 },
        ],
        resultIndex: 0,
      } as unknown)
    })

    // In continuous mode, results are accumulated as interim until stopRecording
    expect(result.current.interimTranscript).toBe('午餐吃拉麵 180 元')

    act(() => {
      result.current.stopRecording()
    })

    expect(result.current.transcript).toBe('午餐吃拉麵 180 元')
    expect(onResult).toHaveBeenCalledWith('午餐吃拉麵 180 元')
  })

  it('handles errors and calls onError', () => {
    const onError = vi.fn()
    const { result } = renderHook(() => useVoiceRecognition({ onError }))

    act(() => {
      result.current.startRecording()
      mockRecognition.onstart?.()
    })

    act(() => {
      mockRecognition.onerror?.({ error: 'not-allowed' })
    })

    expect(result.current.status).toBe('error')
    expect(result.current.errorMessage).toBe('麥克風權限被拒絕，請在瀏覽器設定中允許麥克風存取')
    expect(onError).toHaveBeenCalled()
  })

  it('ignores no-speech errors during continuous recording', () => {
    const onError = vi.fn()
    const { result } = renderHook(() => useVoiceRecognition({ onError }))

    act(() => {
      result.current.startRecording()
      mockRecognition.onstart?.()
    })

    act(() => {
      mockRecognition.onerror?.({ error: 'no-speech' })
    })

    // Should remain in recording state, not error
    expect(result.current.status).toBe('recording')
    expect(onError).not.toHaveBeenCalled()
  })

  it('returns to idle after recognition ends normally', () => {
    const { result } = renderHook(() => useVoiceRecognition())

    act(() => {
      result.current.startRecording()
      mockRecognition.onstart?.()
    })

    act(() => {
      mockRecognition.onend?.()
    })

    expect(result.current.status).toBe('idle')
  })

  it('stays in error state after recognition ends with error', () => {
    const { result } = renderHook(() => useVoiceRecognition())

    act(() => {
      result.current.startRecording()
      mockRecognition.onstart?.()
    })

    act(() => {
      mockRecognition.onerror?.({ error: 'not-allowed' })
    })

    act(() => {
      mockRecognition.onend?.()
    })

    expect(result.current.status).toBe('error')
  })

  it('stops recording when stopRecording is called', () => {
    const { result } = renderHook(() => useVoiceRecognition())

    act(() => {
      result.current.startRecording()
    })

    act(() => {
      result.current.stopRecording()
    })

    expect(mockRecognition.stop).toHaveBeenCalledOnce()
  })

  it('aborts on unmount', () => {
    const { result, unmount } = renderHook(() => useVoiceRecognition())

    act(() => {
      result.current.startRecording()
    })

    unmount()

    expect(mockRecognition.abort).toHaveBeenCalled()
  })

  it('does nothing when startRecording and unsupported', () => {
    delete (window as unknown as Record<string, unknown>).SpeechRecognition
    const { result } = renderHook(() => useVoiceRecognition())

    act(() => {
      result.current.startRecording()
    })

    expect(result.current.status).toBe('idle')
  })

  it('toggleRecording starts when idle and stops when active', () => {
    const onResult = vi.fn()
    const { result } = renderHook(() => useVoiceRecognition({ onResult }))

    // Toggle on — should start
    act(() => {
      result.current.toggleRecording()
    })
    expect(mockRecognition.start).toHaveBeenCalledOnce()

    // Simulate onstart
    act(() => {
      mockRecognition.onstart?.()
    })
    expect(result.current.status).toBe('recording')

    // Simulate some interim result
    act(() => {
      mockRecognition.onresult?.({
        results: [{ 0: { transcript: '測試' }, isFinal: false, length: 1 }],
        resultIndex: 0,
      } as unknown)
    })

    // Toggle off — should stop
    act(() => {
      result.current.toggleRecording()
    })
    expect(mockRecognition.stop).toHaveBeenCalledOnce()
  })

  it('does not duplicate final results across multiple onresult events (#69)', () => {
    const onInterimResult = vi.fn()
    const onResult = vi.fn()
    const { result } = renderHook(() =>
      useVoiceRecognition({ onInterimResult, onResult })
    )

    act(() => {
      result.current.startRecording()
      mockRecognition.onstart?.()
    })

    // First event: interim "週一的時候"
    act(() => {
      mockRecognition.onresult?.({
        results: [
          { 0: { transcript: '週一的時候' }, isFinal: false, length: 1 },
        ],
        resultIndex: 0,
      } as unknown)
    })
    expect(onInterimResult).toHaveBeenLastCalledWith('週一的時候')

    // Second event: first segment finalized, new interim appears
    act(() => {
      mockRecognition.onresult?.({
        results: [
          { 0: { transcript: '週一的時候' }, isFinal: true, length: 1 },
          { 0: { transcript: 'Michael還我錢' }, isFinal: false, length: 1 },
        ],
        resultIndex: 0,
      } as unknown)
    })
    // Should NOT be "週一的時候週一的時候Michael還我錢"
    expect(onInterimResult).toHaveBeenLastCalledWith('週一的時候Michael還我錢')

    // Third event: both finalized
    act(() => {
      mockRecognition.onresult?.({
        results: [
          { 0: { transcript: '週一的時候' }, isFinal: true, length: 1 },
          { 0: { transcript: 'Michael還我錢10000塊' }, isFinal: true, length: 1 },
        ],
        resultIndex: 0,
      } as unknown)
    })
    expect(onInterimResult).toHaveBeenLastCalledWith('週一的時候Michael還我錢10000塊')

    // Stop recording — deliver final
    act(() => {
      result.current.stopRecording()
    })
    expect(onResult).toHaveBeenCalledWith('週一的時候Michael還我錢10000塊')
  })
})
