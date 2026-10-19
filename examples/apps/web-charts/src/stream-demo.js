// The realtime charts follow a made-up stream: a random walk, one point a
// second. A real app pushes its own data with the same event.

const STREAM_IDS = ["realtimeLineChartConfig", "realtimeLineChart"]
const INTERVAL_MS = 1000
const PREFILLED_POINTS = 30
const MIN = 0
const MAX = 200
const MAX_STEP = 25

export function startDemoStream(store) {
  const values = new Map(STREAM_IDS.map((id) => [id, (MIN + MAX) / 2]))

  const push = () => {
    for (const id of STREAM_IDS) {
      const step = Math.round((Math.random() - 0.5) * 2 * MAX_STEP)
      const value = Math.min(MAX, Math.max(MIN, values.get(id) + step))
      values.set(id, value)
      store.notify(`#${id}:streamPush`, value)
    }
  }

  for (let count = 0; count < PREFILLED_POINTS; count++) push()
  return setInterval(push, INTERVAL_MS)
}
