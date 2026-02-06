import { describe, it, expect, vi, beforeAll } from 'vitest'
import { useNodeTypeConfig } from '~/utils/nodeConfigs'
import {
  composeValidators,
  sourceNodeExists,
  targetNodeExists,
  noSelfConnection,
  noSourceToSource,
  thankYouNoOutgoing,
  salesPageTarget,
  salesPageMaxConnections,
  noDuplicateConnection,
  maxIncomingEdges,
  handleMaxOneEdge,
  getConnectionValidator,
  type ValidationContext,
  type Validator
} from '~/utils/connectionValidation'
import {
  createSalesPageNode,
  createOrderPageNode,
  createUpsellNode,
  createDownsellNode,
  createThankYouNode,
  createEdge,
  createEdgeWithHandle,
  createConnection
} from '../helpers/nodeFixtures'
import { expectValid, expectInvalid } from '../helpers/validationHelpers'

beforeAll(() => {
  vi.stubGlobal('useNodeTypeConfig', useNodeTypeConfig)
})

const buildContext = (
  overrides: Partial<ValidationContext> = {}
): ValidationContext => ({
  connection: overrides.connection ?? createConnection('a', 'b'),
  nodes: overrides.nodes ?? [],
  edges: overrides.edges ?? [],
  sourceNode: overrides.sourceNode,
  targetNode: overrides.targetNode
})

describe('composeValidators', () => {
  it('returns valid when all validators pass', () => {
    const pass: Validator = () => ({ valid: true })
    const composed = composeValidators(pass, pass, pass)
    const result = composed(buildContext())
    expectValid(result)
  })

  it('short-circuits on first failure', () => {
    const fail: Validator = () => ({
      valid: false,
      error: 'first error'
    })
    const neverCalled = vi.fn<Validator>(() => ({
      valid: true
    }))

    const composed = composeValidators(fail, neverCalled)
    const result = composed(buildContext())

    expectInvalid(result, 'first error')
    expect(neverCalled).not.toHaveBeenCalled()
  })

  it('returns error message from failing validator', () => {
    const pass: Validator = () => ({ valid: true })
    const fail: Validator = () => ({
      valid: false,
      error: 'specific error'
    })

    const composed = composeValidators(pass, fail)
    expectInvalid(composed(buildContext()), 'specific error')
  })
})

describe('sourceNodeExists', () => {
  it('passes when source node found', () => {
    const sp = createSalesPageNode({ id: 'a' })
    const ctx = buildContext({
      connection: createConnection('a', 'b'),
      nodes: [sp]
    })
    expectValid(sourceNodeExists(ctx))
  })

  it('fails when source node missing', () => {
    const ctx = buildContext({
      connection: createConnection('missing', 'b'),
      nodes: []
    })
    expectInvalid(sourceNodeExists(ctx), 'source node not found')
  })

  it('mutates context.sourceNode', () => {
    const sp = createSalesPageNode({ id: 'a' })
    const ctx = buildContext({
      connection: createConnection('a', 'b'),
      nodes: [sp]
    })
    sourceNodeExists(ctx)
    expect(ctx.sourceNode).toBe(sp)
  })
})

describe('targetNodeExists', () => {
  it('passes when target node found', () => {
    const op = createOrderPageNode({ id: 'b' })
    const ctx = buildContext({
      connection: createConnection('a', 'b'),
      nodes: [op]
    })
    expectValid(targetNodeExists(ctx))
  })

  it('fails when target node missing', () => {
    const ctx = buildContext({
      connection: createConnection('a', 'missing'),
      nodes: []
    })
    expectInvalid(targetNodeExists(ctx), 'target node not found')
  })

  it('mutates context.targetNode', () => {
    const op = createOrderPageNode({ id: 'b' })
    const ctx = buildContext({
      connection: createConnection('a', 'b'),
      nodes: [op]
    })
    targetNodeExists(ctx)
    expect(ctx.targetNode).toBe(op)
  })
})

describe('noSelfConnection', () => {
  it('passes for different IDs', () => {
    const ctx = buildContext({
      connection: createConnection('a', 'b')
    })
    expectValid(noSelfConnection(ctx))
  })

  it('fails when source === target', () => {
    const ctx = buildContext({
      connection: createConnection('a', 'a')
    })
    expectInvalid(noSelfConnection(ctx), 'itself')
  })
})

