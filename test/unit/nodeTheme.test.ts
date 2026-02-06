import { describe, it, expect } from 'vitest'
import {
  useNodeTheme,
  getNodeIconClass
} from '~/utils/nodeTheme'

describe('useNodeTheme', () => {
  it('returns correct theme for sales-page', () => {
    const theme = useNodeTheme('sales-page')
    expect(theme.badge).toBe('info')
    expect(theme.icon).toBe('text-info')
  })

  it('returns correct theme for order-page', () => {
    const theme = useNodeTheme('order-page')
    expect(theme.badge).toBe('warning')
    expect(theme.icon).toBe('text-warning')
  })

  it('returns correct theme for upsell', () => {
    const theme = useNodeTheme('upsell')
    expect(theme.badge).toBe('success')
  })

  it('returns correct theme for downsell', () => {
    const theme = useNodeTheme('downsell')
    expect(theme.badge).toBe('error')
  })

  it('returns correct theme for thank-you', () => {
    const theme = useNodeTheme('thank-you')
    expect(theme.badge).toBe('success')
  })

  it('returns default theme when no type provided', () => {
    const theme = useNodeTheme()
    expect(theme.badge).toBe('neutral')
    expect(theme.icon).toBe('text-gray-400')
  })

  it('returns default theme for unknown type', () => {
    const theme = useNodeTheme(
      'nonexistent' as Funnel.NodeType
    )
    expect(theme.badge).toBe('neutral')
  })
})

describe('getNodeIconClass', () => {
  it('returns icon class for known type', () => {
    expect(getNodeIconClass('sales-page')).toBe('text-info')
    expect(getNodeIconClass('downsell')).toBe('text-error')
  })

  it('returns default for unknown type', () => {
    expect(
      getNodeIconClass('nonexistent' as Funnel.NodeType)
    ).toBe('text-gray-400')
  })
})
