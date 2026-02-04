<script setup lang="ts">
import { NODE_TYPE_CONFIG } from '~/utils/funnelConfig'

const nodeTypes = Object.entries(NODE_TYPE_CONFIG) as [Funnel.NodeType, Funnel.NodeTypeConfig][]

const accentColors: Record<Funnel.NodeType, string> = {
  'sales-page': 'text-blue-400',
  'order-page': 'text-amber-400',
  'upsell': 'text-green-400',
  'downsell': 'text-orange-400',
  'thank-you': 'text-emerald-400'
}

const onDragStart = (event: DragEvent, nodeType: Funnel.NodeType) => {
  if (!event.dataTransfer) return
  event.dataTransfer.setData('application/vueflow', nodeType)
  event.dataTransfer.effectAllowed = 'move'
}
</script>

<template>
  <div class="flex flex-col gap-2 p-4">
    <h3 class="mb-2 text-sm font-semibold text-gray-400 uppercase">
      Funnel Steps
    </h3>

    <div
      v-for="[type, config] in nodeTypes"
      :key="type"
      draggable="true"
      class="flex cursor-grab items-center gap-3 rounded-lg border
        border-gray-700 bg-gray-900 px-3 py-2.5 transition-all
        hover:border-gray-500 hover:bg-gray-800 active:cursor-grabbing"
      @dragstart="onDragStart($event, type)"
    >
      <UIcon
        :name="config.icon"
        :class="accentColors[type]"
        class="size-4"
      />

      <span class="text-sm text-white">{{ config.label }}</span>
    </div>
  </div>
</template>
