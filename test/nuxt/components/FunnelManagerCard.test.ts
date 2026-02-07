import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import FunnelManagerCard from '~/components/funnel-manager/Card.vue'

const baseItem: Funnel.FunnelListItem = {
  id: 'funnel-1',
  name: 'Test Funnel',
  nodeCount: 5,
  updatedAt: Date.now()
}

describe('FunnelManagerCard', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('rendering', () => {
    it('displays funnel name', async () => {
      const wrapper = await mountSuspended(FunnelManagerCard, {
        props: { item: baseItem, isCurrent: false }
      })
      expect(wrapper.text()).toContain('Test Funnel')
    })

    it('displays node count', async () => {
      const wrapper = await mountSuspended(FunnelManagerCard, {
        props: { item: baseItem, isCurrent: false }
      })
      expect(wrapper.text()).toContain('5 nodes')
    })

    it('shows "Current" badge when isCurrent', async () => {
      const wrapper = await mountSuspended(FunnelManagerCard, {
        props: { item: baseItem, isCurrent: true }
      })
      expect(wrapper.text()).toContain('Current')
    })

    it('hides "Current" badge when not current', async () => {
      const wrapper = await mountSuspended(FunnelManagerCard, {
        props: { item: baseItem, isCurrent: false }
      })
      // Check that UBadge with "Current" is not shown
      const badges = wrapper.findAll('[class*="badge"]')
      const currentBadge = badges.filter(b =>
        b.text().includes('Current')
      )
      expect(currentBadge.length).toBe(0)
    })
  })

  describe('formatDate', () => {
    it('shows "Just now" for recent timestamps', async () => {
      const item = { ...baseItem, updatedAt: Date.now() - 5000 }
      const wrapper = await mountSuspended(FunnelManagerCard, {
        props: { item, isCurrent: false }
      })
      expect(wrapper.text()).toContain('Just now')
    })

    it('shows minutes ago', async () => {
      const item = {
        ...baseItem,
        updatedAt: Date.now() - 5 * 60 * 1000
      }
      const wrapper = await mountSuspended(FunnelManagerCard, {
        props: { item, isCurrent: false }
      })
      expect(wrapper.text()).toContain('5m ago')
    })

    it('shows hours ago', async () => {
      const item = {
        ...baseItem,
        updatedAt: Date.now() - 3 * 60 * 60 * 1000
      }
      const wrapper = await mountSuspended(FunnelManagerCard, {
        props: { item, isCurrent: false }
      })
      expect(wrapper.text()).toContain('3h ago')
    })

    it('shows days ago', async () => {
      const item = {
        ...baseItem,
        updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000
      }
      const wrapper = await mountSuspended(FunnelManagerCard, {
        props: { item, isCurrent: false }
      })
      expect(wrapper.text()).toContain('2d ago')
    })

    it('shows formatted date for 7+ days', async () => {
      const item = {
        ...baseItem,
        updatedAt: Date.now() - 10 * 24 * 60 * 60 * 1000
      }
      const wrapper = await mountSuspended(FunnelManagerCard, {
        props: { item, isCurrent: false }
      })
      // Should not contain "d ago" pattern for 7+ days
      expect(wrapper.text()).not.toContain('10d ago')
    })
  })

  describe('interactions', () => {
    it('emits select on click when not current', async () => {
      const wrapper = await mountSuspended(FunnelManagerCard, {
        props: { item: baseItem, isCurrent: false }
      })

      await wrapper.find('[role="button"]').trigger('click')
      expect(wrapper.emitted('select')).toBeTruthy()
      expect(wrapper.emitted('select')![0]).toEqual([baseItem.id])
    })

    it('does not emit select when current', async () => {
      const wrapper = await mountSuspended(FunnelManagerCard, {
        props: { item: baseItem, isCurrent: true }
      })

      await wrapper.find('[role="button"]').trigger('click')
      expect(wrapper.emitted('select')).toBeFalsy()
    })

    it('emits delete on delete button click', async () => {
      const wrapper = await mountSuspended(FunnelManagerCard, {
        props: { item: baseItem, isCurrent: false }
      })

      await wrapper
        .find('[aria-label="Delete funnel"]')
        .trigger('click')
      expect(wrapper.emitted('delete')).toBeTruthy()
      expect(wrapper.emitted('delete')![0]).toEqual([baseItem.id])
    })
  })

  describe('accessibility', () => {
    it('has aria-label on card', async () => {
      const wrapper = await mountSuspended(FunnelManagerCard, {
        props: { item: baseItem, isCurrent: false }
      })

      const card = wrapper.find('[role="button"]')
      const label = card.attributes('aria-label')
      expect(label).toContain('Test Funnel')
      expect(label).toContain('5 nodes')
    })

    it('includes "currently open" in aria-label when current', async () => {
      const wrapper = await mountSuspended(FunnelManagerCard, {
        props: { item: baseItem, isCurrent: true }
      })

      const label = wrapper
        .find('[role="button"]')
        .attributes('aria-label')
      expect(label).toContain('currently open')
    })

    it('sets aria-current when current', async () => {
      const wrapper = await mountSuspended(FunnelManagerCard, {
        props: { item: baseItem, isCurrent: true }
      })

      expect(
        wrapper.find('[aria-current]').exists()
      ).toBe(true)
    })

    it('has role="button" on card', async () => {
      const wrapper = await mountSuspended(FunnelManagerCard, {
        props: { item: baseItem, isCurrent: false }
      })

      expect(wrapper.find('[role="button"]').exists()).toBe(true)
    })
  })
})
