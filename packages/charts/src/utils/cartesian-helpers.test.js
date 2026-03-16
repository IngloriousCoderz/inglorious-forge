/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest"

import { getResolvedEntity } from "./cartesian-helpers.js"

describe("cartesian-helpers", () => {
  describe("getResolvedEntity", () => {
    const baseEntity = { id: "base" }

    it("should return ctx.entity when present", () => {
      const ctx = { entity: { id: "entity" }, fullEntity: { id: "full" } }
      const result = getResolvedEntity(ctx, baseEntity)
      expect(result).toBe(ctx.entity)
    })

    it("should return ctx.fullEntity when entity is missing", () => {
      const ctx = { fullEntity: { id: "full" } }
      const result = getResolvedEntity(ctx, baseEntity)
      expect(result).toBe(ctx.fullEntity)
    })

    it("should fall back to original entity when ctx has no entity/fullEntity", () => {
      const ctx = {}
      const result = getResolvedEntity(ctx, baseEntity)
      expect(result).toBe(baseEntity)
    })

    it("should handle missing ctx gracefully", () => {
      const result = getResolvedEntity(null, baseEntity)
      expect(result).toBe(baseEntity)
    })
  })
})
