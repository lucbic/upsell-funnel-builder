import type { Node, Edge, Connection } from '@vue-flow/core'

export const createNode = (
  type: Funnel.NodeType,
  overrides: Partial<Node<Funnel.NodeData>> = {}
): Node<Funnel.NodeData> => ({
  id: overrides.id ?? `node-${type}-1`,
  type,
  position: overrides.position ?? { x: 0, y: 0 },
  data: overrides.data ?? {
    title: type,
    icon: 'i-lucide-box',
    nodeType: type,
    primaryButtonLabel: 'Click'
  },
  ...overrides
})

export const createSalesPageNode = (
  overrides: Partial<Node<Funnel.NodeData>> = {}
) =>
  createNode('sales-page', {
    id: 'sp-1',
    data: {
      title: 'Sales Page',
      icon: 'i-lucide-presentation',
      nodeType: 'sales-page',
      primaryButtonLabel: 'Order Now'
    },
    ...overrides
  })

export const createOrderPageNode = (
  overrides: Partial<Node<Funnel.NodeData>> = {}
) =>
  createNode('order-page', {
    id: 'op-1',
    data: {
      title: 'Order Page',
      icon: 'i-lucide-shopping-cart',
      nodeType: 'order-page',
      primaryButtonLabel: 'Complete Order'
    },
    ...overrides
  })

export const createUpsellNode = (
  overrides: Partial<Node<Funnel.NodeData>> = {}
) =>
  createNode('upsell', {
    id: 'us-1',
    data: {
      title: 'Upsell 1',
      icon: 'i-lucide-trending-up',
      nodeType: 'upsell',
      primaryButtonLabel: 'Yes, Add This'
    },
    ...overrides
  })

export const createDownsellNode = (
  overrides: Partial<Node<Funnel.NodeData>> = {}
) =>
  createNode('downsell', {
    id: 'ds-1',
    data: {
      title: 'Downsell 1',
      icon: 'i-lucide-trending-down',
      nodeType: 'downsell',
      primaryButtonLabel: 'Take This Deal'
    },
    ...overrides
  })

export const createThankYouNode = (
  overrides: Partial<Node<Funnel.NodeData>> = {}
) =>
  createNode('thank-you', {
    id: 'ty-1',
    data: {
      title: 'Thank You',
      icon: 'i-lucide-check-circle',
      nodeType: 'thank-you',
      primaryButtonLabel: ''
    },
    ...overrides
  })

export const createEdge = (
  source: string,
  target: string,
  overrides: Partial<Edge> = {}
): Edge => ({
  id: overrides.id ?? `e-${source}-${target}`,
  source,
  target,
  ...overrides
})

export const createEdgeWithHandle = (
  source: string,
  target: string,
  sourceHandle: string,
  overrides: Partial<Edge> = {}
): Edge => ({
  id: `e-${source}-${sourceHandle}-${target}`,
  source,
  target,
  sourceHandle,
  ...overrides
})

export const createConnection = (
  source: string,
  target: string,
  overrides: Partial<Connection> = {}
): Connection => ({
  source,
  target,
  sourceHandle: overrides.sourceHandle ?? null,
  targetHandle: overrides.targetHandle ?? null,
  ...overrides
})

export const createValidFunnelContext = () => {
  const sp = createSalesPageNode()
  const op = createOrderPageNode()
  const ty = createThankYouNode()

  const nodes = [sp, op, ty]
  const edges = [
    createEdge(sp.id, op.id),
    createEdgeWithHandle(op.id, ty.id, 'accepted')
  ]

  return { nodes, edges }
}
