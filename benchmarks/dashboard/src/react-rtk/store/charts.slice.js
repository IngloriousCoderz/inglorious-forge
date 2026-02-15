import { createSlice } from "@reduxjs/toolkit"

import { CHARTS } from "@/charts"

const chartsSlice = createSlice({
  name: "charts",
  initialState: CHARTS,
  reducers: {},
})

export default chartsSlice.reducer
