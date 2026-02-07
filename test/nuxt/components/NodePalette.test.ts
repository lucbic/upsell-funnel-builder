import { describe, it, expect, vi } from 'vitest'
import {
  mountSuspended,
  mockNuxtImport
} from '@nuxt/test-utils/runtime'
import NodePalette from '~/components/NodePalette.vue'

const mockCreateNode = vi.fn()
const mockScreenToFlowCoordinate = vi.fn(() => ({
  x: 500,
  y: 500
}))

vi.mock('@vue-flow/core', async () => {
  const { defineComponent, h } = await import('vue')
  const HandleStub = defineComponent({
    name: 'Handle',
    props: ['type', 'position', 'id'],
    setup(props, { attrs, slots }) {
      return () =>
        h(
          'div',
          {
            class: 'handle-stub',
            'data-handle-type': props.type,
            'aria-label': attrs['aria-label']
          },
          slots.default?.()
        )
    }
  })
  return {
    useVueFlow: () => ({
      screenToFlowCoordinate: mockScreenToFlowCoordinate
    }),
    Handle: HandleStub,
    Position: {
      Left: 'left',
      Right: 'right',
      Top: 'top',
      Bottom: 'bottom'
    },
    MarkerType: {
      ArrowClosed: 'arrowclosed'
    }
  }
})

const mockToastAdd = vi.fn()
mockNuxtImport('useToast', () => () => ({
  add: mockToastAdd
}))
mockNuxtImport(
  'useDebounceFn',
  () => (fn: () => void) => fn
)
mockNuxtImport('useFunnelCanvasStore', () => () => ({
  createNode: mockCreateNode,
  addNodeToCanvas: (type: string) => {
    mockCreateNode(type, { x: 0, y: 0 })
  },
  nodes: [],
  edges: [],
  funnelName: 'Test'
}))

describe('NodePalette', () => {
  describe('rendering', () => {
    it('renders all 5 node types', async () => {
      const wrapper = await mountSuspended(NodePalette)
      const draggables = wrapper.findAll(
        '[draggable="true"]'
      )
      expect(draggables.length).toBe(5)
    })

    it('shows labels for each type', async () => {
      const wrapper = await mountSuspended(NodePalette)
      expect(wrapper.text()).toContain('Sales Page')
      expect(wrapper.text()).toContain('Order Page')
      expect(wrapper.text()).toContain('Upsell')
      expect(wrapper.text()).toContain('Downsell')
      expect(wrapper.text()).toContain('Thank You')
    })

    it('has section heading', async () => {
      const wrapper = await mountSuspended(NodePalette)
      expect(wrapper.text()).toContain('Funnel Steps')
    })
  })

  describe('drag handlers', () => {
    it('sets dataTransfer on dragstart', async () => {
      const wrapper = await mountSuspended(NodePalette)
      const firstDraggable = wrapper.find(
        '[draggable="true"]'
      )

      const setData = vi.fn()
      await firstDraggable.trigger('dragstart', {
        dataTransfer: {
          setData,
          effectAllowed: ''
        }
      })

      expect(setData).toHaveBeenCalledWith(
        'application/vueflow',
        expect.any(String)
      )
    })
  })

  describe('keyboard handlers', () => {
    it('calls createNode on Enter key', async () => {
      // Mock the .vue-flow element for getBoundingClientRect
      const mockEl = document.createElement('div')
      mockEl.classList.add('vue-flow')
      mockEl.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        width: 1000,
        height: 800,
        right: 1000,
        bottom: 800,
        x: 0,
        y: 0,
        toJSON: () => ({})
      }))
      document.body.appendChild(mockEl)

      const wrapper = await mountSuspended(NodePalette)
      const firstDraggable = wrapper.find(
        '[draggable="true"]'
      )

      await (firstDraggable.element as HTMLElement).focus()
      await firstDraggable.trigger('keydown.enter')

      expect(mockCreateNode).toHaveBeenCalled()

      document.body.removeChild(mockEl)
    })
  })

  describe('accessibility', () => {
    it('each palette item has aria-label', async () => {
      const wrapper = await mountSuspended(NodePalette)
      const items = wrapper.findAll('[draggable="true"]')

      for (const item of items) {
        expect(item.attributes('aria-label')).toContain(
          'Add'
        )
        expect(item.attributes('aria-label')).toContain(
          'to canvas'
        )
      }
    })

    it('each palette item has tabindex=0', async () => {
      const wrapper = await mountSuspended(NodePalette)
      const items = wrapper.findAll('[draggable="true"]')

      for (const item of items) {
        expect(item.attributes('tabindex')).toBe('0')
      }
    })

    it('section has aria-label', async () => {
      const wrapper = await mountSuspended(NodePalette)
      expect(
        wrapper.find('[aria-label="Node palette"]').exists()
      ).toBe(true)
    })
  })
})
