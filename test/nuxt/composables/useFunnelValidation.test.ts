import {
  describe,
  it,
  expect,
  beforeEach,
  vi
} from 'vitest'
import { ref } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const mockToastAdd = vi.fn()
mockNuxtImport('useToast', () => () => ({
  add: mockToastAdd
}))
mockNuxtImport(
  'useDebounceFn',
  () => (fn: () => void) => fn
)

describe('useFunnelValidation', () => {
  let store: ReturnType<
    (typeof import('~/stores/funnel'))['useFunnelStore']
  >
  let validation: ReturnType<
    (typeof import('~/composables/useFunnelValidation'))['useFunnelValidation']
  >

  beforeEach(async () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn()
    })
    vi.stubGlobal(
      'useStorage',
      <T>(_key: string, defaultValue: T) =>
        ref(defaultValue)
    )

    const { useFunnelStore } =
      await import('~/stores/funnel')
    const { useFunnelValidation } =
      await import('~/composables/useFunnelValidation')

    store = useFunnelStore()
    store.resetToNewFunnel()
    validation = useFunnelValidation()
  })

  describe('computed properties', () => {
    it('isValid false for empty funnel', () => {
      expect(validation.isValid.value).toBe(false)
    })

    it('hasErrors true for empty funnel', () => {
      expect(validation.hasErrors.value).toBe(true)
    })

    it('errors includes empty-funnel error', () => {
      const ids = validation.errors.value.map(e => e.id)
      expect(ids).toContain('empty-funnel')
    })

    it('hasWarnings false for empty funnel', () => {
      expect(validation.hasWarnings.value).toBe(false)
    })

    it('totalIssueCount matches errors+warnings length', () => {
      expect(validation.totalIssueCount.value).toBe(
        validation.errors.value.length +
          validation.warnings.value.length
      )
    })

    it('allIssues combines errors and warnings', () => {
      expect(validation.allIssues.value.length).toBe(
        validation.errors.value.length +
          validation.warnings.value.length
      )
    })
  })

  describe('reactivity', () => {
    it('updates when store nodes change', () => {
      expect(validation.isValid.value).toBe(false)

      // Add a complete minimal funnel
      store.createNode('sales-page', { x: 0, y: 0 })
      store.createNode('order-page', { x: 100, y: 0 })
      store.createNode('thank-you', { x: 200, y: 0 })

      const spId = store.nodes[0]!.id
      const opId = store.nodes[1]!.id
      const tyId = store.nodes[2]!.id

      store.addEdge({
        source: spId,
        target: opId,
        sourceHandle: null,
        targetHandle: null
      })
      store.addEdge({
        source: opId,
        target: tyId,
        sourceHandle: 'accepted',
        targetHandle: null
      })

      expect(validation.isValid.value).toBe(true)
      expect(validation.hasErrors.value).toBe(false)
    })

    it('updates when edges change', () => {
      store.createNode('sales-page', { x: 0, y: 0 })
      store.createNode('order-page', { x: 100, y: 0 })
      store.createNode('thank-you', { x: 200, y: 0 })

      // Before connecting — has dead-ends/orphans
      const errorCountBefore =
        validation.errors.value.length

      const spId = store.nodes[0]!.id
      const opId = store.nodes[1]!.id
      const tyId = store.nodes[2]!.id

      store.addEdge({
        source: spId,
        target: opId,
        sourceHandle: null,
        targetHandle: null
      })
      store.addEdge({
        source: opId,
        target: tyId,
        sourceHandle: 'accepted',
        targetHandle: null
      })

      expect(validation.errors.value.length).toBeLessThan(
        errorCountBefore
      )
    })
  })
})
