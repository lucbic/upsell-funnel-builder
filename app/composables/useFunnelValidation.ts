import type {
  FunnelValidationResult,
  FunnelValidationIssue
} from '~/utils/funnelValidation'
import { validateFunnel } from '~/utils/funnelValidation'

export const useFunnelValidation = () => {
  const store = useFunnel()

  const validationResult = computed<FunnelValidationResult>(
    () =>
      validateFunnel({
        nodes: store.nodes,
        edges: store.edges
      })
  )

  const isValid = computed(
    () => validationResult.value.isValid
  )

  const errors = computed(
    () => validationResult.value.errors
  )

  const warnings = computed(
    () => validationResult.value.warnings
  )

  const hasErrors = computed(() => errors.value.length > 0)

  const hasWarnings = computed(
    () => warnings.value.length > 0
  )

  const totalIssueCount = computed(
    () => errors.value.length + warnings.value.length
  )

  const allIssues = computed<FunnelValidationIssue[]>(
    () => [...errors.value, ...warnings.value]
  )

  return {
    validationResult,
    isValid,
    errors,
    warnings,
    hasErrors,
    hasWarnings,
    totalIssueCount,
    allIssues
  }
}
