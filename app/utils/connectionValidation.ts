import type { Node, Edge, Connection } from '@vue-flow/core'

export type ValidationResult = {
  valid: boolean
  error?: string
}

export type ValidationContext = {
  connection: Connection
  nodes: Node<Funnel.NodeData>[]
  edges: Edge[]
  sourceNode?: Node<Funnel.NodeData>
  targetNode?: Node<Funnel.NodeData>
}

export type Validator = (
  context: ValidationContext
) => ValidationResult

const invalidConnection = (
  error: string
): ValidationResult => ({
  valid: false,
  error
})

export const composeValidators = (
  ...validators: Validator[]
): Validator => {
  return context => {
    for (const validator of validators) {
      const result = validator(context)
      if (!result.valid) {
        return result
      }
    }
    return { valid: true }
  }
}

export const sourceNodeExists: Validator = context => {
  const sourceNode = context.nodes.find(
    n => n.id === context.connection.source
  )

  if (!sourceNode) {
    return invalidConnection('Source node not found')
  }

  context.sourceNode = sourceNode
  return { valid: true }
}

export const targetNodeExists: Validator = context => {
  const targetNode = context.nodes.find(
    n => n.id === context.connection.target
  )

  if (!targetNode) {
    return invalidConnection('Target node not found')
  }

  context.targetNode = targetNode
  return { valid: true }
}

export const noSelfConnection: Validator = context => {
  if (
    context.connection.source === context.connection.target
  ) {
    return invalidConnection(
      'Cannot connect a node to itself'
    )
  }

  return { valid: true }
}

export const thankYouNoOutgoing: Validator = context => {
  if (context.sourceNode?.type === 'thank-you') {
    return invalidConnection(
      'Thank You pages cannot have outgoing connections'
    )
  }

  return { valid: true }
}

export const salesPageTarget: Validator = context => {
  if (
    context.sourceNode?.type === 'sales-page' &&
    context.targetNode?.type !== 'order-page'
  ) {
    return invalidConnection(
      'Sales Page can only connect to Order Page'
    )
  }

  return { valid: true }
}

export const salesPageMaxConnections: Validator =
  context => {
    if (context.sourceNode?.type === 'sales-page') {
      const existingEdges = context.edges.filter(
        e => e.source === context.sourceNode?.id
      )

      if (existingEdges.length >= 1) {
        return {
          valid: false,
          error:
            'Sales Page can only have one outgoing connection'
        }
      }
    }

    return { valid: true }
  }

export const noDuplicateConnection: Validator = context => {
  const duplicate = context.edges.find(
    e =>
      e.source === context.connection.source &&
      e.target === context.connection.target &&
      e.sourceHandle === context.connection.sourceHandle
  )
  if (duplicate)
    return invalidConnection(
      'This connection already exists'
    )

  return { valid: true }
}

export const noSourceToSource: Validator = context => {
  if (context.connection.targetHandle)
    return invalidConnection(
      'Cannot connect to an output handle'
    )

  return { valid: true }
}

export const maxOneIncoming: Validator = context => {
  const existing = context.edges.find(
    e => e.target === context.connection.target
  )

  if (existing)
    return invalidConnection(
      'This node already has an incoming connection'
    )

  return { valid: true }
}

export const handleMaxOneEdge: Validator = context => {
  const { sourceHandle } = context.connection
  if (!sourceHandle) return { valid: true }

  const existing = context.edges.find(
    e =>
      e.source === context.connection.source &&
      e.sourceHandle === sourceHandle
  )

  if (existing)
    return invalidConnection(
      'This handle already has a connection'
    )

  return { valid: true }
}

export const getConnectionValidator = () =>
  composeValidators(
    sourceNodeExists,
    targetNodeExists,
    noSelfConnection,
    noSourceToSource,
    thankYouNoOutgoing,
    salesPageTarget,
    salesPageMaxConnections,
    noDuplicateConnection,
    maxOneIncoming,
    handleMaxOneEdge
  )
