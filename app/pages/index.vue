<script setup lang="ts">
  import type { NavigationMenuItem } from '@nuxt/ui'

  const route = useRoute()
  const toast = useToast()

  const open = ref(false)

  const links = [
    {
      label: 'Portfolio',
      icon: 'i-lucide-globe',
      to: 'https://advaita.dev/portfolio',
      target: '_blank'
    },
    {
      label: 'LinkedIn',
      icon: 'i-lucide-linkedin',
      to: 'https://www.linkedin.com/in/lucbic/',
      target: '_blank'
    },
    {
      label: 'GitHub',
      icon: 'i-lucide-github',
      to: 'https://github.com/lucbic',
      target: '_blank'
    }
  ] satisfies NavigationMenuItem[]

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
      <LayoutNodePalette />
    </UDashboardSidebar>

    <UMain class="h-full w-full">
      <LayoutBuilderPanel />
    </UMain>

    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      :default-size="18"
      side="right"
      class="bg-elevated/25 border-default border-l"
    >
      <template #default="{ collapsed }">
        <UNavigationMenu
          :collapsed="collapsed"
          :items="links"
          orientation="vertical"
          tooltip
          class="mt-auto"
        />
      </template>
    </UDashboardSidebar>
  </UDashboardGroup>
</template>
