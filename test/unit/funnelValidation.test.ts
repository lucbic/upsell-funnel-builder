import { describe, it, expect, vi, beforeAll } from 'vitest'
import { useNodeTypeConfig } from '~/utils/nodeConfigs'
import {
  validateEmptyFunnel,
  validateMissingEntryPoint,
  validateMissingTerminal,
  validateOrphanNodes,
  validateDeadEndNodes,
  validateUnreachableNodes,
  validateMultipleEntryPoints,
  validateIncompleteOfferPaths,
  validateFunnel,
  type FunnelValidationContext
} from '~/utils/funnelValidation'
import {
  createSalesPageNode,
  createOrderPageNode,
  createUpsellNode,
  createDownsellNode,
  createThankYouNode,
  createEdge,
  createEdgeWithHandle,
  createValidFunnelContext
} from '../helpers/nodeFixtures'
import { findIssue } from '../helpers/validationHelpers'

beforeAll(() => {
  vi.stubGlobal('useNodeTypeConfig', useNodeTypeConfig)
})

const ctx = (
  overrides: Partial<FunnelValidationContext> = {}
): FunnelValidationContext => ({
  nodes: overrides.nodes ?? [],
  edges: overrides.edges ?? []
})

describe('validateEmptyFunnel', () => {
  it('returns error when empty', () => {
    const issues = validateEmptyFunnel(ctx())
    expect(issues).toHaveLength(1)
    expect(issues[0].severity).toBe('error')
    expect(issues[0].id).toBe('empty-funnel')
  })

  it('passes when nodes exist', () => {
    const issues = validateEmptyFunnel(
      ctx({ nodes: [createSalesPageNode()] })
    )
    expect(issues).toHaveLength(0)
  })
})

describe('validateMissingEntryPoint', () => {
  it('returns error when no sales-page but has nodes', () => {
    const issues = validateMissingEntryPoint(
      ctx({ nodes: [createOrderPageNode()] })
    )
    expect(issues).toHaveLength(1)
    expect(issues[0].severity).toBe('error')
    expect(issues[0].message).toContain('Sales Page')
  })

  it('passes when sales-page exists', () => {
    const issues = validateMissingEntryPoint(
      ctx({ nodes: [createSalesPageNode()] })
    )
    expect(issues).toHaveLength(0)
  })

  it('passes when empty (caught by validateEmptyFunnel)', () => {
    const issues = validateMissingEntryPoint(ctx())
    expect(issues).toHaveLength(0)
  })
})

describe('validateMissingTerminal', () => {
  it('returns error when no thank-you but has nodes', () => {
    const issues = validateMissingTerminal(
      ctx({ nodes: [createSalesPageNode()] })
    )
    expect(issues).toHaveLength(1)
    expect(issues[0].severity).toBe('error')
    expect(issues[0].message).toContain('Thank You')
  })

  it('passes when thank-you exists', () => {
    const issues = validateMissingTerminal(
      ctx({ nodes: [createThankYouNode()] })
    )
    expect(issues).toHaveLength(0)
  })

  it('passes when empty', () => {
    const issues = validateMissingTerminal(ctx())
    expect(issues).toHaveLength(0)
  })
})

describe('validateOrphanNodes', () => {
  it('returns error for zero-connection nodes', () => {
    const orphan = createUpsellNode({ id: 'orphan' })
    const issues = validateOrphanNodes(
      ctx({ nodes: [orphan], edges: [] })
    )
    expect(issues).toHaveLength(1)
    expect(issues[0].id).toBe('orphan-orphan')
    expect(issues[0].nodeId).toBe('orphan')
  })

  it('passes for node with incoming only', () => {
    const node = createUpsellNode({ id: 'n1' })
    const issues = validateOrphanNodes(
      ctx({
        nodes: [node],
        edges: [createEdge('other', 'n1')]
      })
    )
    expect(issues).toHaveLength(0)
  })

  it('passes for node with outgoing only', () => {
    const node = createUpsellNode({ id: 'n1' })
    const issues = validateOrphanNodes(
      ctx({
        nodes: [node],
        edges: [createEdge('n1', 'other')]
      })
    )
    expect(issues).toHaveLength(0)
  })

  it('passes for node with both', () => {
    const node = createUpsellNode({ id: 'n1' })
    const issues = validateOrphanNodes(
      ctx({
        nodes: [node],
        edges: [
          createEdge('other', 'n1'),
          createEdge('n1', 'another')
        ]
      })
    )
    expect(issues).toHaveLength(0)
  })

  it('reports multiple orphans', () => {
    const issues = validateOrphanNodes(
      ctx({
        nodes: [
          createUpsellNode({ id: 'a' }),
          createDownsellNode({ id: 'b' })
        ],
        edges: []
      })
    )
    expect(issues).toHaveLength(2)
  })
})

