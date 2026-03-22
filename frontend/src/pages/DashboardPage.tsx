import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '../stores/settingsStore'
import { useDashboardStore } from '../stores/dashboardStore'
import VoiceInput from '../components/VoiceInput'
import AssetCard from '../components/AssetCard'
import BudgetCard from '../components/BudgetCard'
import AIFeedbackCard from '../components/AIFeedbackCard'
import RecentTransactions from '../components/RecentTransactions'
import ParsedResultCard from '../components/ParsedResultCard'
import NewCategoryDialog from '../components/NewCategoryDialog'

function DashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const persona = useSettingsStore((s) => s.persona)
  const aiEngine = useSettingsStore((s) => s.aiEngine)
  const fetchProfile = useSettingsStore((s) => s.fetchProfile)
  const fetchAIConfig = useSettingsStore((s) => s.fetchAIConfig)

  const {
    status,
    parsedResult,
    lastRawText,
    aiFeedback,
    budgetSummary,
    recentTransactions,
    categories,
    categoryInfoList,
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
    fetchAIConfig()
    fetchCategories()
    fetchBudgetSummary()
    fetchRecentTransactions()
  }, [fetchProfile, fetchAIConfig, fetchCategories, fetchBudgetSummary, fetchRecentTransactions])

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
      note?: string
    }) => {
      await confirmTransaction({
        ...data,
        rawText: lastRawText || data.merchant,
        note: data.note ?? parsedResult?.note,
        feedback: aiFeedback ?? undefined,
      })
      fetchBudgetSummary()
    },
    [confirmTransaction, lastRawText, parsedResult, aiFeedback, fetchBudgetSummary]
  )

  const handleNewCategoryConfirm = useCallback(
    async (categoryName: string) => {
      try {
        const categoryType = parsedResult?.type ?? 'expense'
        await createCategory(categoryName, categoryType)
        if (parsedResult) {
          useDashboardStore.setState({
            parsedResult: {
              ...parsedResult,
              category: categoryName,
              isNewCategory: false,
              suggestedCategory: null,
            },
          })
        }
        fetchCategories()
      } catch {
        // Error handled by store
      }
    },
    [createCategory, parsedResult, fetchCategories]
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
          rawText: lastRawText || parsedResult.merchant,
          note: parsedResult.note,
          feedback: aiFeedback ?? undefined,
        })
        fetchBudgetSummary()
      }
    },
    [confirmTransaction, parsedResult, lastRawText, aiFeedback, fetchBudgetSummary]
  )

  const isParsing = status === 'parsing'
  const isSaving = status === 'saving'
  const isChatReply = status === 'chat_reply'
  const showParsedResult =
    status === 'parsed' && parsedResult && !parsedResult.isNewCategory
  const showNewCategoryDialog =
    status === 'parsed' && parsedResult?.isNewCategory

  const feedbackText =
    (isChatReply && aiFeedback?.text) || lastFeedbackText ||
    t('dashboard:aiFeedback.defaultMessage')

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
                {t('common:appName')}
              </h1>
              <p className="text-small text-text-secondary tracking-[2px]">
                {t('common:appSlogan')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="w-6 h-6 text-text-secondary"
            aria-label={t('nav.settings')}
          >
            ⚙️
          </button>
        </header>

        {/* Asset & Budget Cards */}
        <div className="flex gap-md mx-2xl mb-xl">
          <AssetCard summary={budgetSummary} />
          <BudgetCard summary={budgetSummary} compact />
        </div>

        {/* AI Feedback Card */}
        <AIFeedbackCard
          feedbackText={
            isParsing ? t('dashboard:aiFeedback.analyzing') : feedbackText
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
            categoryInfoList={categoryInfoList}
          />
        )}

        {/* New Category Dialog */}
        {showNewCategoryDialog && parsedResult.suggestedCategory && (
          <NewCategoryDialog
            suggestedCategory={parsedResult.suggestedCategory}
            persona={persona}
            transactionType={parsedResult.type ?? 'expense'}
            categoryInfoList={categoryInfoList}
            onConfirm={handleNewCategoryConfirm}
            onSelectExisting={handleSelectExistingCategory}
          />
        )}

        {/* Recent Transactions */}
        <RecentTransactions transactions={recentTransactions} categories={categories} />

        {/* Footer */}
        <div className="text-center py-sm mt-xl">
          <p className="text-small text-text-tertiary tracking-[1px]">
            {t('common:poweredBy')}
          </p>
        </div>
      </div>

      <VoiceInput onSubmit={handleSubmit} disabled={isParsing || isSaving} />
    </>
  )
}

export default DashboardPage
