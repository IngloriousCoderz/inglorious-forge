import { computed, ref } from "vue"
import { defineStore } from "pinia"

import {
  applyEvent,
  createInitialState,
  Events,
  filterAndSortRows,
} from "@benchmarks/dashboard-shared"

export const useDashboardStore = defineStore("dashboard", () => {
  const state = ref(createInitialState())

  const filteredRows = computed(() =>
    filterAndSortRows(
      state.value.table.data,
      state.value.metrics.filter,
      state.value.metrics.sortBy,
    ),
  )

  const notify = (type, payload) => {
    state.value = applyEvent(state.value, { type, payload })
  }

  return {
    state,
    filteredRows,
    notify,
    Events,
  }
})