describe('validateDeadEndNodes', () => {
  it('returns error for non-terminal without outgoing but with incoming', () => {
    const op = createOrderPageNode({ id: 'op' })
    const issues = validateDeadEndNodes(
      ctx({
        nodes: [op],
        edges: [createEdge('sp', 'op')]
      })
    )
    expect(issues).toHaveLength(1)
    expect(issues[0].id).toBe('dead-end-op')
  })

  it('passes for thank-you (terminal type)', () => {
    const ty = createThankYouNode({ id: 'ty' })
    const issues = validateDeadEndNodes(
      ctx({
        nodes: [ty],
        edges: [createEdge('op', 'ty')]
      })
    )
    expect(issues).toHaveLength(0)
  })

  it('passes when node has outgoing', () => {
    const op = createOrderPageNode({ id: 'op' })
    const issues = validateDeadEndNodes(
      ctx({
        nodes: [op],
        edges: [
          createEdge('sp', 'op'),
          createEdge('op', 'us')
        ]
      })
    )
    expect(issues).toHaveLength(0)
  })

  it('does not flag orphans (no incoming = not dead-end)', () => {
    const op = createOrderPageNode({ id: 'op' })
    const issues = validateDeadEndNodes(
      ctx({ nodes: [op], edges: [] })
    )
    expect(issues).toHaveLength(0)
  })
})

describe('validateUnreachableNodes', () => {
  it('warns for nodes disconnected from entry', () => {
    const sp = createSalesPageNode({ id: 'sp' })
    const op = createOrderPageNode({ id: 'op' })
    const unreachable = createUpsellNode({ id: 'unr' })

    const issues = validateUnreachableNodes(
      ctx({
        nodes: [sp, op, unreachable],
        edges: [createEdge('sp', 'op')]
      })
    )
    expect(issues).toHaveLength(1)
    expect(issues[0].id).toBe('unreachable-unr')
    expect(issues[0].severity).toBe('warning')
  })

  it('passes when all reachable', () => {
    const sp = createSalesPageNode({ id: 'sp' })
    const op = createOrderPageNode({ id: 'op' })
    const ty = createThankYouNode({ id: 'ty' })

    const issues = validateUnreachableNodes(
      ctx({
        nodes: [sp, op, ty],
        edges: [
          createEdge('sp', 'op'),
          createEdge('op', 'ty')
        ]
      })
    )
    expect(issues).toHaveLength(0)
  })

  it('skips sales-page nodes', () => {
    const sp1 = createSalesPageNode({ id: 'sp1' })
    const sp2 = createSalesPageNode({ id: 'sp2' })

    const issues = validateUnreachableNodes(
      ctx({ nodes: [sp1, sp2], edges: [] })
    )
    // sp2 is a sales-page so it's skipped even if unreachable from sp1
    expect(issues).toHaveLength(0)
  })

  it('returns empty when no entry nodes', () => {
    const op = createOrderPageNode()
    const issues = validateUnreachableNodes(
      ctx({ nodes: [op], edges: [] })
    )
    expect(issues).toHaveLength(0)
  })

  it('handles branching paths', () => {
    const sp = createSalesPageNode({ id: 'sp' })
    const op = createOrderPageNode({ id: 'op' })
    const us = createUpsellNode({ id: 'us' })
    const ds = createDownsellNode({ id: 'ds' })
    const ty = createThankYouNode({ id: 'ty' })

    const issues = validateUnreachableNodes(
      ctx({
        nodes: [sp, op, us, ds, ty],
        edges: [
          createEdge('sp', 'op'),
          createEdgeWithHandle('op', 'us', 'accepted'),
          createEdgeWithHandle('op', 'ds', 'declined'),
          createEdge('us', 'ty'),
          createEdge('ds', 'ty')
        ]
      })
    )
    expect(issues).toHaveLength(0)
  })
})

