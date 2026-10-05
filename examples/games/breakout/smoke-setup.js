const noop = () => {}
class FakeAudioContext {
  constructor() {
    this.state = "running"
    this.destination = {}
  }
  resume() {
    return Promise.resolve()
  }
  createGain() {
    return { gain: { value: 1 }, connect: noop }
  }
  createBufferSource() {
    return { connect: noop, start: noop, stop: noop }
  }
  decodeAudioData() {
    return Promise.resolve({})
  }
}
globalThis.window = {
  AudioContext: FakeAudioContext,
  addEventListener: noop,
  removeEventListener: noop,
  devicePixelRatio: 1,
  location: { host: "localhost:3000", hostname: "localhost", port: "3000" },
}
globalThis.document = {
  body: {
    ownerDocument: { addEventListener: noop, removeEventListener: noop },
  },
  getElementById: () => null,
}
Object.defineProperty(globalThis, "navigator", {
  value: { getGamepads: () => [] },
  configurable: true,
})
globalThis.fetch = () =>
  Promise.resolve({ arrayBuffer: () => Promise.resolve(new ArrayBuffer(1)) })