describe('noSourceToSource', () => {
  it('passes when targetHandle is null', () => {
    const ctx = buildContext({
      connection: createConnection('a', 'b', {
        targetHandle: null
      })
    })
    expectValid(noSourceToSource(ctx))
  })

  it('passes when targetHandle is undefined', () => {
    const conn = createConnection('a', 'b')
    conn.targetHandle = undefined as unknown as string | null
    const ctx = buildContext({ connection: conn })
    expectValid(noSourceToSource(ctx))
  })

  it('fails when targetHandle is set', () => {
    const ctx = buildContext({
      connection: createConnection('a', 'b', {
        targetHandle: 'some-handle'
      })
    })
    expectInvalid(noSourceToSource(ctx), 'output handle')
  })
})

describe('thankYouNoOutgoing', () => {
  it('passes for non-thank-you source', () => {
    const ctx = buildContext({
      sourceNode: createSalesPageNode()
    })
    expectValid(thankYouNoOutgoing(ctx))
  })

  it('fails for thank-you source', () => {
    const ctx = buildContext({
      sourceNode: createThankYouNode()
    })
    expectInvalid(
      thankYouNoOutgoing(ctx),
      'cannot have outgoing'
    )
  })
})

describe('salesPageTarget', () => {
  it('passes for sales→order', () => {
    const ctx = buildContext({
      sourceNode: createSalesPageNode(),
      targetNode: createOrderPageNode()
    })
    expectValid(salesPageTarget(ctx))
  })

  it('fails for sales→upsell', () => {
    const ctx = buildContext({
      sourceNode: createSalesPageNode(),
      targetNode: createUpsellNode()
    })
    expectInvalid(salesPageTarget(ctx), 'only connect to order page')
  })

  it('fails for sales→downsell', () => {
    const ctx = buildContext({
      sourceNode: createSalesPageNode(),
      targetNode: createDownsellNode()
    })
    expectInvalid(salesPageTarget(ctx), 'only connect to order page')
  })

  it('fails for sales→thank-you', () => {
    const ctx = buildContext({
      sourceNode: createSalesPageNode(),
      targetNode: createThankYouNode()
    })
    expectInvalid(salesPageTarget(ctx), 'only connect to order page')
  })

  it('passes for non-sales source', () => {
    const ctx = buildContext({
      sourceNode: createOrderPageNode(),
      targetNode: createUpsellNode()
    })
    expectValid(salesPageTarget(ctx))
  })
})

describe('salesPageMaxConnections', () => {
  it('passes when 0 existing edges', () => {
    const sp = createSalesPageNode()
    const ctx = buildContext({
      sourceNode: sp,
      edges: []
    })
    expectValid(salesPageMaxConnections(ctx))
  })

  it('fails when ≥1 existing outgoing edge', () => {
    const sp = createSalesPageNode()
    const ctx = buildContext({
      sourceNode: sp,
      edges: [createEdge(sp.id, 'op-1')]
    })
    expectInvalid(
      salesPageMaxConnections(ctx),
      'one outgoing connection'
    )
  })

  it('passes for non-sales source', () => {
    const op = createOrderPageNode()
    const ctx = buildContext({
      sourceNode: op,
      edges: [createEdge(op.id, 'us-1'), createEdge(op.id, 'ds-1')]
    })
    expectValid(salesPageMaxConnections(ctx))
  })
})

describe('noDuplicateConnection', () => {
  it('passes for unique connection', () => {
    const ctx = buildContext({
      connection: createConnection('a', 'b'),
      edges: [createEdge('a', 'c')]
    })
    expectValid(noDuplicateConnection(ctx))
  })

  it('fails for exact duplicate (same source+target+handle)', () => {
    const ctx = buildContext({
      connection: createConnection('a', 'b', {
        sourceHandle: 'accepted'
      }),
      edges: [
        createEdgeWithHandle('a', 'b', 'accepted')
      ]
    })
    expectInvalid(noDuplicateConnection(ctx), 'already exists')
  })

  it('passes when different handle', () => {
    const ctx = buildContext({
      connection: createConnection('a', 'b', {
        sourceHandle: 'declined'
      }),
      edges: [
        createEdgeWithHandle('a', 'b', 'accepted')
      ]
    })
    expectValid(noDuplicateConnection(ctx))
  })
})

