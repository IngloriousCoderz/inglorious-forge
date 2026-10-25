<template>
  <div class="metrics">
    <div class="metric" :class="fpsClass">FPS(avg10): {{ metrics.fps }}</div>
    <div class="metric">FPS(now): {{ metrics.fpsNow }}</div>
    <div class="metric">
      30s:
      {{
        metrics.benchmark.done ? "DONE" : `${metrics.benchmark.remaining}s left`
      }}
    </div>
    <div class="metric">
      Mean/Min/Max: {{ metrics.benchmark.mean }}/{{ metrics.benchmark.min }}/{{
        metrics.benchmark.max
      }}
    </div>
    <div class="metric">Commit(avg10): {{ metrics.commitAvg10 }}ms</div>
    <div class="metric">Commit(now): {{ metrics.commitNow }}ms</div>
    <div class="metric">Updates: {{ metrics.updateCount }}</div>
    <div class="metric">Nodes: {{ nodes }}</div>
    <div class="metric">Leaves: {{ leaves }}</div>
  </div>
</template>

<script setup>
import { computed } from "vue"

const props = defineProps({
  metrics: {
    type: Object,
    required: true,
  },
  nodes: {
    type: Number,
    required: true,
  },
  leaves: {
    type: Number,
    required: true,
  },
})

const fpsClass = computed(() => {
  if (props.metrics.fps < 30) return "error"
  if (props.metrics.fps < 50) return "warning"
  return ""
})
</script>
