<template>
  <div v-if="node.children.length === 0" class="leaf">
    {{ node.leafId }} v{{ leaf.version }} val:{{ leaf.value }}
  </div>
  <div v-else class="node">
    <div class="node-label">{{ node.id }}</div>
    <TreeNode
      v-for="child in node.children"
      :key="child.id"
      :node="child"
      :leaf-values="leafValues"
    />
  </div>
</template>

<script setup>
import { computed } from "vue"

const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
  leafValues: {
    type: Object,
    required: true,
  },
})

const leaf = computed(() => {
  if (!props.node.leafId) {
    return { value: "-", version: "-" }
  }
  return props.leafValues[props.node.leafId]
})
</script>
