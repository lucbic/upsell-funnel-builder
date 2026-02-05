<script setup lang="ts">
  import { Handle, Position } from '@vue-flow/core'
  import type { NodeProps } from '@vue-flow/core'

  const props = defineProps<
    NodeProps<Funnel.NodeData> & {
      accentColor?: string
    }
  >()

  const { NODE_WIDTH, NODE_HEIGHT } = useNodeSizes()

  const nodeStyle = computed(() => ({
    width: `${NODE_WIDTH}px`,
    height: `${NODE_HEIGHT}px`,
    ...(props.selected && {
      borderColor: 'rgba(0, 89, 220, 0.8)'
    })
  }))
</script>

<template>
  <div
    :style="nodeStyle"
    :class="{ 'node-selected': selected }"
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

<style scoped>
  .node-selected {
    position: relative;
  }

  .node-selected::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0, 89, 220, 0.08);
    border-radius: inherit;
    pointer-events: none;
  }
</style>
