<script setup>
const ERROR_FPS = 30
const WARN_FPS = 50

const props = defineProps({
  metrics: {
    type: Object,
    required: true,
  },
})

const fpsClass = () => {
  if (props.metrics.fps < ERROR_FPS) return "error"
  if (props.metrics.fps < WARN_FPS) return "warning"
  return ""
}
</script>

<template>
  <div class="metrics">
    <div :class="`metric ${fpsClass()}`">FPS(avg10): {{ metrics.fps }}</div>
    <div class="metric">FPS(now): {{ metrics.fpsNow }}</div>
    <div class="metric">
      30s:
      {{
        metrics.benchmark.done ? "DONE" : `${metrics.benchmark.remaining}s left`
      }}
    </div>
    <div class="metric">
      Mean/Min/Max:
      {{ metrics.benchmark.mean }}/{{ metrics.benchmark.min }}/{{
        metrics.benchmark.max
      }}
    </div>
    <div class="metric">Update Time: {{ metrics.renderTime }}ms</div>
    <div class="metric">Updates: {{ metrics.updateCount }}</div>
  </div>
</template>
