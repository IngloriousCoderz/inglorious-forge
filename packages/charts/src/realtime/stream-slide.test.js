import { describe, expect, it } from "vitest"

import { streamSlide } from "./stream-slide.js"

describe("streamSlide", () => {
  it("does nothing when the entity has no seeded data", () => {
    const entity = { data: [] }

    streamSlide(entity, { value: 10 })

    expect(entity.data).toEqual([])
    expect(entity.streamIndex).toBe(undefined)
  })

  it("appends a new point using the default stream keys", () => {
    const entity = {
      data: [{ name: "0", value: 10 }],
      streamIndex: 0,
    }

    streamSlide(entity, { value: 25 })

    expect(entity.streamIndex).toBe(1)
    expect(entity.data.at(-1)).toEqual({ name: "1", value: 25 })
  })

  it("supports numeric stream indexes when requested", () => {
    const entity = {
      data: [{ x: 0, y: 10 }],
      streamIndex: 0,
      streamIndexAsNumber: true,
      streamXKey: "x",
      streamYKey: "y",
    }

    streamSlide(entity, { value: 25 })

    expect(entity.data.at(-1)).toEqual({ x: 1, y: 25 })
  })

  it("uses a provided custom point payload as-is", () => {
    const entity = {
      data: [{ name: "0", value: 10 }],
      streamIndex: 0,
    }

    streamSlide(entity, {
      point: { name: "custom", value: 77, note: "manual" },
    })

    expect(entity.data.at(-1)).toEqual({
      name: "custom",
      value: 77,
      note: "manual",
    })
  })

  it("trims the history to maxHistory", () => {
    const entity = {
      data: [
        { name: "0", value: 10 },
        { name: "1", value: 20 },
      ],
      streamIndex: 1,
      maxHistory: 2,
    }

    streamSlide(entity, { value: 30 })

    expect(entity.data).toEqual([
      { name: "1", value: 20 },
      { name: "2", value: 30 },
    ])
  })
})
