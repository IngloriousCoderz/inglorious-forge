import { createSlice } from "@reduxjs/toolkit"

import { CHARTS } from "@benchmarks/dashboard-shared"

const chartsSlice = createSlice({
  name: "charts",
  initialState: CHARTS,
  reducers: {},
})

export default chartsSlice.reducer
