import { performance } from "node:perf_hooks"

const ONE_SECOND = 1000
const TICK_RATE = 60
const TICK_INTERVAL = ONE_SECOND / TICK_RATE
let lastTime = performance.now()

/**
 * Starts the main server-side game loop.
 * @param {object} store The game store instance.
 * @param {object} api The game API with broadcast functionality.
 */
export function start(store, api) {
  setInterval(() => {
    const currentTime = performance.now()
    const dt = (currentTime - lastTime) / ONE_SECOND
    lastTime = currentTime

    store.update(dt, api)
  }, TICK_INTERVAL)
}
