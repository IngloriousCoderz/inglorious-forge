const ONE_SECOND = 1000
const NO_WAIT = 0

export class FixedLoop {
  _shouldStop = false

  async start(engine, msPerUpdate) {
    let previousTime = Date.now()

    while (!this._shouldStop) {
      const currentTime = Date.now()
      const dt = currentTime - previousTime

      engine.update(dt / ONE_SECOND)

      previousTime = currentTime

      // The rest of the interval, not the interval on top of the work: sleeping what
      // was already spent as well halves the rate, and a frame that overran its budget
      // starts the next one straight away rather than falling further behind.
      await sleep(Math.max(NO_WAIT, msPerUpdate - (Date.now() - currentTime)))
    }
  }

  stop() {
    this._shouldStop = true
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
