declare global {
  namespace Funnel {
    type NodeType = 'sales-page' | 'order-page' | 'upsell' | 'downsell' | 'thank-you'

    type NodeData = {
      title: string
      icon: string
      primaryButtonLabel: string
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
  }
}
export {}
