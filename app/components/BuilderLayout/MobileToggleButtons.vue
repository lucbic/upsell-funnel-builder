<script setup lang="ts">
  const emit = defineEmits<{
    (event: 'openPalette'): void
    (event: 'openManager'): void
  }>()
</script>

<template>
  <div class="fixed top-[15px] left-[15px] z-50">
    <UFieldGroup size="md" orientation="vertical">
      <UButton
        icon="i-lucide-blocks"
        color="neutral"
        variant="subtle"
        @click="emit('openPalette')"
      />

      <UButton
        icon="i-lucide-folder"
        color="neutral"
        variant="subtle"
        @click="emit('openManager')"
      />
    </UFieldGroup>
  </div>
</template>
