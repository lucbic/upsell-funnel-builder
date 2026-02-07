import type { Node, Edge, Connection } from '@vue-flow/core'

export type ValidationResult = {
  valid: boolean
  error?: string
}

/**
 * Mutable context threaded through the validator pipeline.
 * `sourceNode` and `targetNode` start undefined and are populated
 * by the `sourceNodeExists` / `targetNodeExists` validators —
 * later validators in the chain can safely read them.
 */
export type ValidationContext = {
  connection: Connection
  nodes: Node<Funnel.NodeData>[]
  edges: Edge[]
  sourceNode?: Node<Funnel.NodeData>
  targetNode?: Node<Funnel.NodeData>
}

export type Validator<
  C extends ValidationContext = ValidationContext
> = (context: C) => ValidationResult

/**
 * Context after node resolution — `sourceNode` and `targetNode`
 * are guaranteed to be defined by the resolve phase.
 */
export type ResolvedValidationContext =
  ValidationContext & {
    sourceNode: Node<Funnel.NodeData>
    targetNode: Node<Funnel.NodeData>
  }

const invalidConnection = (
  error: string
): ValidationResult => ({
  valid: false,
  error
})

/**
 * Chains validators into a pipeline that short-circuits on first failure.
 * Validators may mutate the shared context (e.g. populating `sourceNode`),
 * so execution order matters.
 */
export const composeValidators = <
  C extends ValidationContext = ValidationContext
>(
  ...validators: Validator<C>[]
): Validator<C> => {
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

export const thankYouNoOutgoing: Validator<
  ResolvedValidationContext
> = context => {
  if (context.sourceNode.type === 'thank-you') {
    return invalidConnection(
      'Thank You pages cannot have outgoing connections'
    )
  }

  return { valid: true }
}

export const salesPageTarget: Validator<
  ResolvedValidationContext
> = context => {
  if (
    context.sourceNode.type === 'sales-page' &&
    context.targetNode.type !== 'order-page'
  ) {
    return invalidConnection(
      'Sales Page can only connect to Order Page'
    )
  }

  return { valid: true }
}

export const salesPageMaxConnections: Validator<
  ResolvedValidationContext
> = context => {
  if (context.sourceNode.type === 'sales-page') {
    const existingEdges = context.edges.filter(
      e => e.source === context.sourceNode.id
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

/**
 * Config-driven incoming edge limit per node type.
 * `maxIncomingEdges: undefined` = unlimited, `0` = no incoming allowed.
 */
export const maxIncomingEdges: Validator<
  ResolvedValidationContext
> = context => {
  const nodeTypeConfig = getNodeTypeConfig()
  const targetType = context.targetNode
    .type as Funnel.NodeType
  const config = nodeTypeConfig[targetType]
  const max = config.maxIncomingEdges

  if (max === undefined) return { valid: true }

  const incomingCount = context.edges.filter(
    e => e.target === context.connection.target
  ).length

  if (incomingCount >= max)
    return invalidConnection(
      max === 0
        ? `${config.label} cannot have incoming connections`
        : `${config.label} can only have ${max} incoming connection${max > 1 ? 's' : ''}`
    )

  return { valid: true }
}

/**
 * Limits each source *handle* to one outgoing edge. This is distinct from
 * node-level edge limits — a node with two handles can still have two edges,
 * but each handle can only drive one connection.
 */
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

/**
 * Returns the composed connection validator. The resolve phase populates
 * `sourceNode` and `targetNode`; the validate phase runs with compile-time
 * guarantees that both fields are defined.
 */
export const getConnectionValidator = (): Validator => {
  const resolve = composeValidators(
    sourceNodeExists,
    targetNodeExists
  )
  const validate =
    composeValidators<ResolvedValidationContext>(
      noSelfConnection,
      noSourceToSource,
      thankYouNoOutgoing,
      salesPageTarget,
      salesPageMaxConnections,
      noDuplicateConnection,
      maxIncomingEdges,
      handleMaxOneEdge
    )

  return context => {
    const resolveResult = resolve(context)
    if (!resolveResult.valid) return resolveResult
    return validate(context as ResolvedValidationContext)
  }
}
