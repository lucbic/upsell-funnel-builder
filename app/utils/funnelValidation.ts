import type { Node, Edge } from '@vue-flow/core'

export type ValidationSeverity = 'error' | 'warning'

export type FunnelValidationIssue = {
  id: string
  severity: ValidationSeverity
  message: string
  nodeId?: string
  nodeName?: string
}

export type FunnelValidationResult = {
  isValid: boolean
  errors: FunnelValidationIssue[]
  warnings: FunnelValidationIssue[]
}

export type FunnelValidationContext = {
  nodes: Node<Funnel.NodeData>[]
  edges: Edge[]
}

type FunnelValidator = (
  context: FunnelValidationContext
) => FunnelValidationIssue[]

const getNodeName = (node: Node<Funnel.NodeData>) =>
  node.data?.title ?? node.id

const getReachableNodeIds = (
  entryNodeIds: string[],
  edges: Edge[]
): Set<string> => {
  const reachable = new Set<string>(entryNodeIds)
  const queue = [...entryNodeIds]

  while (queue.length > 0) {
    const currentId = queue.shift()!
    const outgoingEdges = edges.filter(
      e => e.source === currentId
    )

    for (const edge of outgoingEdges) {
      if (!reachable.has(edge.target)) {
        reachable.add(edge.target)
        queue.push(edge.target)
      }
    }
  }

  return reachable
}

export const validateEmptyFunnel: FunnelValidator = ({
  nodes
}) => {
  if (nodes.length === 0) {
    return [
      {
        id: 'empty-funnel',
        severity: 'error',
        message: 'This funnel has no nodes'
      }
    ]
  }
  return []
}

export const validateMissingEntryPoint: FunnelValidator = ({
  nodes
}) => {
  const salesPages = nodes.filter(
    n => n.type === 'sales-page'
  )

  if (salesPages.length === 0 && nodes.length > 0) {
    return [
      {
        id: 'missing-entry-point',
        severity: 'error',
        message:
          'This funnel has no Sales Page (entry point)'
      }
    ]
  }
  return []
}

export const validateMissingTerminal: FunnelValidator = ({
  nodes
}) => {
  const thankYouPages = nodes.filter(
    n => n.type === 'thank-you'
  )

  if (thankYouPages.length === 0 && nodes.length > 0) {
    return [
      {
        id: 'missing-terminal',
        severity: 'error',
        message:
          'This funnel has no Thank You page (terminal)'
      }
    ]
  }
  return []
}

export const validateOrphanNodes: FunnelValidator = ({
  nodes,
  edges
}) => {
  const issues: FunnelValidationIssue[] = []

  for (const node of nodes) {
    const hasIncoming = edges.some(
      e => e.target === node.id
    )
    const hasOutgoing = edges.some(
      e => e.source === node.id
    )

    if (!hasIncoming && !hasOutgoing) {
      issues.push({
        id: `orphan-${node.id}`,
        severity: 'error',
        message: `"${getNodeName(node)}" is an orphan node (no connections)`,
        nodeId: node.id,
        nodeName: getNodeName(node)
      })
    }
  }

  return issues
}

export const validateDeadEndNodes: FunnelValidator = ({
  nodes,
  edges
}) => {
  const issues: FunnelValidationIssue[] = []
  const terminalTypes: Funnel.NodeType[] = ['thank-you']

  for (const node of nodes) {
    if (
      terminalTypes.includes(node.type as Funnel.NodeType)
    )
      continue

    const hasOutgoing = edges.some(
      e => e.source === node.id
    )
    const hasIncoming = edges.some(
      e => e.target === node.id
    )

    if (!hasOutgoing && hasIncoming) {
      issues.push({
        id: `dead-end-${node.id}`,
        severity: 'error',
        message: `"${getNodeName(node)}" has no outgoing connection`,
        nodeId: node.id,
        nodeName: getNodeName(node)
      })
    }
  }

  return issues
}

export const validateUnreachableNodes: FunnelValidator = ({
  nodes,
  edges
}) => {
  const issues: FunnelValidationIssue[] = []
  const entryNodes = nodes.filter(
    n => n.type === 'sales-page'
  )

  if (entryNodes.length === 0) return []

  const entryNodeIds = entryNodes.map(n => n.id)
  const reachableIds = getReachableNodeIds(
    entryNodeIds,
    edges
  )

  for (const node of nodes) {
    if (node.type === 'sales-page') continue

    if (!reachableIds.has(node.id)) {
      issues.push({
        id: `unreachable-${node.id}`,
        severity: 'warning',
        message: `"${getNodeName(node)}" is unreachable from the entry point`,
        nodeId: node.id,
        nodeName: getNodeName(node)
      })
    }
  }

  return issues
}

export const validateMultipleEntryPoints: FunnelValidator =
  ({ nodes }) => {
    const salesPages = nodes.filter(
      n => n.type === 'sales-page'
    )

    if (salesPages.length > 1) {
      return [
        {
          id: 'multiple-entry-points',
          severity: 'warning',
          message: `This funnel has ${salesPages.length} Sales Pages`
        }
      ]
    }
    return []
  }

export const validateIncompleteOfferPaths: FunnelValidator =
  ({ nodes, edges }) => {
    const issues: FunnelValidationIssue[] = []
    const offerTypes: Funnel.NodeType[] = [
      'upsell',
      'downsell'
    ]

    for (const node of nodes) {
      if (
        !offerTypes.includes(node.type as Funnel.NodeType)
      )
        continue

      const outgoingCount = edges.filter(
        e => e.source === node.id
      ).length

      if (outgoingCount === 1) {
        issues.push({
          id: `incomplete-offer-${node.id}`,
          severity: 'warning',
          message: `"${getNodeName(node)}" should have both accept and decline paths`,
          nodeId: node.id,
          nodeName: getNodeName(node)
        })
      }
    }

    return issues
  }

const errorValidators: FunnelValidator[] = [
  validateEmptyFunnel,
  validateMissingEntryPoint,
  validateMissingTerminal,
  validateOrphanNodes,
  validateDeadEndNodes
]

const warningValidators: FunnelValidator[] = [
  validateUnreachableNodes,
  validateMultipleEntryPoints,
  validateIncompleteOfferPaths
]

export const validateFunnel = (
  context: FunnelValidationContext
): FunnelValidationResult => {
  const errors: FunnelValidationIssue[] = []
  const warnings: FunnelValidationIssue[] = []

  for (const validator of errorValidators) {
    errors.push(...validator(context))
  }

  for (const validator of warningValidators) {
    warnings.push(...validator(context))
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}
