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
  const nodeTypeConfig = useNodeTypeConfig()

  const nodeStyle = computed(() => ({
    width: palette ? '100%' : `${NODE_WIDTH}px`,
    height: palette
      ? `${NODE_HEIGHT / 2}px`
      : `${NODE_HEIGHT}px`,
    ...(selected && {
      borderColor: 'var(--color-selection-border)'
    })
  }))

  const themeColor = computed(() =>
    useNodeTheme(data?.nodeType)
  )

  const handles = computed(() =>
    data?.nodeType
      ? nodeTypeConfig[data.nodeType]?.handles
      : undefined
  )

  const isBranching = computed(
    () => !!handles.value?.length
  )

  const HANDLE_POSITION_MAP: Record<string, Position> = {
    right: Position.Right,
    bottom: Position.Bottom
  }
</script>

<template>
  <div
    :style="nodeStyle"
    :class="{ 'node-selected': selected }"
    class="border-muted bg-elevated flex cursor-move
      flex-col rounded-lg border shadow-lg transition-shadow
      hover:shadow-xl"
  >
    <Handle
      v-if="!palette && data?.nodeType !== 'sales-page'"
      class="border-none!"
      type="target"
      :position="Position.Left"
    />

    <!-- Single source handle for non-branching nodes -->
    <Handle
      v-if="
        !palette &&
        !isBranching &&
        data?.nodeType !== 'thank-you'
      "
      class="border-none!"
      type="source"
      :position="Position.Right"
    />

    <!-- Branching source handles -->
    <Handle
      v-for="handle in !palette && isBranching
        ? handles
        : []"
      :key="handle.id"
      :id="handle.id"
      type="source"
      :position="HANDLE_POSITION_MAP[handle.position]"
      :class="[
        'custom-handle',
        handle.color === 'success'
          ? 'custom-handle--success'
          : 'custom-handle--error'
      ]"
    >
      <UIcon
        :name="handle.icon"
        class="pointer-events-none size-3 font-extrabold"
      />
    </Handle>

    <div
      :class="{ 'border-muted border-b': !palette }"
      class="flex flex-1 items-center gap-2 px-3 py-1"
    >
      <UIcon
        :name="data?.icon"
        :class="themeColor.icon"
        class="size-4"
      />

      <span class="text-highlighted text-sm font-semibold">
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
        variant="outline"
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
      background: var(--color-selection-overlay);
      border-radius: inherit;
      pointer-events: none;
    }
  }

  :deep(.custom-handle) {
    width: 14px !important;
    height: 14px !important;
    border-radius: 50% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    border: none !important;
  }

  :deep(.custom-handle--success) {
    background-color: var(--ui-success) !important;
    color: white !important;
  }

  :deep(.custom-handle--error) {
    background-color: var(--ui-error) !important;
    color: white !important;
  }
</style>
