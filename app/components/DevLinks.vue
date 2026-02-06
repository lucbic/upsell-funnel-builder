<script setup lang="ts">
  const {
    public: { portfolioUrl, linkedinUrl, githubUrl }
  } = useRuntimeConfig()
  const links = [
    {
      label: 'Portfolio',
      icon: 'i-lucide-globe',
      to: portfolioUrl,
      target: '_blank'
    },
    {
      label: 'LinkedIn',
      icon: 'i-lucide-linkedin',
      to: linkedinUrl,
      target: '_blank'
    },
    {
      label: 'GitHub',
      icon: 'i-lucide-github',
      to: githubUrl,
      target: '_blank'
    }
  ]
</script>

<template>
  <div>
    <h2 class="text-muted pl-3 text-sm">
      Built by Lucas Bicudo 🇧🇷
    </h2>

    <div class="flex">
      <div class="flex-1 space-y-2 pt-4">
        <UNavigationMenu
          :items="links"
          orientation="vertical"
          class="w-full"
        />
      </div>

      <div class="flex flex-1 items-end justify-end">
        <UColorModeSwitch size="lg" />
      </div>
    </div>
  </div>
</template>
