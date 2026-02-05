<script setup lang="ts">
  import '@vue-flow/controls/dist/style.css'
  import '@vue-flow/core/dist/style.css'
  import '@vue-flow/core/dist/theme-default.css'

  import { VueFlow, useVueFlow } from '@vue-flow/core'
  import type {
    Connection,
    NodeChange,
    Node
  } from '@vue-flow/core'
  import { Background as VFBackground } from '@vue-flow/background'
  import { Controls as VFControls } from '@vue-flow/controls'
  const { NODE_WIDTH, NODE_HEIGHT } = useNodeSizes()

  const store = useFunnel()
  const toast = useToast()

  const { screenToFlowCoordinate, onConnect, applyNodeChanges } = useVueFlow()

  onConnect((connection: Connection) => {
    if (!store.validateConnection(connection)) {
      toast.add({
        title: 'Invalid connection',
        description:
          'This connection is not allowed by the funnel rules.',
        icon: 'i-lucide-alert-triangle',
        color: 'error',
        duration: 3000
      })
      return
    }

    store.addEdge(connection)
  })

  const onNodesChange = (changes: NodeChange[]) => {
    // Separate remove changes from other changes
    const removeChanges = changes.filter(c => c.type === 'remove')
    const otherChanges = changes.filter(c => c.type !== 'remove')

    // Apply position, dimension, and selection changes
    if (otherChanges.length > 0) {
      applyNodeChanges(otherChanges)
    }

    // Handle remove changes separately to clean up edges and node type counts
    for (const change of removeChanges) {
      const removeChange = change as { type: 'remove'; id: string }
      if (removeChange.id) {
        store.deleteNode(removeChange.id)
      }
    }
  }

  const onNodesDelete = (nodes: Node[]) => {
    nodes.forEach(node => {
      store.deleteNode(node.id)
    })
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
      animated: true
    }"
    :apply-default="false"
    pan-on-scroll
    zoom-on-scroll
    snap-to-grid
    :snap-grid="[25, 25]"
    class="h-full w-full"
    @dragover="onDragOver"
    @drop="onDrop"
    @nodes-change="onNodesChange"
    @nodes-delete="onNodesDelete"
  >
    <template #node-sales-page="props">
      <NodeSalesPage v-bind="props" />
    </template>

    <template #node-order-page="props">
      <NodeOrderPage v-bind="props" />
    </template>

    <template #node-upsell="props">
      <NodeUpsell v-bind="props" />
    </template>

    <template #node-downsell="props">
      <NodeDownsell v-bind="props" />
    </template>

    <template #node-thank-you="props">
      <NodeThankYou v-bind="props" />
    </template>

    <VFBackground
      pattern-color="rgba(255, 255, 255, 0.1)"
      :gap="25"
      variant="lines"
      class="pointer-events-none"
    />

    <VFControls
      class="absolute right-0 bottom-0 left-auto!"
      :show-interactive="false"
      :fit-view-params="{ duration: 300, padding: 0 }"
    />
  </VueFlow>
</template>