describe('validateMultipleEntryPoints', () => {
  it('warns when 2+ sales pages', () => {
    const issues = validateMultipleEntryPoints(
      ctx({
        nodes: [
          createSalesPageNode({ id: 'sp1' }),
          createSalesPageNode({ id: 'sp2' })
        ]
      })
    )
    expect(issues).toHaveLength(1)
    expect(issues[0].severity).toBe('warning')
    expect(issues[0].message).toContain('2')
  })

  it('passes for 1 sales page', () => {
    const issues = validateMultipleEntryPoints(
      ctx({ nodes: [createSalesPageNode()] })
    )
    expect(issues).toHaveLength(0)
  })

  it('passes for 0 sales pages', () => {
    const issues = validateMultipleEntryPoints(ctx())
    expect(issues).toHaveLength(0)
  })
})

describe('validateIncompleteOfferPaths', () => {
  it('warns when partially connected handles', () => {
    const op = createOrderPageNode({ id: 'op' })
    // Only 'accepted' handle connected, 'declined' missing
    const issues = validateIncompleteOfferPaths(
      ctx({
        nodes: [op],
        edges: [
          createEdgeWithHandle('op', 'us', 'accepted')
        ]
      })
    )
    expect(issues).toHaveLength(1)
    expect(issues[0].message).toContain('declined')
  })

  it('passes when all handles connected', () => {
    const op = createOrderPageNode({ id: 'op' })
    const issues = validateIncompleteOfferPaths(
      ctx({
        nodes: [op],
        edges: [
          createEdgeWithHandle('op', 'us', 'accepted'),
          createEdgeWithHandle('op', 'ds', 'declined')
        ]
      })
    )
    expect(issues).toHaveLength(0)
  })

  it('passes when no handles connected (not partial)', () => {
    const op = createOrderPageNode({ id: 'op' })
    const issues = validateIncompleteOfferPaths(
      ctx({ nodes: [op], edges: [] })
    )
    expect(issues).toHaveLength(0)
  })

  it('skips nodes without handles config', () => {
    const sp = createSalesPageNode({ id: 'sp' })
    const issues = validateIncompleteOfferPaths(
      ctx({ nodes: [sp], edges: [] })
    )
    expect(issues).toHaveLength(0)
  })

  it('reports for upsell with partial handles', () => {
    const us = createUpsellNode({ id: 'us' })
    const issues = validateIncompleteOfferPaths(
      ctx({
        nodes: [us],
        edges: [
          createEdgeWithHandle('us', 'ty', 'accepted')
        ]
      })
    )
    expect(issues).toHaveLength(1)
    expect(issues[0].id).toBe('incomplete-offer-us')
  })
})

describe('validateFunnel (integration)', () => {
  it('aggregates errors and warnings', () => {
    // Only an order page — no entry, no terminal, orphan
    const op = createOrderPageNode()
    const result = validateFunnel(ctx({ nodes: [op] }))

    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.isValid).toBe(false)
    expect(
      findIssue(result.errors, 'missing-entry')
    ).toBeDefined()
    expect(
      findIssue(result.errors, 'missing-terminal')
    ).toBeDefined()
    expect(findIssue(result.errors, 'orphan')).toBeDefined()
  })

  it('isValid reflects errors only (warnings okay)', () => {
    const { nodes, edges } = createValidFunnelContext()
    const result = validateFunnel(ctx({ nodes, edges }))

    // Valid funnel might have warnings (incomplete offer paths)
    // but isValid should be true since there are no errors
    expect(result.isValid).toBe(true)
  })

  it('valid minimal funnel (sales→order→thank-you)', () => {
    const { nodes, edges } = createValidFunnelContext()
    const result = validateFunnel(ctx({ nodes, edges }))

    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('invalid: empty funnel', () => {
    const result = validateFunnel(ctx())
    expect(result.isValid).toBe(false)
    expect(
      findIssue(result.errors, 'empty-funnel')
    ).toBeDefined()
  })

  it('reports warnings for multiple entry points', () => {
    const sp1 = createSalesPageNode({ id: 'sp1' })
    const sp2 = createSalesPageNode({ id: 'sp2' })
    const op = createOrderPageNode({ id: 'op' })
    const ty = createThankYouNode({ id: 'ty' })

    const result = validateFunnel(
      ctx({
        nodes: [sp1, sp2, op, ty],
        edges: [
          createEdge('sp1', 'op'),
          createEdgeWithHandle('op', 'ty', 'accepted')
        ]
      })
    )
    expect(
      findIssue(result.warnings, 'multiple-entry')
    ).toBeDefined()
  })
})
