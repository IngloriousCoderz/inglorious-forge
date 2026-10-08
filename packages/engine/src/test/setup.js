import { vi } from "vitest"

/**
 * Mocks what a browser gives a game and a test environment does not.
 *
 * Run this once per test file, from a setup module. Web Audio is the thing jsdom has
 * never had, and the audio behaviour asks for a context as soon as an entity carries
 * sounds; `navigator.getGamepads` is the other, and is defined rather than spied on
 * because jsdom's navigator has no such property to spy on.
 *
 * @returns {void}
 */
export function setupBrowser() {
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

  Object.defineProperty(navigator, "getGamepads", {
    value: () => [],
    configurable: true,
  })
}
