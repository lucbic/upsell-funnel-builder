<script setup lang="ts">
  import { Handle, Position } from '@vue-flow/core'
  import type { NodeProps } from '@vue-flow/core'

  type Props = {
    palette?: boolean
  } & Partial<NodeProps<Funnel.NodeData>>

  const {
    palette = false,
    selected,
    data
  } = defineProps<Props>()

  const { NODE_WIDTH, NODE_HEIGHT } = useNodeSizes()

  const nodeStyle = computed(() => ({
    width: palette ? '100%' : `${NODE_WIDTH}px`,
    height: palette
      ? `${NODE_HEIGHT / 2}px`
      : `${NODE_HEIGHT}px`,
    ...(selected && {
      borderColor: 'rgba(0, 89, 220, 0.8)'
    })
  }))

  const themeColor = computed(() =>
    useNodeTheme(data?.nodeType)
  )
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
      v-if="!palette"
      class="border-none!"
      type="target"
      :position="Position.Left"
    />

    <Handle
      v-if="!palette && data?.nodeType !== 'thank-you'"
      class="border-none!"
      type="source"
      :position="Position.Right"
    />

    <div
      :class="{ 'border-b border-gray-700': !palette }"
      class="flex flex-1 items-center gap-2 px-3 py-1"
    >
      <UIcon
        :name="data?.icon"
        :class="themeColor.icon"
        class="size-4"
      />

      <span class="text-sm font-semibold text-white">
        {{ data?.title }}
      </span>
    </div>

    <div
      v-if="!palette && data?.primaryButtonLabel"
      class="flex flex-1 items-center px-3 py-1"
    >
      <UBadge
        :label="data.primaryButtonLabel"
        :color="themeColor.badge"
        variant="subtle"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
  .node-selected {
    position: relative;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(0, 89, 220, 0.08);
      border-radius: inherit;
      pointer-events: none;
    }
  }
</style>
