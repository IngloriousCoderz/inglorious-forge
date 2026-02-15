import { useCallback, useMemo, useReducer } from "react"

import {
  applyEvent,
  createInitialState,
  Events,
  filterAndSortRows,
} from "@benchmarks/dashboard-shared"

export const useDashboardState = () => {
  const [state, dispatch] = useReducer(
    applyEvent,
    undefined,
    createInitialState,
  )

  const filteredRows = useMemo(
    () =>
      filterAndSortRows(
        state.table.data,
        state.metrics.filter,
        state.metrics.sortBy,
      ),
    [state.table.data, state.metrics.filter, state.metrics.sortBy],
  )

  const notify = useCallback((type, payload) => {
    dispatch({ type, payload })
  }, [])

  return {
    state,
    filteredRows,
    notify,
    Events,
  }
}
