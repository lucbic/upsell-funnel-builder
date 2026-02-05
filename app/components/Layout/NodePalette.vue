<script setup lang="ts">
  const nodeTypes = Object.entries(useNodeTypeConfig()) as [
    Funnel.NodeType,
    Funnel.NodeTypeConfig
  ][]

  const onDragStart = (
    event: DragEvent,
    nodeType: Funnel.NodeType
  ) => {
    if (!event.dataTransfer) return
    event.dataTransfer.setData(
      'application/vueflow',
      nodeType
    )
    event.dataTransfer.effectAllowed = 'move'
  }
</script>

<template>
  <div class="flex flex-col gap-2 p-4">
    <h3 class="mb-2 text-xs font-semibold uppercase">
      Funnel Steps
    </h3>

    <div
      v-for="[type, config] in nodeTypes"
      :key="type"
      draggable="true"
      class="cursor-grab transition-all
        active:cursor-grabbing"
      @dragstart="onDragStart($event, type)"
    >
      <FunnelNode
        palette
        :data="{
          nodeType: type,
          icon: config.icon,
          title: config.label
        }"
      />
    </div>
  </div>
</template>
