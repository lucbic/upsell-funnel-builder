<script setup lang="ts">
  import type { NodeProps } from '@vue-flow/core'

  defineProps<NodeProps<Funnel.NodeData>>()
</script>

<template>
  <NodeBase v-bind="$props" accent-color="text-blue-400" />
</template>
