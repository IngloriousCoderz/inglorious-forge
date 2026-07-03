import { createMemo } from "solid-js"
import { createStore, reconcile } from "solid-js/store"

import {
  applyEvent,
  createInitialState,
  Events,
  filterAndSortRows,
} from "@benchmarks/dashboard-shared"

export const useDashboardState = () => {
  const [state, setState] = createStore(createInitialState())

  const filteredRows = createMemo(() =>
    filterAndSortRows(
      state.table.data,
      state.metrics.filter,
      state.metrics.sortBy,
    ),
  )

  const notify = (type, payload) => {
    const nextState = applyEvent(state, { type, payload })
    if (nextState === state) return
    setState(reconcile(nextState))
  }

  return {
    state,
    filteredRows,
    notify,
    Events,
  }
}
