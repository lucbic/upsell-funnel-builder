<script setup lang="ts">
  import { useVueFlow } from '@vue-flow/core'

  const {
    setCenter,
    addSelectedNodes,
    removeSelectedNodes,
    getNodes
  } = useVueFlow()

  const {
    isValid,
    errors,
    warnings,
    hasErrors,
    hasWarnings,
    totalIssueCount
  } = useFunnelValidation()

  const isExpanded = ref(false)

  const statusIcon = computed(() =>
    isValid.value
      ? 'i-lucide-check-circle'
      : 'i-lucide-alert-triangle'
  )

  const statusColor = computed(() =>
    isValid.value ? 'text-green-500' : 'text-red-500'
  )

  const statusText = computed(() => {
    if (isValid.value && !hasWarnings.value)
      return 'Funnel OK'

    if (isValid.value && hasWarnings.value)
      return `${warnings.value.length} warning${warnings.value.length > 1 ? 's' : ''}`

    return `${totalIssueCount.value} issue${totalIssueCount.value > 1 ? 's' : ''}`
  })

  const focusNode = (nodeId: string | undefined) => {
    if (!nodeId) return

    const node = getNodes.value.find(n => n.id === nodeId)
    if (!node) return

    removeSelectedNodes(getNodes.value)
    addSelectedNodes([node])

    setCenter(
      node.position.x + 100,
      node.position.y + 37.5,
      {
        duration: 300,
        zoom: 1.5
      }
    )
  }
</script>

<template>
  <div
    class="bg-elevated border-muted absolute bottom-[15px]
      left-[15px] z-50 min-w-64 overflow-hidden rounded-lg
      border shadow-lg"
  >
    <UCollapsible v-model:open="isExpanded" class="group">
      <button
        type="button"
        :aria-expanded="isExpanded"
        aria-controls="validation-content"
        class="hover:bg-accented flex w-full cursor-pointer
          items-center gap-2 px-3 py-2 transition-colors"
      >
        <UIcon
          :name="statusIcon"
          :class="statusColor"
          class="size-5"
          aria-hidden="true"
        />

        <span class="text-sm font-medium">
          {{ statusText }}
        </span>

        <UIcon
          name="i-lucide-chevron-up"
          class="ml-auto size-4 transition-transform
            duration-200 group-data-[state=open]:rotate-180"
          aria-hidden="true"
        />
      </button>

      <template #content>
        <div
          id="validation-content"
          role="region"
          aria-label="Validation results"
          class="border-muted max-h-64 overflow-y-auto
            border-t px-3 py-2"
        >
          <template v-if="hasErrors">
            <div class="mb-2">
              <span
                class="text-xs font-semibold text-red-500
                  uppercase"
              >
                Errors
              </span>
            </div>

            <div
              v-for="error in errors"
              :key="error.id"
              role="button"
              tabindex="0"
              :aria-label="error.message"
              class="hover:bg-accented
                focus-visible:ring-primary mb-1 flex
                cursor-pointer items-start gap-2 rounded
                p-1.5 transition-colors focus-visible:ring-2
                focus-visible:outline-none"
              :class="{ 'cursor-pointer': error.nodeId }"
              @click="focusNode(error.nodeId)"
              @keydown.enter="focusNode(error.nodeId)"
              @keydown.space.prevent="
                focusNode(error.nodeId)
              "
            >
              <UIcon
                name="i-lucide-x-circle"
                class="mt-0.5 size-4 shrink-0 text-red-500"
              />

              <span class="text-sm">
                {{ error.message }}
              </span>
            </div>
          </template>

          <template v-if="hasWarnings">
            <div
              class="mb-2"
              :class="{ 'mt-3': hasErrors }"
            >
              <span
                class="text-xs font-semibold text-yellow-500
                  uppercase"
              >
                Warnings
              </span>
            </div>

            <div
              v-for="warning in warnings"
              :key="warning.id"
              role="button"
              tabindex="0"
              :aria-label="warning.message"
              class="hover:bg-accented
                focus-visible:ring-primary mb-1 flex
                cursor-pointer items-start gap-2 rounded
                p-1.5 transition-colors focus-visible:ring-2
                focus-visible:outline-none"
              :class="{ 'cursor-pointer': warning.nodeId }"
              @click="focusNode(warning.nodeId)"
              @keydown.enter="focusNode(warning.nodeId)"
              @keydown.space.prevent="
                focusNode(warning.nodeId)
              "
            >
              <UIcon
                name="i-lucide-alert-circle"
                class="mt-0.5 size-4 shrink-0
                  text-yellow-500"
              />

              <span class="text-sm">
                {{ warning.message }}
              </span>
            </div>
          </template>

          <div
            v-if="!hasErrors && !hasWarnings"
            role="status"
            class="flex items-center gap-2 py-2
              text-green-500"
          >
            <UIcon
              name="i-lucide-check-circle"
              class="size-4"
            />

            <span class="text-sm">No issues found</span>
          </div>
        </div>
      </template>
    </UCollapsible>
  </div>
</template>
