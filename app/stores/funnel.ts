import type { Node, Edge, Connection } from '@vue-flow/core'
import type {
  ValidationResult,
  ValidationContext
} from '~/utils/connectionValidation'

import { MarkerType } from '@vue-flow/core'
import { getConnectionValidator } from '~/utils/connectionValidation'

const STORAGE_KEY_PREFIX = 'funnel_'
const STORAGE_INDEX_KEY = 'funnel_index'
const AUTO_SAVE_DEBOUNCE_MS = 1000

export const useFunnelStore = defineStore('funnel', () => {
  const toast = useToast()
  const nodeTypeConfig = useNodeTypeConfig()

  // STATE
  const nodes = ref<Node<Funnel.NodeData>[]>([])
  const edges = ref<Edge[]>([])
  const funnelName = ref('Untitled Funnel')

  const nodeTypeCounts = ref<Record<string, number>>({
    upsell: 0,
    downsell: 0
  })

  const nodeIdCounter = ref(0)
  const currentFunnelId = ref<string | null>(null)
  const savedFunnels = ref<Funnel.FunnelListItem[]>([])
  const isLoading = ref(false)

  // GETTERS
  const hasContent = computed(
    () =>
      nodes.value.length > 0 ||
      funnelName.value !== 'Untitled Funnel'
  )

  // ACTIONS
  const generateFunnelId = () =>
    `funnel_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

  const serializeFunnel = (): Funnel.SavedFunnel => {
    const now = Date.now()
    const existingFunnel = currentFunnelId.value
      ? getSavedFunnelData(currentFunnelId.value)
      : null

    return {
      id: currentFunnelId.value || generateFunnelId(),
      name: funnelName.value,
      nodes: nodes.value.map(
        (node): Funnel.SerializedNode => ({
          id: node.id,
          type: node.type as Funnel.NodeType,
          position: {
            x: node.position.x,
            y: node.position.y
          },
          data: node.data!
        })
      ),
      edges: edges.value.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle
      })),
      nodeTypeCounts: { ...nodeTypeCounts.value },
      nodeIdCounter: nodeIdCounter.value,
      createdAt: existingFunnel?.createdAt ?? now,
      updatedAt: now
    }
  }

  const getSavedFunnelData = (
    id: string
  ): Funnel.SavedFunnel | null => {
    try {
      const data = localStorage.getItem(
        `${STORAGE_KEY_PREFIX}${id}`
      )
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  }

  const loadSavedFunnelsIndex = () => {
    try {
      const indexData = localStorage.getItem(
        STORAGE_INDEX_KEY
      )
      savedFunnels.value = indexData
        ? JSON.parse(indexData)
        : []
    } catch {
      savedFunnels.value = []
    }
  }

  const saveFunnelsIndex = () => {
    try {
      localStorage.setItem(
        STORAGE_INDEX_KEY,
        JSON.stringify(savedFunnels.value)
      )
    } catch (error) {
      toast.add({
        title: 'Storage Error',
        description: 'Failed to save funnels index',
        color: 'error',
        icon: 'i-lucide-alert-circle'
      })
    }
  }

  const saveFunnel = () => {
    try {
      const funnel = serializeFunnel()

      if (!currentFunnelId.value) {
        currentFunnelId.value = funnel.id
      }

      localStorage.setItem(
        `${STORAGE_KEY_PREFIX}${funnel.id}`,
        JSON.stringify(funnel)
      )

      const listItem: Funnel.FunnelListItem = {
        id: funnel.id,
        name: funnel.name,
        nodeCount: funnel.nodes.length,
        updatedAt: funnel.updatedAt
      }

      const existingIndex = savedFunnels.value.findIndex(
        f => f.id === funnel.id
      )

      if (existingIndex >= 0) {
        savedFunnels.value[existingIndex] = listItem
      } else {
        savedFunnels.value.unshift(listItem)
      }

      saveFunnelsIndex()
    } catch (error) {
      toast.add({
        title: 'Storage Error',
        description:
          'Failed to save funnel. Storage may be full.',
        color: 'error',
        icon: 'i-lucide-alert-circle'
      })
    }
  }

  const loadFunnel = (id: string) => {
    const funnel = getSavedFunnelData(id)

    if (!funnel) {
      toast.add({
        title: 'Load Error',
        description: 'Could not find the requested funnel',
        color: 'error',
        icon: 'i-lucide-alert-circle'
      })
      return
    }

    isLoading.value = true
    currentFunnelId.value = funnel.id
    funnelName.value = funnel.name
    nodeTypeCounts.value = { ...funnel.nodeTypeCounts }
    nodeIdCounter.value = funnel.nodeIdCounter

    nodes.value = funnel.nodes.map(node => ({
      ...node,
      type: node.type
    }))

    edges.value = funnel.edges.map(edge => ({
      ...edge,
      type: 'smoothstep',
      selectable: true,
      deletable: true,
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20
      }
    }))

    toast.add({
      title: 'Funnel Loaded',
      description: `"${funnel.name}" has been loaded`,
      icon: 'i-lucide-folder-open'
    })
  }

  const deleteFunnel = (id: string) => {
    try {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${id}`)

      savedFunnels.value = savedFunnels.value.filter(
        f => f.id !== id
      )
      saveFunnelsIndex()

      if (currentFunnelId.value === id) {
        resetToNewFunnel()
      }

      toast.add({
        title: 'Funnel Deleted',
        icon: 'i-lucide-trash-2'
      })
    } catch {
      toast.add({
        title: 'Delete Error',
        description: 'Failed to delete funnel',
        color: 'error',
        icon: 'i-lucide-alert-circle'
      })
    }
  }

  const resetToNewFunnel = () => {
    currentFunnelId.value = null
    funnelName.value = 'Untitled Funnel'
    nodes.value = []
    edges.value = []
    nodeTypeCounts.value = { upsell: 0, downsell: 0 }
    nodeIdCounter.value = 0
  }

  const createNewFunnel = (
    skipConfirmation = false
  ): boolean => {
    if (!skipConfirmation && hasContent.value) {
      return false
    }

    resetToNewFunnel()

    toast.add({
      title: 'New Funnel Created',
      icon: 'i-lucide-file-plus'
    })

    return true
  }

  const exportFunnel = () => {
    const funnel = serializeFunnel()
    const blob = new Blob(
      [JSON.stringify(funnel, null, 2)],
      {
        type: 'application/json'
      }
    )
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${funnel.name.replace(/[^a-z0-9]/gi, '_')}.json`
    link.click()
    URL.revokeObjectURL(url)

    toast.add({
      title: 'Funnel Exported',
      description: `Downloaded "${funnel.name}.json"`,
      icon: 'i-lucide-download'
    })
  }

  const importFunnel = async (file: File) => {
    try {
      const text = await file.text()
      const data = JSON.parse(text) as Funnel.SavedFunnel

      if (!data.nodes || !data.edges || !data.name) {
        throw new Error('Invalid funnel format')
      }

      const newId = generateFunnelId()
      currentFunnelId.value = newId
      funnelName.value = data.name
      nodeTypeCounts.value = data.nodeTypeCounts || {
        upsell: 0,
        downsell: 0
      }
      nodeIdCounter.value = data.nodeIdCounter || 0

      nodes.value = data.nodes.map(node => ({
        ...node,
        type: node.type
      }))

      edges.value = data.edges.map(edge => ({
        ...edge,
        type: 'smoothstep',
        selectable: true,
        deletable: true,
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20
        }
      }))

      saveFunnel()

      toast.add({
        title: 'Funnel Imported',
        description: `"${data.name}" has been imported`,
        icon: 'i-lucide-upload'
      })
    } catch {
      toast.add({
        title: 'Import Error',
        description: 'Invalid funnel file format',
        color: 'error',
        icon: 'i-lucide-alert-circle'
      })
    }
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

    const newNode: Node<Funnel.NodeData> = {
      id: `node-${nodeIdCounter.value}`,
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
  }

  const connectionValidator = getConnectionValidator()

  const validateConnection = (
    connection: Connection
  ): ValidationResult => {
    const context: ValidationContext = {
      connection,
      nodes: nodes.value,
      edges: edges.value
    }

    return connectionValidator(context)
  }

  const addEdge = (connection: Connection) => {
    const newEdge: Edge = {
      id: `e-${connection.source}-${connection.target}`,
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      type: 'smoothstep',
      selectable: true,
      deletable: true,
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20
      }
    }

    edges.value.push(newEdge)
  }

  const deleteNode = (nodeId: string) => {
    const node = nodes.value.find(n => n.id === nodeId)
    if (!node) return

    const nodeType = node.type as Funnel.NodeType
    if (nodeTypeConfig[nodeType]?.autoIncrement) {
      nodeTypeCounts.value[nodeType] =
        (nodeTypeCounts.value[nodeType] ?? 1) - 1
    }

    edges.value = edges.value.filter(
      e => e.source !== nodeId && e.target !== nodeId
    )

    nodes.value = nodes.value.filter(n => n.id !== nodeId)
  }

  // Auto-save watcher
  const debouncedSave = useDebounceFn(() => {
    if (hasContent.value) {
      saveFunnel()
    }
  }, AUTO_SAVE_DEBOUNCE_MS)

  watch([nodes, edges, funnelName], () => debouncedSave(), {
    deep: true
  })

  // Initialize on client
  if (import.meta.client) {
    loadSavedFunnelsIndex()
  }

  return {
    nodes,
    edges,
    funnelName,
    nodeTypeCounts,
    currentFunnelId,
    savedFunnels,
    isLoading,
    hasContent,
    createNode,
    validateConnection,
    addEdge,
    deleteNode,
    saveFunnel,
    loadFunnel,
    deleteFunnel,
    createNewFunnel,
    resetToNewFunnel,
    exportFunnel,
    importFunnel,
    loadSavedFunnelsIndex
  }
})
