import { describe, expect, it } from "vitest"

import {
  clampRect,
  fitRect,
  hitTest,
  matchesAspect,
  normalizeAspect,
  panRect,
  resizeRect,
  scaleRect,
} from "./helpers.js"

function expectRect(actual, expected) {
  for (const key of ["x", "y", "w", "h"]) {
    expect(actual[key]).toBeCloseTo(expected[key])
  }
}

describe("clampRect", () => {
  it("keeps the rect inside the image", () => {
    expect(clampRect({ x: -1, y: 2, w: 3, h: 3 })).toEqual({
      x: 0,
      y: 0,
      w: 1,
      h: 1,
    })
  })

  it("enforces the minimum size", () => {
    const rect = clampRect(
      { x: 0.5, y: 0.5, w: 0.01, h: 0.01 },
      { minSize: 0.2 },
    )
    expect(rect.w).toBe(0.2)
    expect(rect.h).toBe(0.2)
  })

  it("enforces the aspect from the height", () => {
    expectRect(clampRect({ x: 0, y: 0, w: 0.9, h: 0.4 }, { aspect: 2 }), {
      x: 0,
      y: 0,
      w: 0.8,
      h: 0.4,
    })
  })

  it("caps an aspect frame at the image", () => {
    expectRect(clampRect({ x: 0, y: 0, w: 1, h: 1 }, { aspect: 2 }), {
      x: 0,
      y: 0,
      w: 1,
      h: 0.5,
    })
  })
})

describe("fitRect", () => {
  it("takes the whole image without an aspect", () => {
    expect(fitRect(null)).toEqual({ x: 0, y: 0, w: 1, h: 1 })
  })

  it("centres the largest frame at the aspect", () => {
    expectRect(fitRect(0.5), { x: 0.25, y: 0, w: 0.5, h: 1 })
    expectRect(fitRect(2), { x: 0, y: 0.25, w: 1, h: 0.5 })
  })
})

describe("hitTest", () => {
  const rect = { x: 0.2, y: 0.2, w: 0.4, h: 0.4 }
  const tolerance = { x: 0.05, y: 0.05 }

  it("finds corners, edges and the inside", () => {
    expect(hitTest({ x: 0.2, y: 0.2 }, rect, tolerance)).toBe("nw")
    expect(hitTest({ x: 0.61, y: 0.59 }, rect, tolerance)).toBe("se")
    expect(hitTest({ x: 0.6, y: 0.4 }, rect, tolerance)).toBe("e")
    expect(hitTest({ x: 0.4, y: 0.18 }, rect, tolerance)).toBe("n")
    expect(hitTest({ x: 0.4, y: 0.4 }, rect, tolerance)).toBe("move")
  })

  it("misses outside the frame", () => {
    expect(hitTest({ x: 0.05, y: 0.05 }, rect, tolerance)).toBeNull()
    expect(hitTest({ x: 0.9, y: 0.4 }, rect, tolerance)).toBeNull()
  })
})

describe("matchesAspect / normalizeAspect", () => {
  it("turns a pixel ratio into an image-fraction one", () => {
    // A square crop of a 2:1 image is half as wide as it is tall in fractions.
    expect(normalizeAspect(1, 2000, 1000)).toBe(0.5)
    expect(normalizeAspect(null, 2000, 1000)).toBeNull()
    expect(normalizeAspect(1, 0, 0)).toBeNull()
  })

  it("compares shapes with a small tolerance", () => {
    expect(matchesAspect({ x: 0, y: 0, w: 0.5, h: 1 }, 0.5)).toBe(true)
    expect(matchesAspect({ x: 0, y: 0, w: 1, h: 1 }, 0.5)).toBe(false)
  })
})

describe("panRect", () => {
  it("moves without resizing and stops at the edges", () => {
    expect(panRect({ x: 0.1, y: 0.1, w: 0.5, h: 0.5 }, -1, 0.2)).toEqual({
      x: 0,
      y: 0.30000000000000004,
      w: 0.5,
      h: 0.5,
    })
  })
})

describe("resizeRect (free)", () => {
  const start = { x: 0.2, y: 0.2, w: 0.4, h: 0.4 }

  it("moves only the dragged edge", () => {
    expectRect(resizeRect(start, "e", 0.1, 0.5), {
      x: 0.2,
      y: 0.2,
      w: 0.5,
      h: 0.4,
    })
    expectRect(resizeRect(start, "n", 0.5, 0.1), {
      x: 0.2,
      y: 0.3,
      w: 0.4,
      h: 0.3,
    })
  })

  it("keeps the anchor when an edge hits the image border", () => {
    expectRect(resizeRect(start, "e", 5, 0), { x: 0.2, y: 0.2, w: 0.8, h: 0.4 })
    expectRect(resizeRect(start, "w", -5, 0), { x: 0, y: 0.2, w: 0.6, h: 0.4 })
  })

  it("stops at the minimum size instead of flipping", () => {
    expectRect(resizeRect(start, "w", 5, 0, { minSize: 0.1 }), {
      x: 0.5,
      y: 0.2,
      w: 0.1,
      h: 0.4,
    })
  })
})

describe("resizeRect (aspect)", () => {
  const start = { x: 0.2, y: 0.2, w: 0.4, h: 0.4 }

  it("grows a corner from the opposite one", () => {
    expectRect(resizeRect(start, "se", 0.2, 0, { aspect: 1 }), {
      x: 0.2,
      y: 0.2,
      w: 0.6,
      h: 0.6,
    })
    expectRect(resizeRect(start, "nw", 0, -0.1, { aspect: 1 }), {
      x: 0.1,
      y: 0.1,
      w: 0.5,
      h: 0.5,
    })
  })

  it("keeps an edge drag centred on the other axis", () => {
    expectRect(resizeRect(start, "e", 0.2, 0, { aspect: 1 }), {
      x: 0.2,
      y: 0.1,
      w: 0.6,
      h: 0.6,
    })
  })

  it("stops where the frame would leave the image", () => {
    expectRect(resizeRect(start, "se", 5, 5, { aspect: 1 }), {
      x: 0.2,
      y: 0.2,
      w: 0.8,
      h: 0.8,
    })
  })
})

describe("scaleRect", () => {
  it("grows around the centre", () => {
    expectRect(scaleRect({ x: 0.25, y: 0.25, w: 0.5, h: 0.5 }, 2), {
      x: 0,
      y: 0,
      w: 1,
      h: 1,
    })
  })

  it("keeps the aspect while shrinking", () => {
    const rect = scaleRect({ x: 0, y: 0.25, w: 1, h: 0.5 }, 0.5, { aspect: 2 })
    expect(rect.w / rect.h).toBeCloseTo(2)
    expectRect(rect, { x: 0.25, y: 0.375, w: 0.5, h: 0.25 })
  })
})
