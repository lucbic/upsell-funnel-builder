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
  import { MiniMap as VFMinimap } from '@vue-flow/minimap'

  const { NODE_WIDTH, NODE_HEIGHT } = useNodeSizes()

  const store = useFunnel()
  const toast = useToast()
  const colorMode = useColorMode()

  const minimapColors = computed(() =>
    colorMode.value === 'dark'
      ? {
          maskColor: 'rgb(31 41 55 / 0.8)',
          nodeColor: 'var(--ui-bg-inverted)',
          nodeStrokeColor: 'rgb(55 65 81)'
        }
      : {
          maskColor: 'rgb(243 244 246 / 0.8)',
          nodeColor: 'var(--ui-bg)',
          nodeStrokeColor: 'rgb(229 231 235)'
        }
  )

  const {
    screenToFlowCoordinate,
    onConnect,
    applyNodeChanges,
    applyEdgeChanges
  } = useVueFlow()

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
</script>

<template>
  <VueFlow
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
    elevate-edges-on-select
    pan-on-scroll
    zoom-on-scroll
    snap-to-grid
    :snap-grid="[25, 25]"
    class="h-full w-full"
    @dragover="onDragOver"
    @drop="onDrop"
    @nodes-change="onNodesChange"
    @nodes-delete="onNodesDelete"
    @edges-change="onEdgesChange"
  >
    <template #node-sales-page="props">
      <FunnelNode v-bind="props" />
    </template>

    <template #node-order-page="props">
      <FunnelNode v-bind="props" />
    </template>

    <template #node-upsell="props">
      <FunnelNode v-bind="props" />
    </template>

    <template #node-downsell="props">
      <FunnelNode v-bind="props" />
    </template>

    <template #node-thank-you="props">
      <FunnelNode v-bind="props" />
    </template>

    <VFBackground
      :pattern-color="
        colorMode.value === 'dark'
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(0, 0, 0, 0.05)'
      "
      :gap="25"
      variant="lines"
      class="pointer-events-none"
    />

    <VFControls
      position="top-right"
      :show-interactive="false"
      :fit-view-params="{ duration: 300, padding: 0 }"
      class="border-muted overflow-hidden rounded-full
        border-2"
    />
  </VueFlow>
</template>

<style scoped>
  :deep(.vue-flow__edge.selected .vue-flow__edge-path) {
    stroke: rgba(0, 89, 220, 0.8);
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
