<script setup lang="ts">
  import type { FitViewParams } from '@vue-flow/core'
  import { useVueFlow } from '@vue-flow/core'
  import { Controls as VFControls } from '@vue-flow/controls'

  const FIT_VIEW_PARAMS: FitViewParams = {
    duration: 300,
    padding: '100px'
  }

  const { zoomIn, zoomOut, fitView } = useVueFlow()
</script>

<template>
  <VFControls
    position="top-right"
    :show-interactive="false"
    :fit-view-params="FIT_VIEW_PARAMS"
    class="border-muted overflow-hidden rounded-full
      border-2"
  >
    <template #control-zoom-in>
      <button
        type="button"
        class="vue-flow__controls-button
          vue-flow__controls-zoomin"
        aria-label="Zoom in"
        @click="zoomIn()"
      >
        <UIcon
          name="i-lucide-zoom-in"
          class="text-default"
        />
      </button>
    </template>

    <template #control-zoom-out>
      <button
        type="button"
        class="vue-flow__controls-button
          vue-flow__controls-zoomout"
        aria-label="Zoom out"
        @click="zoomOut()"
      >
        <UIcon
          name="i-lucide-zoom-out"
          class="text-default"
        />
      </button>
    </template>

    <template #control-fit-view>
      <button
        type="button"
        class="vue-flow__controls-button
          vue-flow__controls-fitview"
        aria-label="Fit view"
        @click="fitView(FIT_VIEW_PARAMS)"
      >
        <UIcon
          name="i-lucide-minimize"
          class="text-default"
        />
      </button>
    </template>
  </VFControls>
</template>

<style scoped lang="scss">
  :deep(.vue-flow__controls-button) {
    background-color: var(--ui-bg-elevated) !important;
    border-color: var(--ui-border-muted) !important;
    border-width: 2px !important;

    &:last-child {
      border-bottom: none !important;
    }

    &:hover {
      background-color: var(--ui-bg-accented) !important;
    }
  }
</style>
