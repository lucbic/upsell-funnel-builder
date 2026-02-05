<script setup lang="ts">
  import type { NavigationMenuItem } from '@nuxt/ui'

  const route = useRoute()
  const toast = useToast()

  const open = ref(false)

  const links = [
    [
      // {
      //   label: 'Home',
      //   icon: 'i-lucide-house',
      //   to: '/',
      //   onSelect: () => {
      //     open.value = false
      //   }
      // },
      // {
      //   label: 'Inbox',
      //   icon: 'i-lucide-inbox',
      //   to: '/inbox',
      //   badge: '4',
      //   onSelect: () => {
      //     open.value = false
      //   }
      // },
      // {
      //   label: 'Customers',
      //   icon: 'i-lucide-users',
      //   to: '/customers',
      //   onSelect: () => {
      //     open.value = false
      //   }
      // },
      // {
      //   label: 'Settings',
      //   to: '/settings',
      //   icon: 'i-lucide-settings',
      //   defaultOpen: true,
      //   type: 'trigger',
      //   children: [
      //     {
      //       label: 'General',
      //       to: '/settings',
      //       exact: true,
      //       onSelect: () => {
      //         open.value = false
      //       }
      //     },
      //     {
      //       label: 'Members',
      //       to: '/settings/members',
      //       onSelect: () => {
      //         open.value = false
      //       }
      //     },
      //     {
      //       label: 'Notifications',
      //       to: '/settings/notifications',
      //       onSelect: () => {
      //         open.value = false
      //       }
      //     },
      //     {
      //       label: 'Security',
      //       to: '/settings/security',
      //       onSelect: () => {
      //         open.value = false
      //       }
      //     }
      //   ]
      // }
    ],
    [
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
    ]
  ] satisfies NavigationMenuItem[][]

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
      resizable
      class="bg-elevated/25"
    >
      <NodePalette />
    </UDashboardSidebar>

    <UMain class="h-full w-full">
      <slot />
    </UMain>

    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      side="right"
      class="bg-elevated/25"
    >
      <template #default="{ collapsed }">
        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          tooltip
          class="mt-auto"
        />
      </template>
    </UDashboardSidebar>
  </UDashboardGroup>
</template>
