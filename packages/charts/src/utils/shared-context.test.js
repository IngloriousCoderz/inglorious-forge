/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest"

import { createSharedContext } from "./shared-context.js"

describe("createSharedContext", () => {
  const mockApi = {}

  describe("basic functionality", () => {
    it("should create context with default dimensions", () => {
      const entity = {
        id: "test",
        type: "line",
        data: [
          { name: "Jan", value: 100 },
          { name: "Feb", value: 200 },
        ],
      }

      const context = createSharedContext(entity, {}, mockApi)

      expect(context.xScale).toBeDefined()
      expect(context.yScale).toBeDefined()
      expect(context.dimensions.width).toBe(800)
      expect(context.dimensions.height).toBe(400)
      expect(context.dimensions.padding).toBeDefined()
      expect(context.entity).toBe(entity)
    })

    it("should use entity dimensions if provided", () => {
      const entity = {
        id: "test",
        type: "line",
        data: [{ value: 100 }],
        width: 1000,
        height: 500,
      }

      const context = createSharedContext(entity, {}, mockApi)

      expect(context.dimensions.width).toBe(1000)
      expect(context.dimensions.height).toBe(500)
    })

    it("should override dimensions from props", () => {
      const entity = {
        id: "test",
        type: "line",
        data: [{ value: 100 }],
        width: 800,
        height: 400,
      }

      const context = createSharedContext(
        entity,
        { width: 1200, height: 600 },
        mockApi,
      )

      expect(context.dimensions.width).toBe(1200)
      expect(context.dimensions.height).toBe(600)
    })

    it("should throw error if entity is missing", () => {
      expect(() => {
        createSharedContext(null, {}, mockApi)
      }).toThrow("Entity and entity.data are required")
    })

    it("should throw error if entity.data is missing", () => {
      expect(() => {
        createSharedContext({ id: "test" }, {}, mockApi)
      }).toThrow("Entity and entity.data are required")
    })
  })

  describe("Y-scale calculation", () => {
    it("should calculate Y scale from all numeric values (config-first mode)", () => {
      const entity = {
        id: "test",
        type: "line",
        data: [
          { name: "Jan", value: 100, other: 50 },
          { name: "Feb", value: 200, other: 75 },
          { name: "Mar", value: 150, other: 100 },
        ],
      }

      const context = createSharedContext(entity, {}, mockApi)

      // Y scale should include max of all numeric values (200 from value, 100 from other)
      const domain = context.yScale.domain()
      expect(domain[1]).toBeGreaterThanOrEqual(200)
    })

    it("should calculate Y scale from specific dataKeys (composition mode)", () => {
      const entity = {
        id: "test",
        type: "line",
        data: [
          { name: "Jan", productA: 100, productB: 200 },
          { name: "Feb", productA: 150, productB: 250 },
        ],
      }

      const context = createSharedContext(
        entity,
        { usedDataKeys: new Set(["productA"]) },
        mockApi,
      )

      // Y scale should only consider productA values (max 150)
      const domain = context.yScale.domain()
      expect(domain[1]).toBeGreaterThanOrEqual(150)
      expect(domain[1]).toBeLessThan(200) // Should not include productB
    })

    it("should handle empty data", () => {
      const entity = {
        id: "test",
        type: "line",
        data: [],
      }

      const context = createSharedContext(entity, {}, mockApi)

      expect(context.yScale).toBeDefined()
      const domain = context.yScale.domain()
      expect(domain[1]).toBeGreaterThanOrEqual(0)
    })

    it("should calculate Y scale from sum of dataKeys when stacked is true", () => {
      const entity = {
        id: "test",
        type: "area",
        data: [
          { name: "Jan", uv: 4000, pv: 2400, amt: 2400 },
          { name: "Feb", uv: 3000, pv: 1398, amt: 2210 },
        ],
      }

      const context = createSharedContext(
        entity,
        {
          usedDataKeys: ["uv", "pv", "amt"],
          stacked: true,
          chartType: "area",
        },
        mockApi,
      )

      const domain = context.yScale.domain()
      // Jan sum is 8800, Feb sum is 6608
      expect(domain[1]).toBeGreaterThanOrEqual(8800)
    })
  })

  describe("chart types", () => {
    it("should create context for line chart", () => {
      const entity = {
        id: "test",
        type: "line",
        data: [{ value: 100 }],
      }

      const context = createSharedContext(
        entity,
        { chartType: "line" },
        mockApi,
      )

      expect(context.xScale).toBeDefined()
      expect(context.yScale).toBeDefined()
    })

    it("should create context for area chart", () => {
      const entity = {
        id: "test",
        type: "area",
        data: [{ value: 100 }],
      }

      const context = createSharedContext(
        entity,
        { chartType: "area" },
        mockApi,
      )

      expect(context.xScale).toBeDefined()
      expect(context.yScale).toBeDefined()
    })
  })

  describe("dataKeys handling", () => {
    it("should accept dataKeys as Set", () => {
      const entity = {
        id: "test",
        type: "line",
        data: [
          { name: "Jan", productA: 100, productB: 200 },
          { name: "Feb", productA: 150, productB: 250 },
        ],
      }

      const context = createSharedContext(
        entity,
        { usedDataKeys: new Set(["productA", "productB"]) },
        mockApi,
      )

      expect(context.yScale).toBeDefined()
      const domain = context.yScale.domain()
      expect(domain[1]).toBeGreaterThanOrEqual(250)
    })

    it("should accept dataKeys as array", () => {
      const entity = {
        id: "test",
        type: "line",
        data: [
          { name: "Jan", productA: 100, productB: 200 },
          { name: "Feb", productA: 150, productB: 250 },
        ],
      }

      const context = createSharedContext(
        entity,
        { usedDataKeys: ["productA"] },
        mockApi,
      )

      expect(context.yScale).toBeDefined()
    })
  })
})
