import {
  describe,
  it,
  expect,
  vi,
  beforeEach
} from 'vitest'
import {
  mountSuspended,
  mockNuxtImport
} from '@nuxt/test-utils/runtime'
import {
  ref,
  computed,
  type Ref,
  type ComputedRef
} from 'vue'
import ValidationPane from '~/components/builder-panel/ValidationPane.vue'

const mockSetCenter = vi.fn()
const mockAddSelectedNodes = vi.fn()
const mockRemoveSelectedNodes = vi.fn()
const mockGetNodes = ref([
  { id: 'node-1', position: { x: 0, y: 0 } }
])

vi.mock('@vue-flow/core', () => ({
  useVueFlow: () => ({
    setCenter: mockSetCenter,
    addSelectedNodes: mockAddSelectedNodes,
    removeSelectedNodes: mockRemoveSelectedNodes,
    getNodes: mockGetNodes
  }),
  MarkerType: {
    ArrowClosed: 'arrowclosed'
  }
}))

type ValidationIssue = {
  id: string
  severity: string
  message: string
  nodeId?: string
}

type MockValidation = {
  isValid: Ref<boolean>
  errors: Ref<ValidationIssue[]>
  warnings: Ref<ValidationIssue[]>
  hasErrors: ComputedRef<boolean>
  hasWarnings: ComputedRef<boolean>
  totalIssueCount: ComputedRef<number>
}

const mockValidation: MockValidation = {
  isValid: ref(true),
  errors: ref<ValidationIssue[]>([]),
  warnings: ref<ValidationIssue[]>([]),
  hasErrors: computed(
    () => mockValidation.errors.value.length > 0
  ),
  hasWarnings: computed(
    () => mockValidation.warnings.value.length > 0
  ),
  totalIssueCount: computed(
    () =>
      mockValidation.errors.value.length +
      mockValidation.warnings.value.length
  )
}

mockNuxtImport(
  'useFunnelValidation',
  () => () => mockValidation
)

describe('ValidationPane', () => {
  beforeEach(() => {
    mockValidation.isValid.value = true
    mockValidation.errors.value = []
    mockValidation.warnings.value = []
    mockSetCenter.mockClear()
    mockAddSelectedNodes.mockClear()
    mockRemoveSelectedNodes.mockClear()
  })

  describe('status display', () => {
    it('shows "Funnel OK" when valid and no warnings', async () => {
      const wrapper = await mountSuspended(ValidationPane)
      expect(wrapper.text()).toContain('Funnel OK')
    })

    it('shows warning count when valid with warnings', async () => {
      mockValidation.isValid.value = true
      mockValidation.warnings.value = [
        {
          id: 'w1',
          severity: 'warning',
          message: 'Some warning'
        }
      ]

      const wrapper = await mountSuspended(ValidationPane)
      expect(wrapper.text()).toContain('1 warning')
    })

    it('shows issue count when invalid', async () => {
      mockValidation.isValid.value = false
      mockValidation.errors.value = [
        {
          id: 'e1',
          severity: 'error',
          message: 'Some error'
        }
      ]
      mockValidation.warnings.value = [
        {
          id: 'w1',
          severity: 'warning',
          message: 'Some warning'
        }
      ]

      const wrapper = await mountSuspended(ValidationPane)
      expect(wrapper.text()).toContain('2 issues')
    })

    it('shows green check icon when valid', async () => {
      const wrapper = await mountSuspended(ValidationPane)
      expect(wrapper.find('.text-green-500').exists()).toBe(
        true
      )
    })

    it('shows red icon when invalid', async () => {
      mockValidation.isValid.value = false
      mockValidation.errors.value = [
        {
          id: 'e1',
          severity: 'error',
          message: 'Error'
        }
      ]

      const wrapper = await mountSuspended(ValidationPane)
      expect(wrapper.find('.text-red-500').exists()).toBe(
        true
      )
    })
  })

  describe('expand/collapse', () => {
    it('content region is not visible by default', async () => {
      const wrapper = await mountSuspended(ValidationPane)
      expect(
        wrapper.find('#validation-content').exists()
      ).toBe(false)
    })
  })

  describe('issue rendering', () => {
    it('renders error messages when expanded', async () => {
      mockValidation.isValid.value = false
      mockValidation.errors.value = [
        {
          id: 'e1',
          severity: 'error',
          message: 'Node is orphan'
        }
      ]

      const wrapper = await mountSuspended(ValidationPane)
      // Click to expand
      await wrapper.find('button').trigger('click')

      expect(wrapper.text()).toContain('Errors')
      expect(wrapper.text()).toContain('Node is orphan')
    })

    it('renders warning messages when expanded', async () => {
      mockValidation.warnings.value = [
        {
          id: 'w1',
          severity: 'warning',
          message: 'Node is unreachable'
        }
      ]

      const wrapper = await mountSuspended(ValidationPane)
      await wrapper.find('button').trigger('click')

      expect(wrapper.text()).toContain('Warnings')
      expect(wrapper.text()).toContain(
        'Node is unreachable'
      )
    })

    it('shows no-issues message when clean', async () => {
      const wrapper = await mountSuspended(ValidationPane)
      await wrapper.find('button').trigger('click')

      expect(wrapper.text()).toContain('No issues found')
    })
  })

  describe('keyboard a11y', () => {
    it('issue items have tabindex', async () => {
      mockValidation.isValid.value = false
      mockValidation.errors.value = [
        {
          id: 'e1',
          severity: 'error',
          message: 'Error',
          nodeId: 'node-1'
        }
      ]

      const wrapper = await mountSuspended(ValidationPane)
      await wrapper.find('button').trigger('click')

      const issueEl = wrapper.find(
        '[role="button"][tabindex="0"]'
      )
      expect(issueEl.exists()).toBe(true)
    })

    it('has aria-expanded on toggle button', async () => {
      const wrapper = await mountSuspended(ValidationPane)
      const btn = wrapper.find('button')
      expect(btn.attributes('aria-expanded')).toBeDefined()
    })
  })
})
