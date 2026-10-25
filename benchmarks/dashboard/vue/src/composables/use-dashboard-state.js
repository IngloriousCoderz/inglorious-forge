import { computed, ref } from "vue"

import {
  applyEvent,
  createInitialState,
  Events,
  filterAndSortRows,
} from "@benchmarks/dashboard-shared"

export const useDashboardState = () => {
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
}