describe('maxIncomingEdges', () => {
  it('enforces sales-page maxIncoming=0', () => {
    const sp = createSalesPageNode({ id: 'target' })
    const ctx = buildContext({
      connection: createConnection('a', 'target'),
      targetNode: sp,
      edges: []
    })
    expectInvalid(maxIncomingEdges(ctx), 'cannot have incoming')
  })

  it('enforces order-page maxIncoming=1', () => {
    const op = createOrderPageNode({ id: 'target' })
    const ctx = buildContext({
      connection: createConnection('a', 'target'),
      targetNode: op,
      edges: [createEdge('existing', 'target')]
    })
    expectInvalid(maxIncomingEdges(ctx), '1 incoming connection')
  })

  it('allows order-page when no existing incoming', () => {
    const op = createOrderPageNode({ id: 'target' })
    const ctx = buildContext({
      connection: createConnection('a', 'target'),
      targetNode: op,
      edges: []
    })
    expectValid(maxIncomingEdges(ctx))
  })

  it('allows unlimited for upsell', () => {
    const us = createUpsellNode({ id: 'target' })
    const ctx = buildContext({
      connection: createConnection('a', 'target'),
      targetNode: us,
      edges: [
        createEdge('x', 'target'),
        createEdge('y', 'target'),
        createEdge('z', 'target')
      ]
    })
    expectValid(maxIncomingEdges(ctx))
  })

  it('allows unlimited for downsell', () => {
    const ds = createDownsellNode({ id: 'target' })
    const ctx = buildContext({
      connection: createConnection('a', 'target'),
      targetNode: ds,
      edges: [
        createEdge('x', 'target'),
        createEdge('y', 'target')
      ]
    })
    expectValid(maxIncomingEdges(ctx))
  })

  it('provides contextual error for 0 max', () => {
    const sp = createSalesPageNode({ id: 'target' })
    const ctx = buildContext({
      connection: createConnection('a', 'target'),
      targetNode: sp,
      edges: []
    })
    const result = maxIncomingEdges(ctx)
    expect(result.error).toContain('Sales Page')
    expect(result.error).toContain('cannot have incoming')
  })

  it('provides contextual error for max=1', () => {
    const op = createOrderPageNode({ id: 'target' })
    const ctx = buildContext({
      connection: createConnection('a', 'target'),
      targetNode: op,
      edges: [createEdge('existing', 'target')]
    })
    const result = maxIncomingEdges(ctx)
    expect(result.error).toContain('Order Page')
    expect(result.error).toContain('1 incoming connection')
  })
})

describe('handleMaxOneEdge', () => {
  it('passes when handle is free', () => {
    const ctx = buildContext({
      connection: createConnection('a', 'b', {
        sourceHandle: 'accepted'
      }),
      edges: []
    })
    expectValid(handleMaxOneEdge(ctx))
  })

  it('fails when handle already taken', () => {
    const ctx = buildContext({
      connection: createConnection('a', 'b', {
        sourceHandle: 'accepted'
      }),
      edges: [
        createEdgeWithHandle('a', 'c', 'accepted')
      ]
    })
    expectInvalid(
      handleMaxOneEdge(ctx),
      'already has a connection'
    )
  })

  it('passes when sourceHandle is undefined/null', () => {
    const ctx = buildContext({
      connection: createConnection('a', 'b')
    })
    expectValid(handleMaxOneEdge(ctx))
  })
})

describe('getConnectionValidator (integration)', () => {
  it('accepts valid sales→order connection', () => {
    const sp = createSalesPageNode({ id: 'sp' })
    const op = createOrderPageNode({ id: 'op' })
    const validator = getConnectionValidator()
    const ctx = buildContext({
      connection: createConnection('sp', 'op'),
      nodes: [sp, op],
      edges: []
    })
    expectValid(validator(ctx))
  })

  it('rejects missing source node first', () => {
    const op = createOrderPageNode({ id: 'op' })
    const validator = getConnectionValidator()
    const ctx = buildContext({
      connection: createConnection('missing', 'op'),
      nodes: [op],
      edges: []
    })
    expectInvalid(validator(ctx), 'source node not found')
  })

  it('enforces full validation chain', () => {
    const sp = createSalesPageNode({ id: 'sp' })
    const op = createOrderPageNode({ id: 'op' })
    const validator = getConnectionValidator()

    // Already has one edge from sp
    const ctx = buildContext({
      connection: createConnection('sp', 'op'),
      nodes: [sp, op],
      edges: [createEdge('sp', 'op')]
    })
    // Should fail on salesPageMaxConnections or noDuplicateConnection
    const result = validator(ctx)
    expect(result.valid).toBe(false)
  })

  it('rejects self-connection', () => {
    const sp = createSalesPageNode({ id: 'sp' })
    const validator = getConnectionValidator()
    const ctx = buildContext({
      connection: createConnection('sp', 'sp'),
      nodes: [sp],
      edges: []
    })
    expectInvalid(validator(ctx), 'itself')
  })

  it('rejects sales→upsell through full chain', () => {
    const sp = createSalesPageNode({ id: 'sp' })
    const us = createUpsellNode({ id: 'us' })
    const validator = getConnectionValidator()
    const ctx = buildContext({
      connection: createConnection('sp', 'us'),
      nodes: [sp, us],
      edges: []
    })
    expectInvalid(validator(ctx), 'only connect to order page')
  })
})
