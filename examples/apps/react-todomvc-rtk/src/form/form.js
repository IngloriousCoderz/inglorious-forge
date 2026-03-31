import { convertSlice } from "@inglorious/store/migration/rtk"
import { createSlice } from "@reduxjs/toolkit"

import { formSubmit } from "../store/actions"

const slice = createSlice({
  name: "form",

  initialState: { value: "" },

  reducers: {
    inputChange(state, action) {
      state.value = action.payload
    },
  },

  extraReducers: (builder) => {
    builder.addCase(formSubmit, (state) => {
      state.value = ""
    })
  },
})

export const { inputChange } = slice.actions

export default slice.reducer

export const Form = convertSlice(slice, {
  extraActions: [formSubmit],
})
