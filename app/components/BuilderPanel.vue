<script setup lang="ts">
  import '@vue-flow/controls/dist/style.css'
  import '@vue-flow/core/dist/style.css'
  import '@vue-flow/core/dist/theme-default.css'

  import { VueFlow, useVueFlow } from '@vue-flow/core'
  import type { Connection } from '@vue-flow/core'
  import { Background as VFBackground } from '@vue-flow/background'
  import { Controls as VFControls } from '@vue-flow/controls'

  const store = useFunnelBuilderStore()
  const toast = useToast()

  const { screenToFlowCoordinate, onConnect } = useVueFlow()

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

    const position = screenToFlowCoordinate({
      x: event.clientX,
      y: event.clientY
    })

    store.createNode(nodeType, position)
  }
</script>

<template>
  <VueFlow
    :nodes="store.nodes"
    :edges="store.edges"
    :default-edge-options="{
      type: 'smoothstep',
      animated: true
    }"
    :pan-on-scroll="true"
    :zoom-on-scroll="true"
    class="h-full w-full"
    @dragover="onDragOver"
    @drop="onDrop"
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
