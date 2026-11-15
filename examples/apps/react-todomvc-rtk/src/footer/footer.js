import { convertSlice } from "@inglorious/store/migration/rtk"
import { createSlice } from "@reduxjs/toolkit"

import { completedClear } from "../store/actions"

const slice = createSlice({
  name: "footer",

  initialState: { activeFilter: "all" },

  reducers: {
    setFilter(state, action) {
      state.activeFilter = action.payload
    },
  },

  extraReducers: (builder) => {
    builder.addCase(completedClear, (state) => {
      state.activeFilter = "all"
    })
  },
})

export const { setFilter } = slice.actions

export default slice.reducer

export const Footer = convertSlice(slice, {
  extraActions: [completedClear],
})
