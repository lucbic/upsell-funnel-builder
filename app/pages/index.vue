<script setup lang="ts">
  const toast = useToast()
  const store = useFunnelStore()
  const { start, finish } = useLoadingIndicator()

  const open = ref(false)

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
      id="palette"
      side="left"
      role="complementary"
      class="bg-elevated/25"
      :default-size="18"
      aria-label="Node palette"
    >
      <NodePalette />
    </UDashboardSidebar>

    <UMain
      role="main"
      class="relative h-full w-full"
      aria-label="Funnel canvas"
    >
      <NuxtLoadingIndicator
        color="var(--ui-primary)"
        class="absolute! left-0! z-50 w-full!"
      />

      <BuilderPanel />
    </UMain>

    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      :default-size="18"
      side="right"
      role="complementary"
      class="bg-elevated/25 border-default border-l"
      aria-label="Funnel manager"
    >
      <FunnelManager />
    </UDashboardSidebar>
  </UDashboardGroup>
</template>
