import { convertSlice } from "@inglorious/store/migration/rtk"
import { createSlice } from "@reduxjs/toolkit"

import { clearClick } from "../store/actions"

const slice = createSlice({
  name: "footer",

  initialState: { activeFilter: "all" },

  reducers: {
    setFilter(state, action) {
      state.activeFilter = action.payload
    },
  },

  extraReducers: (builder) => {
    builder.addCase(clearClick, (state) => {
      state.activeFilter = "all"
    })
  },
})

export default slice.reducer
export const { setFilter } = slice.actions

export const footer = convertSlice(slice, {
  extraActions: [clearClick],
})
