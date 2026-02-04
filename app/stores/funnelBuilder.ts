import type { Node, Edge, Connection } from '@vue-flow/core'
import { NODE_TYPE_CONFIG } from '~/utils/funnelConfig'

export const useFunnelBuilderStore = defineStore('funnelBuilder', () => {
  const nodes = ref<Node<Funnel.NodeData>[]>([])
  const edges = ref<Edge[]>([])

  const nodeTypeCounts = ref<Record<string, number>>({
    upsell: 0,
    downsell: 0
  })

  let nodeIdCounter = 0

  const createNode = (type: Funnel.NodeType, position: { x: number, y: number }) => {
    const config = NODE_TYPE_CONFIG[type]
    nodeIdCounter++

    let title = config.defaultTitle
    let sequenceNumber: number | undefined

    if (config.autoIncrement) {
      const count = (nodeTypeCounts.value[type] ?? 0) + 1
      nodeTypeCounts.value[type] = count
      sequenceNumber = count
      title = `${config.defaultTitle} ${sequenceNumber}`
    }

    const newNode: Node<Funnel.NodeData> = {
      id: `node-${nodeIdCounter}`,
      type,
      position,
      data: {
        title,
        icon: config.icon,
        primaryButtonLabel: config.defaultButtonLabel,
        nodeType: type,
        sequenceNumber
      }
    }

    nodes.value.push(newNode)
    return newNode
  }

  const validateConnection = (connection: Connection): boolean => {
    const sourceNode = nodes.value.find(n => n.id === connection.source)
    if (!sourceNode) return false

    // No self-connections
    if (connection.source === connection.target) return false

    // Thank You cannot have outgoing edges
    if (sourceNode.type === 'thank-you') return false

    // Sales Page max 1 outgoing edge
    if (sourceNode.type === 'sales-page') {
      const existingEdges = edges.value.filter(e => e.source === sourceNode.id)
      if (existingEdges.length >= 1) return false
    }

    // No duplicate edges
    const duplicate = edges.value.find(
      e => e.source === connection.source && e.target === connection.target
    )
    if (duplicate) return false

    return true
  }

  const addEdge = (connection: Connection) => {
    const newEdge: Edge = {
      id: `e-${connection.source}-${connection.target}`,
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      type: 'smoothstep',
      animated: true
    }

    edges.value.push(newEdge)
  }

  const deleteNode = (nodeId: string) => {
    const node = nodes.value.find(n => n.id === nodeId)
    if (!node) return

    const nodeType = node.type as Funnel.NodeType
    if (NODE_TYPE_CONFIG[nodeType]?.autoIncrement) {
      nodeTypeCounts.value[nodeType] = (nodeTypeCounts.value[nodeType] ?? 1) - 1
    }

    edges.value = edges.value.filter(
      e => e.source !== nodeId && e.target !== nodeId
    )

    nodes.value = nodes.value.filter(n => n.id !== nodeId)
  }

  return {
    nodes,
    edges,
    nodeTypeCounts,
    createNode,
    validateConnection,
    addEdge,
    deleteNode
  }
})
