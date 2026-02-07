import { expect } from 'vitest'

export const expectValid = (result: Validation.ConnectionResult) => {
  expect(result.valid).toBe(true)
  expect(result.error).toBeUndefined()
}

export const expectInvalid = (
  result: Validation.ConnectionResult,
  errorSubstring: string
) => {
  expect(result.valid).toBe(false)
  expect(result.error).toBeDefined()
  expect(result.error!.toLowerCase()).toContain(
    errorSubstring.toLowerCase()
  )
}

export const findIssue = (
  issues: Validation.FunnelIssue[],
  idPrefix: string
) => issues.find(i => i.id.startsWith(idPrefix))
