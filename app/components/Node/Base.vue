<script setup lang="ts">
  import { Handle, Position } from '@vue-flow/core'
  import type { NodeProps } from '@vue-flow/core'

  const props = defineProps<
    NodeProps<Funnel.NodeData> & {
      accentColor?: string
    }
  >()

  const { NODE_WIDTH, NODE_HEIGHT } = useNodeSizes()

  const nodeStyle = {
    width: `${NODE_WIDTH}px`,
    height: `${NODE_HEIGHT}px`
  }
</script>

<template>
  <div
    :style="nodeStyle"
    class="flex cursor-move flex-col rounded-lg border
      border-gray-600 bg-gray-900 shadow-lg
      transition-shadow hover:shadow-xl"
  >
    <Handle
      class="border-none!"
      type="target"
      :position="Position.Left"
    />

    <Handle
      v-if="data.nodeType !== 'thank-you'"
      class="border-none!"
      type="source"
      :position="Position.Right"
    />

    <div
      class="flex flex-1 items-center gap-2 border-b
        border-gray-700 px-3 py-1"
    >
      <UIcon
        :name="data.icon"
        :class="accentColor ?? 'text-white'"
        class="size-4"
      />

      <span class="text-sm font-semibold text-white">
        {{ data.title }}
      </span>
    </div>

    <div
      v-if="data.primaryButtonLabel"
      class="flex-1 items-center px-3 py-1"
    >
      <span class="text-xs text-gray-400">
        {{ data.primaryButtonLabel }}
      </span>
    </div>
  </div>
</template>
