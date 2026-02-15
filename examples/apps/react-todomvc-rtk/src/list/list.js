import { convertSlice } from "@inglorious/store/migration/rtk"
import { createSlice } from "@reduxjs/toolkit"

import { clearClick, formSubmit } from "../store/actions"

const TASKS_TO_REMOVE = 1
const DEFAULT_ID = 1
const LAST_TASK = 1
const NEXT_ID = 1

const slice = createSlice({
  name: "list",

  initialState: { tasks: [] },

  reducers: {
    toggleClick(state, action) {
      const task = state.tasks.find((task) => task.id === action.payload)
      task.completed = !task.completed
    },

    deleteClick(state, action) {
      const index = state.tasks.findIndex((task) => task.id === action.payload)
      state.tasks.splice(index, TASKS_TO_REMOVE)
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(formSubmit, (state, action) => {
        const text = action.payload?.trim?.() ?? ""
        if (!text.length) return
        state.tasks.push({ id: nextId(state.tasks), text })
      })
      .addCase(clearClick, (state) => {
        state.tasks = state.tasks.filter((task) => !task.completed)
      })
  },
})

export const { toggleClick, deleteClick } = slice.actions

export default slice.reducer

export const list = convertSlice(slice, {
  extraActions: [formSubmit, clearClick],
})

function nextId(tasks) {
  if (!tasks.length) return DEFAULT_ID
  return tasks[tasks.length - LAST_TASK].id + NEXT_ID
}
