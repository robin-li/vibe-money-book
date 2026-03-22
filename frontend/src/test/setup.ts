import '@testing-library/jest-dom/vitest'
import '../i18n/index.ts'
import i18n from '../i18n/index.ts'

// Force zh-TW in test environment to keep existing tests stable
i18n.changeLanguage('zh-TW')
