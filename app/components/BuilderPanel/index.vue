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
    Node as VFNode
  } from '@vue-flow/core'

  import '@vue-flow/controls/dist/style.css'
  import '@vue-flow/core/dist/style.css'
  import '@vue-flow/core/dist/theme-default.css'
  import '@vue-flow/minimap/dist/style.css'

  import { Background as VFBackground } from '@vue-flow/background'
  import { Controls as VFControls } from '@vue-flow/controls'
  // import { MiniMap as VFMinimap } from '@vue-flow/minimap'

  const { NODE_WIDTH, NODE_HEIGHT } = useNodeSizes()

  const {
    screenToFlowCoordinate,
    onConnect,
    applyNodeChanges,
    applyEdgeChanges,
    fitView
  } = useVueFlow()

  const store = useFunnelStore()
  const toast = useToast()

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
      const removeChange = change as {
        type: 'remove'
        id: string
      }
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

    const flowPosition = screenToFlowCoordinate({
      x: event.clientX,
      y: event.clientY
    })

    const centeredPosition = {
      x: flowPosition.x - NODE_WIDTH / 2,
      y: flowPosition.y - NODE_HEIGHT / 2
    }

    store.createNode(nodeType, centeredPosition)
  }

  watch(
    () => store.currentFunnelId,
    async () => {
      if (!store.isLoading) return

      await new Promise(resolve => setTimeout(resolve, 100))
      fitView({ duration: 300, padding: '100px' })
      await new Promise(resolve => setTimeout(resolve, 350))
      store.isLoading = false
    }
  )

  const colorMode = useColorMode()
</script>

<template>
  <div
    class="relative h-full w-full transition-opacity
      duration-300"
    :class="
      store.isLoading && 'pointer-events-none opacity-10'
    "
  >
    <UInput
      v-model="store.funnelName"
      size="lg"
      trailing-icon="i-lucide-pencil"
      variant="subtle"
      placeholder="Enter funnel name..."
      class="absolute top-[15px] left-1/2 z-50 w-96
        -translate-x-1/2 shadow-lg"
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
          width: 25,
          height: 25
        }
      }"
      :apply-default="false"
      :snap-grid="[25, 25]"
      :min-zoom="0.75"
      :max-zoom="1.5"
      :fit-view-params="{ duration: 300, padding: '100px' }"
      elevate-edges-on-select
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
        :gap="25"
        variant="lines"
        class="pointer-events-none"
      />

      <VFControls
        position="top-right"
        :show-interactive="false"
        :fit-view-params="{
          duration: 300,
          padding: '100px'
        }"
        class="border-muted overflow-hidden rounded-full
          border-2"
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

  :deep(.vue-flow__controls-button) {
    background-color: var(--ui-bg-elevated) !important;
    border-color: var(--ui-border-muted) !important;
    border-width: 2px !important;

    &:last-child {
      border-bottom: none !important;
    }

    & > svg {
      fill: var(--ui-text) !important;
    }

    &:hover {
      background-color: var(--ui-bg-accented) !important;
    }
  }
</style>
