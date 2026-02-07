const invalidConnection = (
  error: string
): Validation.ConnectionResult => ({
  valid: false,
  error
})

/**
 * Chains validators into a pipeline that short-circuits on first failure.
 * Validators may mutate the shared context (e.g. populating `sourceNode`),
 * so execution order matters.
 */
export const composeValidators = <
  C extends Validation.ConnectionContext = Validation.ConnectionContext
>(
  ...validators: Validation.ConnectionValidator<C>[]
): Validation.ConnectionValidator<C> => {
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

export const sourceNodeExists: Validation.ConnectionValidator = context => {
  const sourceNode = context.nodes.find(
    n => n.id === context.connection.source
  )

  if (!sourceNode) {
    return invalidConnection('Source node not found')
  }

  context.sourceNode = sourceNode
  return { valid: true }
}

export const targetNodeExists: Validation.ConnectionValidator = context => {
  const targetNode = context.nodes.find(
    n => n.id === context.connection.target
  )

  if (!targetNode) {
    return invalidConnection('Target node not found')
  }

  context.targetNode = targetNode
  return { valid: true }
}

export const noSelfConnection: Validation.ConnectionValidator = context => {
  if (
    context.connection.source === context.connection.target
  ) {
    return invalidConnection(
      'Cannot connect a node to itself'
    )
  }

  return { valid: true }
}

export const thankYouNoOutgoing: Validation.ConnectionValidator<
  Validation.ResolvedConnectionContext
> = context => {
  if (context.sourceNode.type === 'thank-you') {
    return invalidConnection(
      'Thank You pages cannot have outgoing connections'
    )
  }

  return { valid: true }
}

export const salesPageTarget: Validation.ConnectionValidator<
  Validation.ResolvedConnectionContext
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

export const salesPageMaxConnections: Validation.ConnectionValidator<
  Validation.ResolvedConnectionContext
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

export const noDuplicateConnection: Validation.ConnectionValidator = context => {
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

export const noSourceToSource: Validation.ConnectionValidator = context => {
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
export const maxIncomingEdges: Validation.ConnectionValidator<
  Validation.ResolvedConnectionContext
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
export const handleMaxOneEdge: Validation.ConnectionValidator = context => {
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
export const getConnectionValidator = (): Validation.ConnectionValidator => {
  const resolve = composeValidators(
    sourceNodeExists,
    targetNodeExists
  )
  const validate =
    composeValidators<Validation.ResolvedConnectionContext>(
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
    return validate(context as Validation.ResolvedConnectionContext)
  }
}
