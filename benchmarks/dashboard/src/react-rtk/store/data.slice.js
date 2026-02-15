import { createSlice } from "@reduxjs/toolkit"

import {
  generateData,
  MAX_VALUE,
  ROWS_TO_GENERATE,
  ROWS_TO_UPDATE,
  updateData,
} from "../../data"

const slice = createSlice({
  name: "data",

  initialState: {
    rows: generateData(ROWS_TO_GENERATE),
    filter: "",
    sortBy: "id",
  },

  reducers: {
    updateRandomRows: (state) => {
      state.rows = updateData(state.rows, ROWS_TO_UPDATE)
    },

    updateRow: (state, action) => {
      const row = state.rows.find((r) => r.id === action.payload)
      if (row) {
        row.value = Math.floor(Math.random() * MAX_VALUE)
      }
    },

    setFilter: (state, action) => {
      state.filter = action.payload
    },

    setSort: (state, action) => {
      state.sortBy = action.payload
    },
  },
})

export const {
  updateRandomRows,
  updateRow,
  setFilter,
  setSort,
  setFPS,
  incrementUpdate,
  setRenderTime,
} = slice.actions

export default slice.reducer
