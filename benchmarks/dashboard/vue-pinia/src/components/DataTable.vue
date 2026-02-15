<script setup>
import TableRow from "./TableRow.vue"

defineProps({
  rows: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(["sort", "rowClick"])
</script>

<template>
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th @click="() => emit('sort', 'id')">ID</th>
          <th>Name</th>
          <th @click="() => emit('sort', 'value')">Value</th>
          <th>Status</th>
          <th @click="() => emit('sort', 'progress')">Progress</th>
        </tr>
      </thead>
      <tbody>
        <TableRow
          v-for="row in rows"
          :key="row.id"
          :row="row"
          @click="(id) => emit('rowClick', id)"
        />
      </tbody>
    </table>
  </div>
</template>
