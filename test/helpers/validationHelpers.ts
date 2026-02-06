import { expect } from 'vitest'
import type { ValidationResult } from '~/utils/connectionValidation'
import type { FunnelValidationIssue } from '~/utils/funnelValidation'

export const expectValid = (result: ValidationResult) => {
  expect(result.valid).toBe(true)
  expect(result.error).toBeUndefined()
}

export const expectInvalid = (
  result: ValidationResult,
  errorSubstring: string
) => {
  expect(result.valid).toBe(false)
  expect(result.error).toBeDefined()
  expect(result.error!.toLowerCase()).toContain(
    errorSubstring.toLowerCase()
  )
}

export const findIssue = (
  issues: FunnelValidationIssue[],
  idPrefix: string
) => issues.find(i => i.id.startsWith(idPrefix))
