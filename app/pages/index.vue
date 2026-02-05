<script setup lang="ts">
  const toast = useToast()

  const open = ref(false)

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
      class="bg-elevated/25"
      :default-size="18"
    >
      <NodePalette />
    </UDashboardSidebar>

    <UMain class="h-full w-full">
      <BuilderPanel />
    </UMain>

    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      :default-size="18"
      side="right"
      class="bg-elevated/25 border-default border-l"
    >
      <FunnelManager />
    </UDashboardSidebar>
  </UDashboardGroup>
</template>
