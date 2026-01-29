// Benchmark configuration
export const CHART_COUNT = 4 // Number of charts to render
export const DATA_POINTS = 100 // Number of data points per chart
export const UPDATE_FREQUENCY = 100 // Update interval in ms (10 updates/second)
export const CHARTS_TO_UPDATE = 2 // Number of charts to update per cycle

// Generate initial data for charts
export const generateChartData = (count = DATA_POINTS) => {
  return Array.from({ length: count }, (_, i) => ({
    name: `Point ${i}`,
    value: Math.floor(Math.random() * 1000),
    uv: Math.floor(Math.random() * 800),
    pv: Math.floor(Math.random() * 600),
  }))
}

// Update random data points in chart data
export const updateChartData = (data, count = CHARTS_TO_UPDATE) => {
  const newData = [...data]
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * newData.length)
    newData[randomIndex] = {
      ...newData[randomIndex],
      value: Math.floor(Math.random() * 1000),
      uv: Math.floor(Math.random() * 800),
      pv: Math.floor(Math.random() * 600),
    }
  }
  return newData
}

// FPS Counter utility
export class FPSCounter {
  constructor() {
    this.frameCount = 0
    this.lastTime = performance.now()
    this.fps = 0
  }

  tick() {
    this.frameCount++
    const currentTime = performance.now()
    const elapsed = currentTime - this.lastTime

    if (elapsed >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / elapsed)
      this.frameCount = 0
      this.lastTime = currentTime
    }

    return this.fps
  }
}
