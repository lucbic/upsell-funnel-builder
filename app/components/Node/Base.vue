<script setup lang="ts">
  import { Handle, Position } from '@vue-flow/core'
  import type { NodeProps } from '@vue-flow/core'

  const props = defineProps<
    NodeProps<Funnel.NodeData> & {
      accentColor?: string
    }
  >()
</script>

<template>
  <div
    class="h-20 w-48 rounded-lg border border-gray-700
      bg-gray-900 shadow-lg transition-shadow
      hover:shadow-xl"
  >
    <Handle type="target" :position="Position.Left" />

    <div
      class="flex items-center gap-2 border-b
        border-gray-700 px-3 py-2"
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

    <div v-if="data.primaryButtonLabel" class="px-3 py-2">
      <span class="text-xs text-gray-400">
        {{ data.primaryButtonLabel }}
      </span>
    </div>

    <Handle
      v-if="data.nodeType !== 'thank-you'"
      type="source"
      :position="Position.Right"
    />
  </div>
</template>
