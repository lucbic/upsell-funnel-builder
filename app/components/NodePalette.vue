<script setup lang="ts">
  const nodeTypes = Object.entries(useNodeTypeConfig()) as [
    Funnel.NodeType,
    Funnel.NodeTypeConfig
  ][]

  const onDragStart = (
    event: DragEvent,
    nodeType: Funnel.NodeType
  ) => {
    if (!event.dataTransfer) return
    event.dataTransfer.setData(
      'application/vueflow',
      nodeType
    )
    event.dataTransfer.effectAllowed = 'move'
  }

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
  ]
</script>

<template>
  <div class="flex h-full flex-col gap-2">
    <h3 class="mb-2 text-xs font-semibold uppercase">
      Funnel Steps
    </h3>

    <div
      v-for="[type, config] in nodeTypes"
      :key="type"
      draggable="true"
      class="cursor-grab transition-all
        active:cursor-grabbing"
      @dragstart="onDragStart($event, type)"
    >
      <BuilderPanelNode
        palette
        :data="{
          nodeType: type,
          icon: config.icon,
          title: config.label
        }"
      />
    </div>

    <div class="mt-auto pt-4">
      <UNavigationMenu
        :items="links"
        orientation="vertical"
        class="w-full"
      />
    </div>
  </div>
</template>
