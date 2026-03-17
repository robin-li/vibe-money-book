import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import VoiceInput from '../components/VoiceInput'

describe('VoiceInput', () => {
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  afterEach(() => {
    delete (window as unknown as Record<string, unknown>).SpeechRecognition
    delete (window as unknown as Record<string, unknown>).webkitSpeechRecognition
  })

  it('renders input field and send button', () => {
    render(<VoiceInput onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText('消費描述輸入')).toBeInTheDocument()
    expect(screen.getByLabelText('送出')).toBeInTheDocument()
  })

  it('shows mic button when SpeechRecognition is supported', () => {
    ;(window as unknown as Record<string, unknown>).SpeechRecognition = function () {
      return { start: vi.fn(), stop: vi.fn(), abort: vi.fn() }
    }

    render(<VoiceInput onSubmit={mockOnSubmit} />)
    expect(screen.getByLabelText('語音輸入')).toBeInTheDocument()
  })

  it('hides mic button when SpeechRecognition is not supported', () => {
    delete (window as unknown as Record<string, unknown>).SpeechRecognition
    delete (window as unknown as Record<string, unknown>).webkitSpeechRecognition

    render(<VoiceInput onSubmit={mockOnSubmit} />)
    expect(screen.queryByLabelText('語音輸入')).not.toBeInTheDocument()
  })

  it('calls onSubmit when send button is clicked with text', async () => {
    const user = userEvent.setup()
    render(<VoiceInput onSubmit={mockOnSubmit} />)

    const input = screen.getByLabelText('消費描述輸入')
    await user.type(input, '午餐吃拉麵 180 元')
    await user.click(screen.getByLabelText('送出'))

    expect(mockOnSubmit).toHaveBeenCalledWith('午餐吃拉麵 180 元')
  })

  it('clears input after submission', async () => {
    const user = userEvent.setup()
    render(<VoiceInput onSubmit={mockOnSubmit} />)

    const input = screen.getByLabelText('消費描述輸入') as HTMLInputElement
    await user.type(input, '咖啡 150')
    await user.click(screen.getByLabelText('送出'))

    expect(input.value).toBe('')
  })

  it('does not submit empty text', async () => {
    const user = userEvent.setup()
    render(<VoiceInput onSubmit={mockOnSubmit} />)

    await user.click(screen.getByLabelText('送出'))

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('does not submit whitespace-only text', async () => {
    const user = userEvent.setup()
    render(<VoiceInput onSubmit={mockOnSubmit} />)

    const input = screen.getByLabelText('消費描述輸入')
    await user.type(input, '   ')
    await user.click(screen.getByLabelText('送出'))

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('submits on Enter key', async () => {
    const user = userEvent.setup()
    render(<VoiceInput onSubmit={mockOnSubmit} />)

    const input = screen.getByLabelText('消費描述輸入')
    await user.type(input, '搭捷運 35{Enter}')

    expect(mockOnSubmit).toHaveBeenCalledWith('搭捷運 35')
  })

  it('disables input and buttons when disabled prop is true', () => {
    render(<VoiceInput onSubmit={mockOnSubmit} disabled />)

    const input = screen.getByLabelText('消費描述輸入') as HTMLInputElement
    expect(input.disabled).toBe(true)
    expect(screen.getByLabelText('送出')).toBeDisabled()
  })

  it('shows default placeholder text', () => {
    render(<VoiceInput onSubmit={mockOnSubmit} />)

    const input = screen.getByLabelText('消費描述輸入')
    expect(input).toHaveAttribute('placeholder', '例如：中午吃拉麵 280 元')
  })

  it('send button is disabled when input is empty', () => {
    render(<VoiceInput onSubmit={mockOnSubmit} />)
    expect(screen.getByLabelText('送出')).toBeDisabled()
  })
})
