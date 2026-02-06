<script setup lang="ts">
  import { useVueFlow } from '@vue-flow/core'

  const nodeTypes = Object.entries(useNodeTypeConfig()) as [
    Funnel.NodeType,
    Funnel.NodeTypeConfig
  ][]

  const { NODE_WIDTH, NODE_HEIGHT } = useNodeSizes()
  const { screenToFlowCoordinate } = useVueFlow()
  const store = useFunnelStore()

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

  const addNodeViaKeyboard = (type: Funnel.NodeType) => {
    const vueFlowEl = document.querySelector('.vue-flow')
    if (!vueFlowEl) return

    const rect = vueFlowEl.getBoundingClientRect()
    const center = screenToFlowCoordinate({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    })

    store.createNode(type, {
      x: center.x - NODE_WIDTH / 2,
      y: center.y - NODE_HEIGHT / 2
    })
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
    <section aria-label="Node palette">
      <h1 class="mb-2 text-xs font-semibold uppercase">
        Funnel Steps
      </h1>

      <div class="flex flex-col gap-2">
        <div
          v-for="[type, config] in nodeTypes"
          :key="type"
          role="button"
          tabindex="0"
          draggable="true"
          :aria-label="`Add ${config.label} to canvas`"
          class="focus-visible:ring-primary cursor-grab
            transition-all focus-visible:rounded-lg
            focus-visible:ring-2 focus-visible:outline-none
            active:cursor-grabbing"
          @dragstart="onDragStart($event, type)"
          @keydown.enter="addNodeViaKeyboard(type)"
          @keydown.space.prevent="addNodeViaKeyboard(type)"
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
      </div>
    </section>

    <div class="mt-auto">
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
  </div>
</template>
