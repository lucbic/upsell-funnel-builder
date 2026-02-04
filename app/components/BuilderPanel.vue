<script setup lang="ts">
  import '@vue-flow/controls/dist/style.css'
  import '@vue-flow/core/dist/style.css'
  import '@vue-flow/core/dist/theme-default.css'

  import { VueFlow, PanOnScrollMode } from '@vue-flow/core'
  import { Background as VFBackground } from '@vue-flow/background'
  import { Controls as VFControls } from '@vue-flow/controls'
</script>

<template>
  <UCard class="h-full w-full">
    <VueFlow class="h-full w-full">
      <VFBackground
        pattern-color="rgba(255, 255, 255, 0.1)"
        :gap="25"
        variant="lines"
        class="pointer-events-none"
      />

      <VFControls
        class="absolute right-0 bottom-0 left-auto!"
        :show-interactive="false"
        :fit-view-params="{ duration: 300, padding: 0 }"
      />
    </VueFlow>
  </UCard>
</template>
