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
    <h3 class="mb-2 text-sm font-semibold uppercase">
      Funnel Steps
    </h3>

    <div
      v-for="[type, config] in nodeTypes"
      :key="type"
      draggable="true"
      class="flex cursor-grab items-center gap-3 rounded-lg
        border border-gray-700 bg-gray-900 px-3 py-2.5
        transition-all hover:border-gray-500
        hover:bg-gray-800 active:cursor-grabbing"
      @dragstart="onDragStart($event, type)"
    >
      <UIcon
        :name="config.icon"
        :class="getNodeIconClass(type)"
        class="size-4"
      />

      <span class="text-sm text-white">{{
        config.label
      }}</span>
    </div>
  </div>
</template>
