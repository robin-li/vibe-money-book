import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettingsStore } from '../stores/settingsStore'
import { useDashboardStore } from '../stores/dashboardStore'
import VoiceInput from '../components/VoiceInput'
import BudgetCard from '../components/BudgetCard'
import AIFeedbackCard from '../components/AIFeedbackCard'
import RecentTransactions from '../components/RecentTransactions'
import ParsedResultCard from '../components/ParsedResultCard'
import NewCategoryDialog from '../components/NewCategoryDialog'

function DashboardPage() {
  const navigate = useNavigate()
  const persona = useSettingsStore((s) => s.persona)
  const aiEngine = useSettingsStore((s) => s.aiEngine)
  const fetchProfile = useSettingsStore((s) => s.fetchProfile)

  const {
    status,
    parsedResult,
    aiFeedback,
    budgetSummary,
    recentTransactions,
    categories,
    errorMessage,
    lastFeedbackText,
    parseInput,
    confirmTransaction,
    createCategory,
    fetchCategories,
    fetchBudgetSummary,
    fetchRecentTransactions,
    resetParsedResult,
  } = useDashboardStore()

  useEffect(() => {
    fetchProfile()
    fetchCategories()
    fetchBudgetSummary()
    fetchRecentTransactions()
  }, [fetchProfile, fetchCategories, fetchBudgetSummary, fetchRecentTransactions])

  const handleSubmit = useCallback(
    (text: string) => {
      parseInput(text)
    },
    [parseInput]
  )

  const handleConfirmTransaction = useCallback(
    async (data: {
      type: 'income' | 'expense'
      amount: number
      category: string
      merchant: string
      date: string
    }) => {
      await confirmTransaction({
        ...data,
        rawText: parsedResult?.merchant ?? data.merchant,
        note: parsedResult?.note,
        feedback: aiFeedback ?? undefined,
      })
      fetchBudgetSummary()
    },
    [confirmTransaction, parsedResult, aiFeedback, fetchBudgetSummary]
  )

  const handleNewCategoryConfirm = useCallback(
    async (categoryName: string) => {
      try {
        await createCategory(categoryName)
        if (parsedResult) {
          await confirmTransaction({
            type: parsedResult.type ?? 'expense',
            amount: parsedResult.amount ?? 0,
            category: categoryName,
            merchant: parsedResult.merchant,
            date: parsedResult.date,
            rawText: parsedResult.merchant,
            note: parsedResult.note,
            feedback: aiFeedback ?? undefined,
          })
          fetchBudgetSummary()
        }
      } catch {
        // Error handled by store
      }
    },
    [
      createCategory,
      confirmTransaction,
      parsedResult,
      aiFeedback,
      fetchBudgetSummary,
    ]
  )

  const handleSelectExistingCategory = useCallback(
    async (category: string) => {
      if (parsedResult) {
        await confirmTransaction({
          type: parsedResult.type ?? 'expense',
          amount: parsedResult.amount ?? 0,
          category,
          merchant: parsedResult.merchant,
          date: parsedResult.date,
          rawText: parsedResult.merchant,
          note: parsedResult.note,
          feedback: aiFeedback ?? undefined,
        })
        fetchBudgetSummary()
      }
    },
    [confirmTransaction, parsedResult, aiFeedback, fetchBudgetSummary]
  )

  const isParsing = status === 'parsing'
  const isSaving = status === 'saving'
  const showParsedResult =
    status === 'parsed' && parsedResult && !parsedResult.isNewCategory
  const showNewCategoryDialog =
    status === 'parsed' && parsedResult?.isNewCategory

  const feedbackText =
    lastFeedbackText ||
    '歡迎使用 Vibe Money Book！開始記錄你的第一筆消費吧～'

  return (
    <>
      <div className="pt-2xl pb-[120px]">
        {/* Header */}
        <header className="flex items-center justify-between h-14 px-2xl mb-lg">
          <div className="flex items-center gap-sm">
            <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center text-surface text-lg">
              💰
            </div>
            <div>
              <h1 className="text-title font-semibold text-text-primary leading-tight">
                Vibe Money Book
              </h1>
              <p className="text-small text-text-secondary tracking-[2px]">
                語音記帳教練
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="w-6 h-6 text-text-secondary"
            aria-label="設定"
          >
            ⚙️
          </button>
        </header>

        {/* Budget Card */}
        <BudgetCard summary={budgetSummary} />

        {/* AI Feedback Card */}
        <AIFeedbackCard
          feedbackText={
            isParsing ? 'AI 正在分析...' : feedbackText
          }
          persona={persona}
          aiEngine={aiEngine}
        />

        {/* Error toast */}
        {status === 'error' && errorMessage && (
          <div
            className="mx-2xl mb-md px-lg py-sm rounded-md bg-danger text-surface text-body text-center"
            role="alert"
          >
            {errorMessage}
          </div>
        )}

        {/* Skeleton loading */}
        {isParsing && (
          <div className="mx-2xl mb-md">
            <div className="bg-surface rounded-lg shadow-card p-lg animate-pulse">
              <div className="h-4 bg-border rounded w-1/3 mb-md" />
              <div className="h-4 bg-border rounded w-2/3 mb-sm" />
              <div className="h-4 bg-border rounded w-1/2" />
            </div>
          </div>
        )}

        {/* Parsed Result Card */}
        {showParsedResult && (
          <ParsedResultCard
            result={parsedResult}
            onConfirm={handleConfirmTransaction}
            onCancel={resetParsedResult}
            categories={categories}
          />
        )}

        {/* New Category Dialog */}
        {showNewCategoryDialog && parsedResult.suggestedCategory && (
          <NewCategoryDialog
            suggestedCategory={parsedResult.suggestedCategory}
            persona={persona}
            existingCategories={categories}
            onConfirm={handleNewCategoryConfirm}
            onSelectExisting={handleSelectExistingCategory}
          />
        )}

        {/* Recent Transactions */}
        <RecentTransactions transactions={recentTransactions} categories={categories} />

        {/* Footer */}
        <div className="text-center py-sm mt-xl">
          <p className="text-small text-text-tertiary tracking-[1px]">
            POWERED BY AI · 精準記帳 · 情緒滿分
          </p>
        </div>
      </div>

      <VoiceInput onSubmit={handleSubmit} disabled={isParsing || isSaving} />
    </>
  )
}

export default DashboardPage
