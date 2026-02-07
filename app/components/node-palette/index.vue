<script setup lang="ts">
  const nodeTypes = getNodeTypeConfig()

  const store = useFunnelCanvasStore()
  const { isDesktop } = useDevice()
  const mobileDrag = useMobileDrag()

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

  const onTouchDragStart = (
    event: TouchEvent,
    type: Funnel.NodeType
  ) => {
    if (isDesktop.value) return
    const touch = event.touches[0]!
    mobileDrag.startDrag(type, {
      x: touch.clientX,
      y: touch.clientY
    })
  }
</script>

<template>
  <div class="flex flex-col gap-2">
    <section aria-label="Node palette">
      <h1 class="mb-2 text-xs font-semibold uppercase">
        Funnel Steps
      </h1>

      <div class="flex flex-col gap-2">
        <div
          v-for="(config, type) in nodeTypes"
          :key="type"
          role="button"
          tabindex="0"
          :draggable="isDesktop"
          :aria-label="`Add ${config.label} to canvas`"
          class="focus-visible:ring-primary transition-all
            focus-visible:rounded-lg focus-visible:ring-2
            focus-visible:outline-none"
          :class="
            isDesktop
              ? 'cursor-grab active:cursor-grabbing'
              : 'cursor-pointer active:scale-95'
          "
          @dragstart="onDragStart($event, type)"
          @touchstart="onTouchDragStart($event, type)"
          @keydown.enter="store.addNodeToCanvas(type)"
          @keydown.space.prevent="
            store.addNodeToCanvas(type)
          "
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
  </div>

  <NodePaletteMobileDrag v-if="!isDesktop" />
</template>
