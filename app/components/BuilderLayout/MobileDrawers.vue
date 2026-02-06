<script setup lang="ts">
  import {
    DialogTitle,
    DialogDescription,
    VisuallyHidden
  } from 'reka-ui'

  const paletteOpen = ref(false)
  const managerOpen = ref(false)

  const { isDesktop } = useDevice()

  const blurActiveElement = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
  }

  const openPalette = () => {
    blurActiveElement()
    paletteOpen.value = true
  }

  const openManager = () => {
    blurActiveElement()
    managerOpen.value = true
  }
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
      <VisuallyHidden>
        <DialogTitle>Node palette</DialogTitle>

        <DialogDescription>
          Select a node type to add to your funnel
        </DialogDescription>
      </VisuallyHidden>

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
      <VisuallyHidden>
        <DialogTitle>Funnel manager</DialogTitle>

        <DialogDescription>
          Manage your funnel configurations
        </DialogDescription>
      </VisuallyHidden>

      <div class="h-full p-4">
        <FunnelManager />
      </div>
    </template>
  </UDrawer>

  <BuilderLayoutMobileToggleButtons
    v-if="!isDesktop"
    @openPalette="openPalette"
    @openManager="openManager"
  />
</template>
