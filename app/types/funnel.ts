declare global {
  namespace Funnel {
    type NodeType = 'sales-page' | 'order-page' | 'upsell' | 'downsell' | 'thank-you'

    type NodeData = {
      title: string
      icon: string
      primaryButtonLabel?: string
      nodeType: NodeType
      sequenceNumber?: number
    }

    type NodeTypeConfig = {
      label: string
      icon: string
      defaultButtonLabel: string
      defaultTitle: string
      allowsOutgoing: boolean
      maxOutgoingEdges?: number
      autoIncrement?: boolean
    }

    // Serialization types (strip VueFlow runtime props for clean JSON)
    type SerializedNode = {
      id: string
      type: NodeType
      position: { x: number; y: number }
      data: NodeData
    }

    type SerializedEdge = {
      id: string
      source: string
      target: string
      sourceHandle?: string | null
      targetHandle?: string | null
    }

    // Full saved funnel data
    type SavedFunnel = {
      id: string
      name: string
      nodes: SerializedNode[]
      edges: SerializedEdge[]
      nodeTypeCounts: Record<string, number>
      nodeIdCounter: number
      createdAt: number
      updatedAt: number
    }

    // Lightweight type for list display
    type FunnelListItem = {
      id: string
      name: string
      nodeCount: number
      updatedAt: number
    }
  }
}
export {}
