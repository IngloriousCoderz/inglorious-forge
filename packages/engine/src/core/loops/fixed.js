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
