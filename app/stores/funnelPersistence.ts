import type {
  Node as VFNode,
  Edge as VFEdge
} from '@vue-flow/core'
import { useStorage } from '@vueuse/core'

export const useFunnelPersistenceStore = defineStore(
  'funnelPersistence',
  () => {
    const funnel = useFunnelCanvasStore()
    const toast = useToast()
    const { handleError } = useErrorHandler()
    const nodeTypeConfig = getNodeTypeConfig()
    const {
      STORAGE_KEY_PREFIX,
      STORAGE_INDEX_KEY,
      EDGE_DEFAULTS,
      AUTO_SAVE_DEBOUNCE_MS
    } = getConstants()

    // STATE
    const savedFunnels = useStorage<
      Funnel.FunnelListItem[]
    >(STORAGE_INDEX_KEY, [])

    // --- Internal: Deserialization (absorbed from funnelSerialization.ts) ---
    const deserializeNodes = (
      serializedNodes: Funnel.SerializedNode[],
      config: Record<string, Funnel.NodeTypeConfig>
    ): VFNode<Funnel.NodeData>[] =>
      serializedNodes.map(node => ({
        ...node,
        type: node.data?.nodeType!,
        ariaLabel: `${node.data.title} - ${config[node.data?.nodeType!]?.label ?? node.data?.nodeType!}`
      }))

    const deserializeEdges = (
      serializedEdges: Funnel.SerializedEdge[]
    ): VFEdge[] =>
      serializedEdges.map(edge => ({
        ...edge,
        ...EDGE_DEFAULTS
      }))

    // --- Internal: Storage helpers ---
    const generateFunnelId = () =>
      `funnel_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

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

    const serializeFunnel = (): Funnel.SavedFunnel => {
      const now = Date.now()
      const existingFunnel = funnel.currentFunnelId
        ? getSavedFunnelData(funnel.currentFunnelId)
        : null

      return {
        id: funnel.currentFunnelId || generateFunnelId(),
        name: funnel.funnelName,
        nodes: funnel.nodes.map(
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
        edges: funnel.edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle
        })),
        nodeTypeCounts: { ...funnel.nodeTypeCounts },
        nodeIdCounter: funnel.nodeIdCounter,
        createdAt: existingFunnel?.createdAt ?? now,
        updatedAt: now
      }
    }

    // --- Public actions ---
    const saveFunnel = () => {
      try {
        const data = serializeFunnel()

        if (!funnel.currentFunnelId) {
          funnel.currentFunnelId = data.id
        }

        localStorage.setItem(
          `${STORAGE_KEY_PREFIX}${data.id}`,
          JSON.stringify(data)
        )

        const listItem: Funnel.FunnelListItem = {
          id: data.id,
          name: data.name,
          nodeCount: data.nodes.length,
          updatedAt: data.updatedAt
        }

        updateSavedFunnelsIndex(current => {
          const existingIndex = current.findIndex(
            f => f.id === data.id
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
      const data = getSavedFunnelData(id)

      if (!data) {
        handleError(
          'Load Error',
          'Could not find the requested funnel',
          undefined,
          { toast: !silent }
        )
        return
      }

      if (!silent) funnel.isLoading = true

      funnel.loadState({
        id: data.id,
        name: data.name,
        nodes: deserializeNodes(data.nodes, nodeTypeConfig),
        edges: deserializeEdges(data.edges),
        nodeTypeCounts: { ...data.nodeTypeCounts },
        nodeIdCounter: data.nodeIdCounter
      })

      if (!silent) {
        toast.add({
          title: 'Funnel Loaded',
          description: `"${data.name}" has been loaded`,
          icon: 'i-lucide-folder-open'
        })
      }
    }

    const deleteFunnel = (id: string) => {
      try {
        localStorage.removeItem(
          `${STORAGE_KEY_PREFIX}${id}`
        )

        updateSavedFunnelsIndex(current =>
          current.filter(f => f.id !== id)
        )

        if (funnel.currentFunnelId === id) {
          funnel.resetToNewFunnel()
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

    const createNewFunnel = (
      skipConfirmation = false
    ): boolean => {
      if (!skipConfirmation && funnel.hasContent) {
        return false
      }

      funnel.resetToNewFunnel()

      toast.add({
        title: 'New Funnel Created',
        icon: 'i-lucide-file-plus'
      })

      return true
    }

    const exportFunnel = () => {
      const data = serializeFunnel()
      const blob = new Blob(
        [JSON.stringify(data, null, 2)],
        {
          type: 'application/json'
        }
      )
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${data.name.replace(/[^a-z0-9]/gi, '_')}.json`
      link.click()
      URL.revokeObjectURL(url)

      toast.add({
        title: 'Funnel Exported',
        description: `Downloaded "${data.name}.json"`,
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

        funnel.loadState({
          id: newId,
          name: data.name,
          nodes: deserializeNodes(
            data.nodes,
            nodeTypeConfig
          ),
          edges: deserializeEdges(data.edges),
          nodeTypeCounts: data.nodeTypeCounts || {
            upsell: 0,
            downsell: 0
          },
          nodeIdCounter: data.nodeIdCounter || 0
        })

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

    // Auto-save watcher
    watchDebounced(
      [
        () => funnel.nodes,
        () => funnel.edges,
        () => funnel.funnelName
      ],
      () => {
        if (funnel.hasContent) saveFunnel()
      },
      {
        deep: true,
        debounce: AUTO_SAVE_DEBOUNCE_MS
      }
    )

    // Load most recent funnel on init
    if (
      import.meta.client &&
      savedFunnels.value.length > 0
    ) {
      const mostRecent = savedFunnels.value.reduce(
        (latest, current) =>
          current.updatedAt > latest.updatedAt
            ? current
            : latest
      )
      loadFunnel(mostRecent.id, { silent: true })
    }

    return {
      savedFunnels,
      saveFunnel,
      loadFunnel,
      deleteFunnel,
      createNewFunnel,
      exportFunnel,
      importFunnel
    }
  }
)
