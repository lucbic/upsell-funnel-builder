<script setup lang="ts">
  import { useVueFlow } from '@vue-flow/core'
  import { Controls as VFControls } from '@vue-flow/controls'

  const FIT_VIEW_PARAMS = { duration: 300, padding: '100px' }

  const { zoomIn, zoomOut, fitView } = useVueFlow()
</script>

<template>
  <VFControls
    position="top-right"
    :show-interactive="false"
    :fit-view-params="FIT_VIEW_PARAMS"
    class="border-muted overflow-hidden rounded-full border-2"
  >
    <template #control-zoom-in>
      <button
        type="button"
        class="vue-flow__controls-button vue-flow__controls-zoomin"
        aria-label="Zoom in"
        @click="zoomIn()"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
          <path d="M32 15H17V0h-2v15H0v2h15v15h2V17h15z" />
        </svg>
      </button>
    </template>

    <template #control-zoom-out>
      <button
        type="button"
        class="vue-flow__controls-button vue-flow__controls-zoomout"
        aria-label="Zoom out"
        @click="zoomOut()"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
          <path d="M0 15h32v2H0z" />
        </svg>
      </button>
    </template>

    <template #control-fit-view>
      <button
        type="button"
        class="vue-flow__controls-button vue-flow__controls-fitview"
        aria-label="Fit view"
        @click="fitView(FIT_VIEW_PARAMS)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
          <path d="M3.692 4.63c0-.53.4-.938.939-.938h5.215V0H4.708C2.13 0 0 2.054 0 4.63v5.216h3.692V4.631zM27.354 0h-5.2v3.692h5.17c.53 0 .984.4.984.939v5.215H32V4.631A4.624 4.624 0 0 0 27.354 0zm.954 24.83c0 .532-.4.94-.939.94h-5.215v3.768h5.215c2.577 0 4.631-2.13 4.631-4.707v-5.139h-3.692v5.139zm-23.677.94a.919.919 0 0 1-.939-.94v-5.138H0v5.139c0 2.577 2.13 4.707 4.708 4.707h5.138V25.77H4.631z" />
        </svg>
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

    & > svg {
      fill: var(--ui-text) !important;
    }

    &:hover {
      background-color: var(--ui-bg-accented) !important;
    }
  }
</style>
