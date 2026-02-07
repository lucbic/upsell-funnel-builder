<script setup lang="ts">
  const { isDesktop } = useDevice()
  const mobileDrag = useMobileDrag()

  const nodeTypeConfig = getNodeTypeConfig()

  const ghostData = computed(() => {
    const type = mobileDrag.nodeType.value
    if (!type) return null
    const config = nodeTypeConfig[type]
    return {
      nodeType: type,
      icon: config.icon,
      title: config.label
    }
  })

  const ghostStyle = computed(() => ({
    position: 'fixed' as const,
    left: `${mobileDrag.position.value.x - 80}px`,
    top: `${mobileDrag.position.value.y - 30}px`,
    width: '160px',
    pointerEvents: 'none' as const,
    zIndex: 9999,
    opacity: 0.85
  }))
</script>

<template>
  <UApp>
    <NuxtPage />

    <Teleport to="body">
      <div
        v-if="mobileDrag.isDragging.value && !isDesktop"
        :style="ghostStyle"
      >
        <BuilderPanelNode
          palette
          :data="ghostData!"
        />
      </div>
    </Teleport>
  </UApp>
</template>
