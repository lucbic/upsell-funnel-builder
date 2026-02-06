<script setup lang="ts">
  const toast = useToast()
  const store = useFunnelStore()
  const { start, finish } = useLoadingIndicator()
  const { isDesktop } = useDevice()

  watch(
    () => store.isLoading,
    loading => {
      if (loading) start()
      else finish()
    }
  )

  onMounted(async () => {
    toast.add({
      title: 'Welcome to the Upsell Funnel Builder. ',
      duration: 2000,
      close: false,
      icon: 'i-lucide-sparkles'
    })
  })
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      v-if="isDesktop"
      id="palette"
      side="left"
      role="complementary"
      class="bg-elevated/25"
      :default-size="18"
      :toggle="false"
      aria-label="Node palette"
    >
      <NodePalette />
    </UDashboardSidebar>

    <UMain
      class="relative h-full w-full"
      aria-label="Funnel canvas"
    >
      <NuxtLoadingIndicator
        color="var(--ui-primary)"
        class="absolute! left-0! z-50 w-full!"
      />

      <BuilderPanel />

      <BuilderLayoutMobileDrawers v-if="!isDesktop" />
    </UMain>

    <UDashboardSidebar
      v-if="isDesktop"
      id="manager"
      :default-size="18"
      side="right"
      role="complementary"
      class="bg-elevated/25 border-default border-l"
      :toggle="false"
      aria-label="Funnel manager"
    >
      <FunnelManager />
    </UDashboardSidebar>
  </UDashboardGroup>
</template>
