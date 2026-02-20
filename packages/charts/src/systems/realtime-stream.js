const DEFAULT_MIN_INTERVAL_MS = 100
const DEFAULT_INTERVAL_MS = 1000

export function createRealtimeStreamSystem({
  controllerId = "realtimeStreamController",
  targetType = null,
  tickEvent = "streamTick",
  intervalMs = DEFAULT_INTERVAL_MS,
  minIntervalMs = DEFAULT_MIN_INTERVAL_MS,
} = {}) {
  let intervalId = null

  const system = {
    init(_draft, _payload, api) {
      if (intervalId) return

      let eventName = null
      let resolvedIntervalMs = Math.max(minIntervalMs, DEFAULT_INTERVAL_MS)

      if (targetType) {
        // Modern mode: fixed high-frequency pulse, entities gate their own cadence.
        eventName = `${targetType}:${tickEvent}`
        resolvedIntervalMs = minIntervalMs
      } else if (controllerId) {
        // Legacy mode: keep compatibility with controller-driven interval.
        const baseIntervalMs = Number(intervalMs) || DEFAULT_INTERVAL_MS
        const controller = api.getEntity(controllerId)
        resolvedIntervalMs = Math.max(
          minIntervalMs,
          Number(controller?.intervalMs) || baseIntervalMs,
        )
        eventName = `#${controllerId}:${tickEvent}`
      } else {
        return
      }

      intervalId = setInterval(() => {
        api.notify(eventName)
      }, resolvedIntervalMs)
    },
  }

  function stop() {
    if (!intervalId) return
    clearInterval(intervalId)
    intervalId = null
  }

  return { system, stop }
}
