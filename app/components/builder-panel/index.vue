<script setup lang="ts">
  import {
    VueFlow,
    useVueFlow,
    MarkerType
  } from '@vue-flow/core'
  import type {
    Connection as VFConnection,
    NodeChange,
    EdgeChange,
    Node as VFNode,
    FitViewParams
  } from '@vue-flow/core'

  import '@vue-flow/controls/dist/style.css'
  import '@vue-flow/core/dist/style.css'
  import '@vue-flow/core/dist/theme-default.css'
  import '@vue-flow/minimap/dist/style.css'

  import { Background as VFBackground } from '@vue-flow/background'

  const {
    NODE_WIDTH,
    NODE_HEIGHT,
    DURATION,
    GRID_SPACING
  } = getConstants()

  const fitViewParams: FitViewParams = {
    duration: DURATION.FIT_VIEW,
    padding: '100px'
  }

  const {
    screenToFlowCoordinate,
    onConnect,
    applyNodeChanges,
    applyEdgeChanges,
    addSelectedNodes,
    removeSelectedNodes,
    getNodes,
    fitView,
    onInit
  } = useVueFlow()

  const store = useFunnelCanvasStore()
  const toast = useToast()
  const mobileDrag = useMobileDrag()

  const dropNodeAt = (
    type: Funnel.NodeType,
    screenX: number,
    screenY: number
  ) => {
    const { x, y } = screenToFlowCoordinate({
      x: screenX,
      y: screenY
    })

    store.createNode(type, {
      x: x - NODE_WIDTH / 2,
      y: y - NODE_HEIGHT / 2
    })
  }

  watch(
    () => mobileDrag.pendingDrop.value,
    drop => {
      if (!drop) return
      const consumed = mobileDrag.consumeDrop()
      if (!consumed) return
      dropNodeAt(consumed.nodeType, consumed.x, consumed.y)
    }
  )

  onConnect((connection: VFConnection) => {
    const validation = store.validateConnection(connection)

    if (!validation.valid) {
      toast.add({
        title: 'Invalid connection',
        description: validation.error,
        icon: 'i-lucide-alert-triangle',
        color: 'error',
        duration: 3000
      })
      return
    }

    store.addEdge(connection)
  })

  const onNodesChange = (changes: NodeChange[]) => {
    const removeChanges = changes.filter(
      c => c.type === 'remove'
    )
    const otherChanges = changes.filter(
      c => c.type !== 'remove'
    )

    if (otherChanges.length > 0) {
      applyNodeChanges(otherChanges)
    }

    for (const change of removeChanges) {
      const removeChange = change
      if (removeChange.id) {
        store.deleteNode(removeChange.id)
      }
    }
  }

  const onNodesDelete = (nodes: VFNode[]) => {
    nodes.forEach(node => {
      store.deleteNode(node.id)
    })
  }

  const onEdgesChange = (changes: EdgeChange[]) => {
    applyEdgeChanges(changes)
  }

  const onDragOver = (event: DragEvent) => {
    event.preventDefault()

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move'
    }
  }

  const onDrop = (event: DragEvent) => {
    const nodeType = event.dataTransfer?.getData(
      'application/vueflow'
    ) as Funnel.NodeType

    if (!nodeType) return

    dropNodeAt(nodeType, event.clientX, event.clientY)
  }

  watch(
    () => store.currentFunnelId,
    () => {
      // NextTick didn't do the trick here, so we're using a timeout to schedule a macrotask in the event loop ¯\_(ツ)_/¯
      useTimeoutFn(() => {
        fitView(fitViewParams)

        useTimeoutFn(() => {
          store.isLoading = false
        }, DURATION.LOADING_DELAY)
      }, 0)
    }
  )

  onInit(async () => {
    if (store.nodes.length === 0) return

    await nextTick()

    fitView(fitViewParams)
  })

  const onNodeFocusIn = (event: FocusEvent) => {
    const target = event.target

    if (!(target instanceof HTMLElement)) return

    const nodeEl = target.closest('.vue-flow__node')
    if (!nodeEl) return

    const nodeId = nodeEl.getAttribute('data-id')
    if (!nodeId) return

    const node = getNodes.value.find(n => n.id === nodeId)
    if (!node) return

    removeSelectedNodes(getNodes.value)
    addSelectedNodes([node])
  }

  const funnelNameInputRef = useTemplateRef<ComponentPublicInstance>('funnelNameInput')

  const blurFunnelNameInput = () => {
    const input = funnelNameInputRef.value?.$el?.querySelector('input')
    input?.blur()
  }
</script>

<template>
  <div
    role="application"
    aria-label="Funnel builder canvas"
    :aria-busy="store.isLoading"
    aria-roledescription="flow chart editor"
    class="relative h-full w-full transition-opacity
      duration-300"
    :class="
      store.isLoading && 'pointer-events-none opacity-10'
    "
    @focusin="onNodeFocusIn"
  >
    <UInput
      v-model="store.funnelName"
      ref="funnelNameInput"
      aria-label="Funnel name"
      size="lg"
      trailing-icon="i-lucide-pencil"
      variant="subtle"
      placeholder="Enter funnel name..."
      class="absolute top-[15px] left-1/2 z-50
        w-[calc(100%-8rem)] max-w-96 -translate-x-1/2
        shadow-lg"
      @keydown.esc="blurFunnelNameInput"
      @keydown.enter="blurFunnelNameInput"
      @focus="
        store.funnelName === 'Untitled Funnel' &&
        (store.funnelName = '')
      "
    />

    <VueFlow
      class="h-full w-full"
      v-model:nodes="store.nodes"
      v-model:edges="store.edges"
      :default-edge-options="{
        type: 'smoothstep',
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: GRID_SPACING,
          height: GRID_SPACING
        }
      }"
      :apply-default="false"
      :snap-grid="[GRID_SPACING, GRID_SPACING]"
      :min-zoom="0.75"
      :max-zoom="1.5"
      :fit-view-params="fitViewParams"
      elevate-edges-on-select
      nodes-focusable
      edges-focusable
      pan-on-scroll
      zoom-on-scroll
      snap-to-grid
      @dragover="onDragOver"
      @drop="onDrop"
      @nodes-change="onNodesChange"
      @nodes-delete="onNodesDelete"
      @edges-change="onEdgesChange"
    >
      <template #node-sales-page="props">
        <BuilderPanelNode v-bind="props" />
      </template>

      <template #node-order-page="props">
        <BuilderPanelNode v-bind="props" />
      </template>

      <template #node-upsell="props">
        <BuilderPanelNode v-bind="props" />
      </template>

      <template #node-downsell="props">
        <BuilderPanelNode v-bind="props" />
      </template>

      <template #node-thank-you="props">
        <BuilderPanelNode v-bind="props" />
      </template>

      <VFBackground
        pattern-color="var(--ui-border)"
        :gap="GRID_SPACING"
        variant="lines"
        class="pointer-events-none"
      />

      <BuilderPanelFlowControls
        :fit-view-params="fitViewParams"
      />

      <BuilderPanelValidationPane />
    </VueFlow>
  </div>
</template>

<style scoped lang="scss">
  :deep(.vue-flow__edge.selected .vue-flow__edge-path) {
    stroke: var(--color-selection-border);
    z-index: 50;
  }

  :deep(.vue-flow__node:focus-visible) {
    outline: none;
    box-shadow: 0 0 0 2px var(--ui-primary);
    border-radius: 0.5rem;
  }
</style>
