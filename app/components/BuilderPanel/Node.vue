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

  const config = computed(() =>
    data?.nodeType
      ? nodeTypeConfig[data.nodeType]
      : undefined
  )

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

  const nodeAriaLabel = computed(() => {
    if (!data?.title || !config.value) return undefined
    return `${data.title} - ${config.value.label} node`
  })

  const HANDLE_POSITION_MAP: Record<string, Position> = {
    right: Position.Right,
    bottom: Position.Bottom
  }
</script>

<template>
  <div
    role="button"
    :aria-label="nodeAriaLabel"
    :style="nodeStyle"
    :class="{ 'node-selected': selected }"
    class="border-muted bg-elevated
      focus-visible:ring-primary flex cursor-move flex-col
      rounded-lg border shadow-lg transition-shadow
      hover:shadow-xl focus-visible:ring-2
      focus-visible:outline-none"
  >
    <Handle
      v-if="!palette && data?.nodeType !== 'sales-page'"
      class="border-none!"
      type="target"
      :position="Position.Left"
      aria-label="Input connection"
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
      aria-label="Output connection"
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
      :aria-label="`${handle.label} output`"
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
        variant="solid"
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
