<script setup lang="ts">
  const nodeTypes = useNodeTypeConfig()

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
          draggable="true"
          :aria-label="`Add ${config.label} to canvas`"
          class="focus-visible:ring-primary cursor-grab
            transition-all focus-visible:rounded-lg
            focus-visible:ring-2 focus-visible:outline-none
            active:cursor-grabbing"
          @dragstart="onDragStart($event, type)"
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
</template>
