import { convertSlice } from "@inglorious/store/migration/rtk"
import { createSlice } from "@reduxjs/toolkit"

import {
  generateData,
  MAX_VALUE,
  ROWS_TO_GENERATE,
  ROWS_TO_UPDATE,
  updateData,
} from "@/data"

import { randomUpdate } from "./events"

const tableSlice = createSlice({
  name: "table",
  initialState: {
    data: generateData(ROWS_TO_GENERATE),
  },
  reducers: {
    tableClick(state, action) {
      const row = state.data.find((r) => r.id === action.payload)
      if (row) {
        row.value = Math.floor(Math.random() * MAX_VALUE)
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(randomUpdate, (state) => {
      state.data = updateData(state.data, ROWS_TO_UPDATE)
    })
  },
})

export const { tableClick } = tableSlice.actions

export const table = convertSlice(tableSlice, {
  extraActions: [randomUpdate],
})
