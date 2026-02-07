import { describe, it, expect } from 'vitest'
import { getNodeTypeConfig } from '~/utils/nodeConfigs'
import { getConstants } from '~/utils/constants'

describe('constants', () => {
  const {
    NODE_WIDTH,
    NODE_HEIGHT,
    KEYBOARD_INSERT_NODE_GAP
  } = getConstants()

  it('returns NODE_WIDTH=200', () => {
    expect(NODE_WIDTH).toBe(200)
  })

  it('returns NODE_HEIGHT=75', () => {
    expect(NODE_HEIGHT).toBe(75)
  })

  it('returns KEYBOARD_INSERT_NODE_GAP=75', () => {
    expect(KEYBOARD_INSERT_NODE_GAP).toBe(75)
  })
})

describe('getNodeTypeConfig', () => {
  const config = getNodeTypeConfig()

  it('returns all 5 node types', () => {
    expect(Object.keys(config)).toHaveLength(5)
    expect(config).toHaveProperty('sales-page')
    expect(config).toHaveProperty('order-page')
    expect(config).toHaveProperty('upsell')
    expect(config).toHaveProperty('downsell')
    expect(config).toHaveProperty('thank-you')
  })

  it('each type has label, icon, defaultTitle', () => {
    for (const [, cfg] of Object.entries(config)) {
      expect(cfg.label).toBeTruthy()
      expect(cfg.icon).toBeTruthy()
      expect(cfg.defaultTitle).toBeTruthy()
    }
  })

  describe('sales-page', () => {
    const sp = config['sales-page']

    it('maxIncomingEdges=0', () => {
      expect(sp.maxIncomingEdges).toBe(0)
    })

    it('maxOutgoingEdges=1', () => {
      expect(sp.maxOutgoingEdges).toBe(1)
    })

    it('has no handles', () => {
      expect(sp.handles).toBeUndefined()
    })

    it('does not auto-increment', () => {
      expect(sp.autoIncrement).toBeFalsy()
    })
  })

  describe('order-page', () => {
    const op = config['order-page']

    it('maxIncomingEdges=1', () => {
      expect(op.maxIncomingEdges).toBe(1)
    })

    it('has 2 handles', () => {
      expect(op.handles).toHaveLength(2)
    })

    it('handles have correct IDs', () => {
      const ids = op.handles!.map(h => h.id)
      expect(ids).toContain('accepted')
      expect(ids).toContain('declined')
    })

    it('handles have positions and colors', () => {
      for (const h of op.handles!) {
        expect(h.position).toBeTruthy()
        expect(h.color).toBeTruthy()
      }
    })
  })

  describe('upsell', () => {
    const us = config.upsell

    it('autoIncrement=true', () => {
      expect(us.autoIncrement).toBe(true)
    })

    it('has 2 handles', () => {
      expect(us.handles).toHaveLength(2)
    })

    it('no maxIncomingEdges (unlimited)', () => {
      expect(us.maxIncomingEdges).toBeUndefined()
    })
  })

  describe('downsell', () => {
    const ds = config.downsell

    it('autoIncrement=true', () => {
      expect(ds.autoIncrement).toBe(true)
    })

    it('has 2 handles', () => {
      expect(ds.handles).toHaveLength(2)
    })

    it('no maxIncomingEdges (unlimited)', () => {
      expect(ds.maxIncomingEdges).toBeUndefined()
    })
  })

  describe('thank-you', () => {
    const ty = config['thank-you']

    it('allowsOutgoing=false', () => {
      expect(ty.allowsOutgoing).toBe(false)
    })

    it('maxOutgoingEdges=0', () => {
      expect(ty.maxOutgoingEdges).toBe(0)
    })

    it('has no handles', () => {
      expect(ty.handles).toBeUndefined()
    })
  })
})
