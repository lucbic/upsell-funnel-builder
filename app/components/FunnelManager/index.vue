<script setup lang="ts">
  const funnel = useFunnelStore()
  const fileInput = ref<HTMLInputElement | null>(null)

  const triggerImport = () => {
    fileInput.value?.click()
  }

  const handleFileSelect = (event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]

    if (file) {
      funnel.importFunnel(file)
    }

    input.value = ''
  }

  const isCurrentFunnel = (id: string) =>
    funnel.currentFunnelId === id
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="space-y-3">
      <UButton
        block
        icon="i-lucide-file-plus"
        variant="soft"
        @click="funnel.createNewFunnel(true)"
      >
        New Funnel
      </UButton>

      <div class="grid grid-cols-2 gap-2">
        <UButton
          block
          icon="i-lucide-download"
          variant="subtle"
          color="neutral"
          @click="funnel.exportFunnel"
        >
          Export
        </UButton>

        <UButton
          block
          icon="i-lucide-upload"
          variant="subtle"
          color="neutral"
          @click="triggerImport"
        >
          Import
        </UButton>
      </div>

      <input
        ref="fileInput"
        type="file"
        accept=".json"
        class="hidden"
        @change="handleFileSelect"
      />
    </div>

    <USeparator />

    <div
      class="-mx-4 flex flex-1 flex-col overflow-hidden
        pt-4"
    >
      <div class="px-4">
        <h4
          class="text-muted mb-3 text-xs font-semibold
            uppercase"
        >
          Saved Funnels
        </h4>

        <UEmpty
          v-if="funnel.savedFunnels.length === 0"
          icon="i-lucide-folder"
          title="No saved funnels"
          description="Your funnels will appear here once you start building"
        />

        <div
          v-else
          class="flex-1 space-y-2 overflow-y-auto"
        >
          <FunnelManagerCard
            v-for="item in funnel.savedFunnels"
            :key="item.id"
            :item="item"
            :is-current="isCurrentFunnel(item.id)"
            @select="funnel.loadFunnel"
            @delete="funnel.deleteFunnel"
          />
        </div>
      </div>
    </div>
  </div>
</template>
