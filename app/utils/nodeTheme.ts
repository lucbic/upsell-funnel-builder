import type { BadgeProps } from '@nuxt/ui'

type NodeTheme = {
  badge: BadgeProps['color']
  icon: string
}

const NODE_THEME_CONFIG: Record<
  Funnel.NodeType,
  NodeTheme
> = {
  'sales-page': {
    badge: 'info',
    icon: 'text-info'
  },
  'order-page': {
    badge: 'warning',
    icon: 'text-warning'
  },
  upsell: {
    badge: 'success',
    icon: 'text-success'
  },
  downsell: {
    badge: 'error',
    icon: 'text-error'
  },
  'thank-you': {
    badge: 'success',
    icon: 'text-success'
  }
}

const DEFAULT_NODE_THEME: NodeTheme = {
  badge: 'neutral',
  icon: 'text-gray-400'
}

export const useNodeTheme = (nodeType?: Funnel.NodeType) =>
  nodeType
    ? (NODE_THEME_CONFIG[nodeType] ?? DEFAULT_NODE_THEME)
    : DEFAULT_NODE_THEME

export const getNodeIconClass = (
  nodeType: Funnel.NodeType
) =>
  NODE_THEME_CONFIG[nodeType]?.icon ??
  DEFAULT_NODE_THEME.icon
