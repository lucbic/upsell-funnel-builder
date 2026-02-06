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
    maxOutgoingEdges: 1,
    maxIncomingEdges: 0
  },
  'order-page': {
    label: 'Order Page',
    icon: 'i-lucide-shopping-cart',
    defaultButtonLabel: 'Complete Order',
    defaultTitle: 'Order Page',
    allowsOutgoing: true,
    maxOutgoingEdges: 2,
    maxIncomingEdges: 1,
    handles: [
      {
        id: 'accepted',
        label: 'Purchased',
        icon: 'i-lucide-check',
        color: 'success',
        position: 'right'
      },
      {
        id: 'declined',
        label: 'Declined',
        icon: 'i-lucide-x',
        color: 'error',
        position: 'bottom'
      }
    ]
  },
  upsell: {
    label: 'Upsell',
    icon: 'i-lucide-trending-up',
    defaultButtonLabel: 'Yes, Add This',
    defaultTitle: 'Upsell',
    allowsOutgoing: true,
    autoIncrement: true,
    maxOutgoingEdges: 2,
    handles: [
      {
        id: 'accepted',
        label: 'Accepted',
        icon: 'i-lucide-check',
        color: 'success',
        position: 'right'
      },
      {
        id: 'declined',
        label: 'Declined',
        icon: 'i-lucide-x',
        color: 'error',
        position: 'bottom'
      }
    ]
  },
  downsell: {
    label: 'Downsell',
    icon: 'i-lucide-trending-down',
    defaultButtonLabel: 'Take This Deal',
    defaultTitle: 'Downsell',
    allowsOutgoing: true,
    autoIncrement: true,
    maxOutgoingEdges: 2,
    handles: [
      {
        id: 'accepted',
        label: 'Accepted',
        icon: 'i-lucide-check',
        color: 'success',
        position: 'right'
      },
      {
        id: 'declined',
        label: 'Declined',
        icon: 'i-lucide-x',
        color: 'error',
        position: 'bottom'
      }
    ]
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
