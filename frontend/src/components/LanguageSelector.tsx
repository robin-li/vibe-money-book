import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { SupportedLanguage } from '../i18n/index'

/** 語言選項（使用原生語言名稱，不需翻譯） */
const LANGUAGE_OPTIONS: { value: SupportedLanguage; label: string }[] = [
  { value: 'zh-TW', label: '繁體中文' },
  { value: 'en', label: 'English' },
  { value: 'zh-CN', label: '简体中文' },
  { value: 'vi', label: 'Tiếng Việt' },
]

/**
 * 語言選擇器 — 一個小型的 globe icon 下拉選單，
 * 適用於 Login / Register 等未登入頁面。
 */
function LanguageSelector() {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const currentLang = i18n.language as SupportedLanguage
  const currentLabel = LANGUAGE_OPTIONS.find((o) => o.value === currentLang)?.label ?? '繁體中文'

  const handleSelect = useCallback(
    (lang: SupportedLanguage) => {
      i18n.changeLanguage(lang)
      setOpen(false)
    },
    [i18n],
  )

  // 點擊外部關閉下拉選單
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div ref={containerRef} className="relative inline-block" data-testid="language-selector">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-xs px-md py-xs rounded-md text-caption text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
        aria-label="Switch language"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="text-base" aria-hidden="true">🌐</span>
        <span>{currentLabel}</span>
        <span className="text-[10px] ml-[2px]" aria-hidden="true">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 mt-xs w-36 bg-surface rounded-md shadow-card border border-border py-xs z-50"
        >
          {LANGUAGE_OPTIONS.map((opt) => {
            const selected = currentLang === opt.value
            return (
              <li key={opt.value} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full text-left px-md py-sm text-caption transition-colors ${
                    selected
                      ? 'text-primary font-semibold bg-primary-light'
                      : 'text-text-primary hover:bg-bg'
                  }`}
                >
                  {opt.label}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default LanguageSelector
