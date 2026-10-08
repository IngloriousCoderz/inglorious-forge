import { vi } from "vitest"

/**
 * What jsdom does not have.
 *
 * The games run in a browser and these tests drive them through their store without
 * drawing a frame, so almost nothing is stubbed: jsdom already provides `window`,
 * `document`, `navigator`, `location` and `fetch`. Web Audio is the one thing it does not,
 * and the audio behaviour asks for a context as soon as an entity carries sounds, so that
 * is the one thing mocked here.
 */
// jsdom's navigator has no gamepads at all, so it is defined rather than spied on.
Object.defineProperty(navigator, "getGamepads", {
  value: () => [],
  configurable: true,
})

vi.stubGlobal(
  "AudioContext",
  class {
    state = "running"
    destination = {}
    resume = () => Promise.resolve()
    createGain = () => ({ gain: { value: 1 }, connect: vi.fn() })
    createBufferSource = () => ({
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    })
    decodeAudioData = () => Promise.resolve({})
  },
)
