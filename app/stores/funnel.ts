import type {
  Node as VFNode,
  Edge as VFEdge,
  Connection as VFConnection
} from '@vue-flow/core'
import type {
  ValidationResult,
  ValidationContext
} from '~/utils/connectionValidation'

import { useStorage } from '@vueuse/core'
import { getConnectionValidator } from '~/utils/connectionValidation'
import {
  deserializeNodes,
  deserializeEdges
} from '~/utils/funnelSerialization'

const STORAGE_KEY_PREFIX = 'funnel_'
const STORAGE_INDEX_KEY = 'funnel_index'
const AUTO_SAVE_DEBOUNCE_MS = 1000

export const useFunnelStore = defineStore('funnel', () => {
  const toast = useToast()
  const { handleError } = useErrorHandler()
  const nodeTypeConfig = getNodeTypeConfig()

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
  const savedFunnels = useStorage<Funnel.FunnelListItem[]>(
    STORAGE_INDEX_KEY,
    []
  )
  const isLoading = ref(false)

  const updateSavedFunnelsIndex = (
    updater: (
      current: Funnel.FunnelListItem[]
    ) => Funnel.FunnelListItem[]
  ) => {
    try {
      const updated = updater([...savedFunnels.value])
      localStorage.setItem(
        STORAGE_INDEX_KEY,
        JSON.stringify(updated)
      )
      savedFunnels.value = updated
    } catch (error) {
      handleError(
        'Storage Error',
        'Failed to update funnel index. Storage may be full.',
        error,
        { rethrow: true }
      )
    }
  }

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
          type: node.data?.nodeType!,
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
    } catch (error) {
      handleError(
        'Storage Error',
        'Failed to read funnel data from storage',
        error,
        { toast: false }
      )
      return null
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

      updateSavedFunnelsIndex(current => {
        const existingIndex = current.findIndex(
          f => f.id === funnel.id
        )

        if (existingIndex >= 0) {
          current[existingIndex] = listItem
        } else {
          current.unshift(listItem)
        }

        return current
      })
    } catch (error) {
      handleError(
        'Storage Error',
        'Failed to save funnel. Storage may be full.',
        error
      )
    }
  }

  const loadFunnel = (
    id: string,
    { silent = false } = {}
  ) => {
    const funnel = getSavedFunnelData(id)

    if (!funnel) {
      handleError(
        'Load Error',
        'Could not find the requested funnel',
        undefined,
        { toast: !silent }
      )
      return
    }

    if (!silent) isLoading.value = true

    currentFunnelId.value = funnel.id
    funnelName.value = funnel.name
    nodeTypeCounts.value = { ...funnel.nodeTypeCounts }
    nodeIdCounter.value = funnel.nodeIdCounter

    nodes.value = deserializeNodes(funnel.nodes, nodeTypeConfig)
    edges.value = deserializeEdges(funnel.edges)

    if (!silent) {
      toast.add({
        title: 'Funnel Loaded',
        description: `"${funnel.name}" has been loaded`,
        icon: 'i-lucide-folder-open'
      })
    }
  }

  const deleteFunnel = (id: string) => {
    try {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${id}`)

      updateSavedFunnelsIndex(current =>
        current.filter(f => f.id !== id)
      )

      if (currentFunnelId.value === id) {
        resetToNewFunnel()
      }

      toast.add({
        title: 'Funnel Deleted',
        icon: 'i-lucide-trash-2'
      })
    } catch (error) {
      handleError(
        'Delete Error',
        'Failed to delete funnel',
        error
      )
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

      nodes.value = deserializeNodes(data.nodes, nodeTypeConfig)
      edges.value = deserializeEdges(data.edges)

      saveFunnel()

      toast.add({
        title: 'Funnel Imported',
        description: `"${data.name}" has been imported`,
        icon: 'i-lucide-upload'
      })
    } catch (error) {
      handleError(
        'Import Error',
        'Invalid funnel file format',
        error
      )
    }
  }

  const { NODE_WIDTH, KEYBOARD_INSERT_NODE_GAP, EDGE_DEFAULTS } =
    getConstants()

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
  ): ValidationResult => {
    const context: ValidationContext = {
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

  // Auto-save watcher
  const debouncedSave = useDebounceFn(() => {
    if (hasContent.value) {
      saveFunnel()
    }
  }, AUTO_SAVE_DEBOUNCE_MS)

  watch([nodes, edges, funnelName], () => debouncedSave(), {
    deep: true
  })

  // Load saved funnels
  if (import.meta.client && savedFunnels.value.length > 0) {
    const mostRecent = savedFunnels.value.reduce(
      (latest, current) =>
        current.updatedAt > latest.updatedAt
          ? current
          : latest
    )
    loadFunnel(mostRecent.id, { silent: true })
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
    addNodeToCanvas,
    validateConnection,
    addEdge,
    deleteNode,
    saveFunnel,
    loadFunnel,
    deleteFunnel,
    createNewFunnel,
    resetToNewFunnel,
    exportFunnel,
    importFunnel
  }
})
