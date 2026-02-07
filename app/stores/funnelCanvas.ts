import type {
  Node as VFNode,
  Edge as VFEdge,
  Connection as VFConnection
} from '@vue-flow/core'
import { getConnectionValidator } from '~/utils/connectionValidation'

export const useFunnelCanvasStore = defineStore(
  'funnel',
  () => {
    const nodeTypeConfig = getNodeTypeConfig()
    const {
      NODE_WIDTH,
      KEYBOARD_INSERT_NODE_GAP,
      EDGE_DEFAULTS
    } = getConstants()

    // STATE
    const nodes = ref<VFNode<Funnel.NodeData>[]>([])
    const edges = ref<VFEdge[]>([])
    const funnelName = ref('Untitled Funnel')

    const nodeTypeCounts = ref<Record<string, number>>({
      upsell: 0,
      downsell: 0
    })

    const nodeIdCounter = ref(0)
    const currentFunnelId = ref<string | null>(null)
    const isLoading = ref(false)

    // GETTERS
    const hasContent = computed(
      () =>
        nodes.value.length > 0 ||
        funnelName.value !== 'Untitled Funnel'
    )

    // ACTIONS
    const loadState = (funnel: {
      id: string
      name: string
      nodes: VFNode<Funnel.NodeData>[]
      edges: VFEdge[]
      nodeTypeCounts: Record<string, number>
      nodeIdCounter: number
    }) => {
      currentFunnelId.value = funnel.id
      funnelName.value = funnel.name
      nodes.value = funnel.nodes
      edges.value = funnel.edges
      nodeTypeCounts.value = { ...funnel.nodeTypeCounts }
      nodeIdCounter.value = funnel.nodeIdCounter
    }

    const createNode = (
      type: Funnel.NodeType,
      position: { x: number; y: number }
    ) => {
      const config = nodeTypeConfig[type]

      if (!config) return

      nodeIdCounter.value++

      let title = config.defaultTitle
      let sequenceNumber: number | undefined

      if (config.autoIncrement) {
        const count = (nodeTypeCounts.value[type] ?? 0) + 1
        nodeTypeCounts.value[type] = count
        sequenceNumber = count
        title = `${config.defaultTitle} ${sequenceNumber}`
      }

      const newNode: VFNode<Funnel.NodeData> = {
        id: `node-${nodeIdCounter.value}`,
        type,
        position,
        ariaLabel: `${title} - ${config.label}`,
        data: {
          title,
          icon: config.icon,
          primaryButtonLabel: config.defaultButtonLabel,
          nodeType: type,
          sequenceNumber
        }
      }

      nodes.value.push(newNode)
    }

    const addNodeToCanvas = (type: Funnel.NodeType) => {
      const lastNode = nodes.value.at(-1)

      const position = lastNode
        ? {
            x:
              lastNode.position.x +
              NODE_WIDTH +
              KEYBOARD_INSERT_NODE_GAP,
            y: lastNode.position.y
          }
        : { x: 0, y: 0 }

      createNode(type, position)
    }

    const connectionValidator = getConnectionValidator()

    const validateConnection = (
      connection: VFConnection
    ): Validation.ConnectionResult => {
      const context: Validation.ConnectionContext = {
        connection,
        nodes: nodes.value,
        edges: edges.value
      }

      return connectionValidator(context)
    }

    const addEdge = (connection: VFConnection) => {
      const newEdge: VFEdge = {
        id: `e-${connection.source}${connection.sourceHandle ? `-${connection.sourceHandle}` : ''}-${connection.target}`,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        ...EDGE_DEFAULTS
      }

      edges.value.push(newEdge)
    }

    const deleteNode = (nodeId: string) => {
      const node = nodes.value.find(n => n.id === nodeId)
      if (!node) return

      const nodeType = node.data?.nodeType!
      if (nodeTypeConfig[nodeType]?.autoIncrement) {
        nodeTypeCounts.value[nodeType] =
          (nodeTypeCounts.value[nodeType] ?? 1) - 1
      }

      edges.value = edges.value.filter(
        e => e.source !== nodeId && e.target !== nodeId
      )

      nodes.value = nodes.value.filter(n => n.id !== nodeId)
    }

    const resetToNewFunnel = () => {
      currentFunnelId.value = null
      funnelName.value = 'Untitled Funnel'
      nodes.value = []
      edges.value = []
      nodeTypeCounts.value = { upsell: 0, downsell: 0 }
      nodeIdCounter.value = 0
    }

    return {
      nodes,
      edges,
      funnelName,
      nodeTypeCounts,
      nodeIdCounter,
      currentFunnelId,
      isLoading,
      hasContent,
      createNode,
      addNodeToCanvas,
      validateConnection,
      addEdge,
      deleteNode,
      resetToNewFunnel,
      loadState
    }
  }
)
