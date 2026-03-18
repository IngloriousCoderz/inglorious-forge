import { describe, expect, it } from "vitest"

import { streamSlide } from "./stream-slide.js"

describe("streamSlide", () => {
  it("should use default name/value keys when stream keys are not provided", () => {
    const entity = {
      data: [{ name: "0", value: 10 }],
      streamIndex: 0,
    }

    streamSlide(entity, { value: 20 })

    expect(entity.data.at(-1)).toEqual({ name: "1", value: 20 })
    expect(entity.streamIndex).toBe(1)
  })

  it("should use custom stream keys when provided", () => {
    const entity = {
      data: [{ t: "0", v: 10 }],
      streamXKey: "t",
      streamYKey: "v",
      streamIndex: 0,
    }

    streamSlide(entity, { value: 20 })

    expect(entity.data.at(-1)).toEqual({ t: "1", v: 20 })
  })

  it("should keep only the latest points when streamWindow is configured", () => {
    const entity = {
      data: [
        { name: "0", value: 10 },
        { name: "1", value: 20 },
        { name: "2", value: 30 },
      ],
      streamIndex: 2,
      streamWindow: 2,
    }

    streamSlide(entity, { value: 40 })

    expect(entity.data).toEqual([
      { name: "2", value: 30 },
      { name: "3", value: 40 },
    ])
  })

  it("should cap history length when maxHistory is configured", () => {
    const entity = {
      data: [{ name: "0", value: 10 }],
      streamIndex: 0,
      maxHistory: 3,
    }

    streamSlide(entity, { value: 20 })
    streamSlide(entity, { value: 30 })
    streamSlide(entity, { value: 40 })
    streamSlide(entity, { value: 50 })

    expect(entity.data).toEqual([
      { name: "2", value: 30 },
      { name: "3", value: 40 },
      { name: "4", value: 50 },
    ])
  })
})
