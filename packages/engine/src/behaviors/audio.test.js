import { expect, test, vi } from "vitest"

import { audio } from "./audio.js"

// Only enough of the browser's audio to stand an AudioContext up: what is being tested is
// what the behaviour lets go of, not what it plays.
function stubbedWindow() {
  const listeners = {}

  const context = {
    resume: vi.fn(),
    decodeAudioData: vi.fn(),
    createBufferSource: vi.fn(() => ({ start: vi.fn(), stop: vi.fn() })),
    destination: {},
  }

  return {
    listeners,
    window: {
      AudioContext: function AudioContext() {
        return context
      },
      addEventListener: (name, handler) => (listeners[name] = handler),
      removeEventListener: (name, handler) => {
        if (listeners[name] === handler) delete listeners[name]
      },
    },
  }
}

test("it should let go of the window when the entity is destroyed", () => {
  // An entity created and destroyed -- a screen's own, say -- must not leave its listeners
  // on the window, or the page pays for them for as long as it is open.
  const { listeners, window } = stubbedWindow()
  vi.stubGlobal("window", window)

  const type = audio()

  type.create()
  expect(Object.keys(listeners)).toEqual(["pointerdown", "keydown"])

  type.destroy()

  expect(Object.keys(listeners)).toEqual([])

  vi.unstubAllGlobals()
})

test("it should let go of the window when the game stops", () => {
  const { listeners, window } = stubbedWindow()
  vi.stubGlobal("window", window)

  const type = audio()

  type.create()
  type.stop()

  expect(Object.keys(listeners)).toEqual([])

  vi.unstubAllGlobals()
})

test("it should let go of the window on whichever comes first", () => {
  // The two are the same job, so it is worth saying they are: `stop` and `destroy` are one
  // function reached by two different ways out.
  const { listeners, window } = stubbedWindow()
  vi.stubGlobal("window", window)

  const type = audio()

  expect(type.stop).toBe(type.destroy)

  type.create()
  type.destroy()
  type.stop()

  expect(Object.keys(listeners)).toEqual([])

  vi.unstubAllGlobals()
})
