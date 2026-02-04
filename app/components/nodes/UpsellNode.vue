<script setup lang="ts">
import type { NodeProps } from '@vue-flow/core'

defineProps<NodeProps<Funnel.NodeData>>()
</script>

<template>
  <NodesBaseNode
    v-bind="$props"
    accent-color="text-green-400"
  />
</template>
