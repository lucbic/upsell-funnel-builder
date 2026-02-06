import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { defineComponent, h } from 'vue'
import BuilderPanelNode from '~/components/BuilderPanel/Node.vue'

vi.mock('@vue-flow/core', () => {
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
            'data-handle-id': props.id,
            'aria-label': attrs['aria-label']
          },
          slots.default?.()
        )
    }
  })
  return {
    Handle: HandleStub,
    Position: { Left: 'left', Right: 'right', Top: 'top', Bottom: 'bottom' },
    MarkerType: { ArrowClosed: 'arrowclosed' }
  }
})

const salesData: Funnel.NodeData = {
  title: 'Sales Page',
  icon: 'i-lucide-presentation',
  nodeType: 'sales-page',
  primaryButtonLabel: 'Order Now'
}

const orderData: Funnel.NodeData = {
  title: 'Order Page',
  icon: 'i-lucide-shopping-cart',
  nodeType: 'order-page',
  primaryButtonLabel: 'Complete Order'
}

const thankYouData: Funnel.NodeData = {
  title: 'Thank You',
  icon: 'i-lucide-check-circle',
  nodeType: 'thank-you',
  primaryButtonLabel: ''
}

const upsellData: Funnel.NodeData = {
  title: 'Upsell 1',
  icon: 'i-lucide-trending-up',
  nodeType: 'upsell',
  primaryButtonLabel: 'Yes, Add This'
}

describe('BuilderPanelNode', () => {
  describe('palette mode', () => {
    it('renders with smaller height', async () => {
      const wrapper = await mountSuspended(BuilderPanelNode, {
        props: { palette: true, data: salesData }
      })

      const style = wrapper.find('div').attributes('style')
      expect(style).toContain('width: 100%')
      // NODE_HEIGHT / 2 = 37.5px
      expect(style).toContain('37.5px')
    })

    it('shows icon and title', async () => {
      const wrapper = await mountSuspended(BuilderPanelNode, {
        props: { palette: true, data: salesData }
      })

      expect(wrapper.text()).toContain('Sales Page')
    })
  })

  describe('canvas mode', () => {
    it('renders with full dimensions', async () => {
      const wrapper = await mountSuspended(BuilderPanelNode, {
        props: { palette: false, data: salesData }
      })

      const style = wrapper.find('div').attributes('style')
      expect(style).toContain('200px')
      expect(style).toContain('75px')
    })

    it('renders target handle for non-sales-page', async () => {
      const wrapper = await mountSuspended(BuilderPanelNode, {
        props: { palette: false, data: orderData }
      })

      const handles = wrapper.findAll('[aria-label="Input connection"]')
      expect(handles.length).toBe(1)
    })

    it('no target handle for sales-page', async () => {
      const wrapper = await mountSuspended(BuilderPanelNode, {
        props: { palette: false, data: salesData }
      })

      const handles = wrapper.findAll('[aria-label="Input connection"]')
      expect(handles.length).toBe(0)
    })

    it('single source handle for sales-page (non-branching)', async () => {
      const wrapper = await mountSuspended(BuilderPanelNode, {
        props: { palette: false, data: salesData }
      })

      const handles = wrapper.findAll('[aria-label="Output connection"]')
      expect(handles.length).toBe(1)
    })

    it('no single source handle for thank-you', async () => {
      const wrapper = await mountSuspended(BuilderPanelNode, {
        props: { palette: false, data: thankYouData }
      })

      const handles = wrapper.findAll('[aria-label="Output connection"]')
      expect(handles.length).toBe(0)
    })

    it('renders branching handles for order-page', async () => {
      const wrapper = await mountSuspended(BuilderPanelNode, {
        props: { palette: false, data: orderData }
      })

      const purchasedHandle = wrapper.findAll('[aria-label="Purchased output"]')
      const declinedHandle = wrapper.findAll('[aria-label="Declined output"]')
      expect(purchasedHandle.length).toBe(1)
      expect(declinedHandle.length).toBe(1)
    })

    it('renders branching handles for upsell', async () => {
      const wrapper = await mountSuspended(BuilderPanelNode, {
        props: { palette: false, data: upsellData }
      })

      const acceptedHandle = wrapper.findAll('[aria-label="Accepted output"]')
      const declinedHandle = wrapper.findAll('[aria-label="Declined output"]')
      expect(acceptedHandle.length).toBe(1)
      expect(declinedHandle.length).toBe(1)
    })
  })

  describe('selection state', () => {
    it('applies selection class when selected', async () => {
      const wrapper = await mountSuspended(BuilderPanelNode, {
        props: { palette: false, data: salesData, selected: true }
      })

      expect(wrapper.find('.node-selected').exists()).toBe(true)
    })

    it('no selection class when not selected', async () => {
      const wrapper = await mountSuspended(BuilderPanelNode, {
        props: { palette: false, data: salesData, selected: false }
      })

      expect(wrapper.find('.node-selected').exists()).toBe(false)
    })
  })

  describe('accessibility', () => {
    it('computes aria-label correctly', async () => {
      const wrapper = await mountSuspended(BuilderPanelNode, {
        props: { palette: false, data: salesData }
      })

      expect(wrapper.find('[role="button"]').attributes('aria-label')).toBe(
        'Sales Page - Sales Page node'
      )
    })

    it('has role=button', async () => {
      const wrapper = await mountSuspended(BuilderPanelNode, {
        props: { palette: false, data: salesData }
      })

      expect(wrapper.find('[role="button"]').exists()).toBe(true)
    })
  })
})
