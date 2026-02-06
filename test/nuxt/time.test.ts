import { describe, it, expect } from 'vitest'
import { wait } from '~/utils/time'

describe('wait', () => {
  it('resolves after specified delay', async () => {
    const start = Date.now()
    await wait(50)
    const elapsed = Date.now() - start
    expect(elapsed).toBeGreaterThanOrEqual(40)
  })

  it('handles 0ms', async () => {
    const result = await wait(0)
    expect(result).toBeUndefined()
  })

  it('returns a promise', () => {
    const result = wait(10)
    expect(result).toBeInstanceOf(Promise)
  })
})
