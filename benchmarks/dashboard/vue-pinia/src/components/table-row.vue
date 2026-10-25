<script setup>
defineProps({
  row: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(["click"])
</script>

<template>
  <tr @click="() => emit('click', row.id)">
    <td>{{ row.rowId }}</td>
    <td>{{ row.name }}</td>
    <td>{{ row.value }}</td>
    <td>
      <span :class="`status status-${row.status.toLowerCase()}`">{{
        row.status
      }}</span>
    </td>
    <td>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${row.progress}%` }" />
        <span class="progress-text">{{ row.progress }}%</span>
      </div>
    </td>
  </tr>
</template>
