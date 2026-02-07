declare global {
  namespace Validation {
    type Severity = 'error' | 'warning'

    /** A single validation problem found in the funnel graph. */
    type FunnelIssue = {
      id: string
      severity: Severity
      message: string
      nodeId?: string
      nodeName?: string
    }

    /**
     * Aggregated validation result. `isValid` reflects errors only —
     * a funnel with warnings but no errors is still considered valid.
     */
    type FunnelResult = {
      isValid: boolean
      errors: FunnelIssue[]
      warnings: FunnelIssue[]
    }

    /** Read-only snapshot of the funnel graph passed to each validator. */
    type FunnelContext = {
      nodes: import('@vue-flow/core').Node<Funnel.NodeData>[]
      edges: import('@vue-flow/core').Edge[]
    }

    type ConnectionResult = {
      valid: boolean
      error?: string
    }

    /**
     * Mutable context threaded through the validator pipeline.
     * `sourceNode` and `targetNode` start undefined and are populated
     * by the `sourceNodeExists` / `targetNodeExists` validators —
     * later validators in the chain can safely read them.
     */
    type ConnectionContext = {
      connection: import('@vue-flow/core').Connection
      nodes: import('@vue-flow/core').Node<Funnel.NodeData>[]
      edges: import('@vue-flow/core').Edge[]
      sourceNode?: import('@vue-flow/core').Node<Funnel.NodeData>
      targetNode?: import('@vue-flow/core').Node<Funnel.NodeData>
    }

    type ConnectionValidator<
      C extends ConnectionContext = ConnectionContext
    > = (context: C) => ConnectionResult

    /**
     * Context after node resolution — `sourceNode` and `targetNode`
     * are guaranteed to be defined by the resolve phase.
     */
    type ResolvedConnectionContext = ConnectionContext & {
      sourceNode: import('@vue-flow/core').Node<Funnel.NodeData>
      targetNode: import('@vue-flow/core').Node<Funnel.NodeData>
    }
  }
}
export {}
