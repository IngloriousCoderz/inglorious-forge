const DEFAULT_MIN_INTERVAL_MS = 100
const DEFAULT_INTERVAL_MS = 1000

export function createRealtimeStreamSystem({
  controllerId = "realtimeStreamController",
  tickEvent = "streamTick",
  minIntervalMs = DEFAULT_MIN_INTERVAL_MS,
} = {}) {
  let intervalId = null

  const system = {
    init(_draft, _payload, api) {
      if (intervalId) return

      const controller = api.getEntity(controllerId)
      const intervalMs = Math.max(
        minIntervalMs,
        Number(controller?.intervalMs) || DEFAULT_INTERVAL_MS,
      )

      intervalId = setInterval(() => {
        api.notify(`#${controllerId}:${tickEvent}`)
      }, intervalMs)
    },
  }

  function stop() {
    if (!intervalId) return
    clearInterval(intervalId)
    intervalId = null
  }

  return { system, stop }
}
