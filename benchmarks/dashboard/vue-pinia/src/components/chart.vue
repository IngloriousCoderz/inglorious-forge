<script setup>
defineProps({
  chartData: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div class="chart">
    <h3>{{ chartData.title }}</h3>
    <div class="chart-bars">
      <div
        v-for="(value, i) in chartData.values"
        :key="i"
        class="bar"
        :style="{
          height: `${(value / chartData.max) * 100}px`,
          backgroundColor: `hsl(${(value / chartData.max) * 120}, 70%, 50%)`,
        }"
      />
    </div>
    <div class="chart-info">Avg: {{ chartData.avg }}</div>
  </div>
</template>
