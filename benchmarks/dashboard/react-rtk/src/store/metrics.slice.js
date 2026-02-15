import { createSlice } from "@reduxjs/toolkit"

import {
  applyFpsSample,
  createFpsBenchmark,
} from "@benchmarks/dashboard-shared"
import { randomUpdate } from "./events"

const metricsSlice = createSlice({
  name: "metrics",
  initialState: {
    fps: 60,
    fpsNow: 60,
    fpsSamples: [60],
    benchmark: createFpsBenchmark(),
    renderTime: 0,
    updateCount: 0,
    filter: "",
    sortBy: "id",
  },
  reducers: {
    setFPS(state, action) {
      Object.assign(state, applyFpsSample(state, action.payload))
    },
    setFilter(state, action) {
      state.filter = action.payload
    },
    setSort(state, action) {
      state.sortBy = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(randomUpdate, (state) => {
      const start = performance.now()
      state.updateCount += 1
      state.renderTime = Math.round(performance.now() - start)
    })
  },
})

export const { setFPS, setFilter, setSort } = metricsSlice.actions

export default metricsSlice.reducer
