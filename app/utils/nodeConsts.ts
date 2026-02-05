export const useNodeSizes = () => ({
  NODE_WIDTH: 200,
  NODE_HEIGHT: 75
})

export const useNodeTypeConfig = (): Record<
  Funnel.NodeType,
  Funnel.NodeTypeConfig
> => ({
  'sales-page': {
    label: 'Sales Page',
    icon: 'i-lucide-presentation',
    defaultButtonLabel: 'Order Now',
    defaultTitle: 'Sales Page',
    allowsOutgoing: true,
    maxOutgoingEdges: 1
  },
  'order-page': {
    label: 'Order Page',
    icon: 'i-lucide-shopping-cart',
    defaultButtonLabel: 'Complete Order',
    defaultTitle: 'Order Page',
    allowsOutgoing: true
  },
  upsell: {
    label: 'Upsell',
    icon: 'i-lucide-trending-up',
    defaultButtonLabel: 'Yes, Add This',
    defaultTitle: 'Upsell',
    allowsOutgoing: true,
    autoIncrement: true
  },
  downsell: {
    label: 'Downsell',
    icon: 'i-lucide-trending-down',
    defaultButtonLabel: 'Take This Deal',
    defaultTitle: 'Downsell',
    allowsOutgoing: true,
    autoIncrement: true
  },
  'thank-you': {
    label: 'Thank You',
    icon: 'i-lucide-check-circle',
    defaultButtonLabel: '',
    defaultTitle: 'Thank You',
    allowsOutgoing: false,
    maxOutgoingEdges: 0
  }
})
