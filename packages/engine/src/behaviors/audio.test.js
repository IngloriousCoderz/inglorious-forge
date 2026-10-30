import { expect, test, vi } from "vitest"

import { audio } from "./audio.js"

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
