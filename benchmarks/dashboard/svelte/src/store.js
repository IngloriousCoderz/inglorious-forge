import { derived, writable } from "svelte/store"

import {
  applyEvent,
  createInitialState,
  Events,
  filterAndSortRows,
} from "@benchmarks/dashboard-shared"

export const state = writable(createInitialState())

export const filteredRows = derived(state, ($state) => {
  return filterAndSortRows(
    $state.table.data,
    $state.metrics.filter,
    $state.metrics.sortBy,
  )
})

export const notify = (type, payload) => {
  state.update((currentState) => applyEvent(currentState, { type, payload }))
}

export { Events }
