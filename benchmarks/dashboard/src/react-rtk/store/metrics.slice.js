import { createSlice } from "@reduxjs/toolkit"

const slice = createSlice({
  name: "metrics",

  initialState: {
    fps: 60,
    renderTime: 0,
    updateCount: 0,
  },

  reducers: {
    setFPS: (state, action) => {
      state.fps = action.payload
    },

    incrementUpdate: (state) => {
      state.updateCount += 1
    },

    setRenderTime: (state, action) => {
      state.renderTime = action.payload
    },
  },
})

export const { setFPS, incrementUpdate, setRenderTime } = slice.actions

export default slice.reducer
