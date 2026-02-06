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
    <BuilderLayoutDesktopSidebars v-if="isDesktop" />

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
  </UDashboardGroup>
</template>
