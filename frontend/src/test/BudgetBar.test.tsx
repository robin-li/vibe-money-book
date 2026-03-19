import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import BudgetBar from '../components/BudgetBar'

describe('BudgetBar', () => {
  it('renders green (safe) when remaining >= 50% (usedRatio=0.2, remaining=80%)', () => {
    const { container } = render(<BudgetBar usedRatio={0.2} />)
    const bar = container.querySelector('[role="progressbar"]')!
    expect(bar).toBeInTheDocument()
    expect(bar.className).toContain('bg-success')
    expect(bar.className).not.toContain('animate-budget-pulse')
    expect(container.querySelector('[data-testid="budget-bar"]')!.className).toContain('budget-bar-safe')
  })

  it('renders green when remaining is exactly 50% (usedRatio=0.5)', () => {
    const { container } = render(<BudgetBar usedRatio={0.5} />)
    const bar = container.querySelector('[role="progressbar"]')!
    expect(bar.className).toContain('bg-success')
    expect(container.querySelector('[data-testid="budget-bar"]')!.className).toContain('budget-bar-safe')
  })

  it('renders yellow (warning) when remaining 20-50% (usedRatio=0.6, remaining=40%)', () => {
    const { container } = render(<BudgetBar usedRatio={0.6} />)
    const bar = container.querySelector('[role="progressbar"]')!
    expect(bar.className).toContain('bg-warning')
    expect(bar.className).not.toContain('animate-budget-pulse')
    expect(container.querySelector('[data-testid="budget-bar"]')!.className).toContain('budget-bar-warning')
  })

  it('renders red (danger) with pulse when remaining < 20% (usedRatio=0.9, remaining=10%)', () => {
    const { container } = render(<BudgetBar usedRatio={0.9} />)
    const bar = container.querySelector('[role="progressbar"]')!
    expect(bar.className).toContain('bg-danger')
    expect(bar.className).toContain('animate-budget-pulse')
    expect(container.querySelector('[data-testid="budget-bar"]')!.className).toContain('budget-bar-danger')
  })

  it('renders red (danger) with pulse when remaining < 20% (usedRatio=0.85, remaining=15%)', () => {
    const { container } = render(<BudgetBar usedRatio={0.85} />)
    const bar = container.querySelector('[role="progressbar"]')!
    expect(bar.className).toContain('bg-danger')
    expect(bar.className).toContain('animate-budget-pulse')
  })

  it('caps progress at 100% when over budget', () => {
    const { container } = render(<BudgetBar usedRatio={1.2} />)
    const bar = container.querySelector('[role="progressbar"]')!
    expect(bar).toHaveStyle({ width: '100%' })
    expect(bar.className).toContain('bg-danger')
  })

  it('has correct aria attributes', () => {
    render(<BudgetBar usedRatio={0.5} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '50')
    expect(bar).toHaveAttribute('aria-valuemin', '0')
    expect(bar).toHaveAttribute('aria-valuemax', '100')
  })
})
