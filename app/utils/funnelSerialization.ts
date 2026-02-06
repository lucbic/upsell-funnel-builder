import type { Node as VFNode, Edge as VFEdge } from '@vue-flow/core'

export const deserializeNodes = (
  serializedNodes: Funnel.SerializedNode[],
  nodeTypeConfig: Record<string, Funnel.NodeTypeConfig>
): VFNode<Funnel.NodeData>[] =>
  serializedNodes.map(node => ({
    ...node,
    type: node.data?.nodeType!,
    ariaLabel: `${node.data.title} - ${nodeTypeConfig[node.data?.nodeType!]?.label ?? node.data?.nodeType!}`
  }))

export const deserializeEdges = (
  serializedEdges: Funnel.SerializedEdge[]
): VFEdge[] => {
  const { EDGE_DEFAULTS } = useConstants()
  return serializedEdges.map(edge => ({
    ...edge,
    ...EDGE_DEFAULTS
  }))
}
