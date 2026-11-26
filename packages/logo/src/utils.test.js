/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest"

import { saturate } from "./utils"

describe("utils", () => {
  describe("saturate", () => {
    it("clamps positive values to the limit", () => {
      expect(saturate(10, 5)).toBe(5)
    })

    it("clamps negative values to -limit", () => {
      expect(saturate(-10, 5)).toBe(-5)
    })

    it("returns value when within limits", () => {
      expect(saturate(3, 5)).toBe(3)
    })
  })
})
