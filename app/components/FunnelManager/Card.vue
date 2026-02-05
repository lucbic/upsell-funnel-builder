<script setup lang="ts">
  const { item, isCurrent } = defineProps<{
    item: Funnel.FunnelListItem
    isCurrent: boolean
  }>()

  const emit = defineEmits<{
    select: [id: string]
    delete: [id: string]
  }>()

  const formatDate = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (seconds < 60) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`

    return new Date(timestamp).toLocaleDateString()
  }

  const handleCardClick = () => {
    if (!isCurrent) emit('select', item.id)
  }

  const handleDelete = (event: Event) => {
    event.stopPropagation()
    emit('delete', item.id)
  }
</script>

<template>
  <UCard
    variant="subtle"
    :class="[
      'border-muted border transition-all',
      isCurrent
        ? 'border-primary'
        : 'hover:bg-elevated cursor-pointer'
    ]"
    @click="handleCardClick"
  >
    <div class="space-y-2">
      <div class="flex items-start justify-between gap-2">
        <p class="text-sm leading-tight font-medium">
          {{ item.name }}
        </p>

        <UBadge v-if="isCurrent" size="xs" variant="subtle">
          Current
        </UBadge>
      </div>

      <div
        class="text-muted flex items-center gap-3 text-xs"
      >
        <span class="flex items-center gap-1">
          <UIcon name="i-lucide-layers" />
          {{ item.nodeCount }} nodes
        </span>

        <span>{{ formatDate(item.updatedAt) }}</span>
      </div>

      <div class="flex justify-end">
        <UButton
          class="cursor-pointer"
          size="xs"
          variant="subtle"
          color="error"
          icon="i-lucide-trash-2"
          aria-label="Delete funnel"
          title="Delete funnel"
          @click="handleDelete"
        />
      </div>
    </div>
  </UCard>
</template>
