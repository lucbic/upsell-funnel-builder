<script setup lang="ts">
  const paletteOpen = ref(false)
  const managerOpen = ref(false)

  const { isDesktop } = useDevice()
</script>

<template>
  <UDrawer
    v-model:open="paletteOpen"
    direction="left"
    aria-label="Node palette"
    handle-only
    :handle="false"
  >
    <template #content>
      <div class="h-full p-4">
        <NodePalette />
      </div>
    </template>
  </UDrawer>

  <UDrawer
    v-model:open="managerOpen"
    direction="right"
    aria-label="Funnel manager"
    handle-only
    :handle="false"
  >
    <template #content>
      <div class="h-full p-4">
        <FunnelManager />
      </div>
    </template>
  </UDrawer>

  <BuilderLayoutMobileToggleButtons
    v-if="!isDesktop"
    @openPalette="paletteOpen = true"
    @openManager="managerOpen = true"
  />
</template>
