/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest"

import {
  ensureValidNumber,
  formatDate,
  formatNumber,
  getDataPointLabel,
  getDataPointX,
  getDataPointY,
  getSeriesValues,
  getTransformedData,
  isMultiSeries,
  isValidNumber,
  parseDimension,
} from "./data-utils.js"

describe("data-utils", () => {
  describe("formatNumber", () => {
    it("should format number with default format", () => {
      expect(formatNumber(1234.56)).toBe("1,234.56")
    })

    it("should format number with custom format", () => {
      expect(formatNumber(1234.56, ".0f")).toBe("1235")
    })
  })

  describe("formatDate", () => {
    it("should format date with default format", () => {
      const date = new Date("2024-01-15")
      const result = formatDate(date)
      expect(result).toContain("2024")
    })

    it("should format date with custom format", () => {
      const date = new Date("2024-01-15")
      const result = formatDate(date, "%Y-%m-%d")
      expect(result).toBe("2024-01-15")
    })
  })

  describe("getSeriesValues", () => {
    it("should return values array if present", () => {
      const series = { name: "Series A", values: [{ x: 0, y: 10 }] }
      expect(getSeriesValues(series)).toEqual([{ x: 0, y: 10 }])
    })

    it("should wrap single value in array", () => {
      const series = { x: 0, y: 10 }
      expect(getSeriesValues(series)).toEqual([{ x: 0, y: 10 }])
    })
  })

  describe("isMultiSeries", () => {
    it("should return true for multi-series data", () => {
      const data = [
        { name: "Series A", values: [{ x: 0, y: 10 }] },
        { name: "Series B", values: [{ x: 0, y: 20 }] },
      ]
      expect(isMultiSeries(data)).toBe(true)
    })

    it("should return false for single series data", () => {
      const data = [
        { x: 0, y: 10 },
        { x: 1, y: 20 },
      ]
      expect(isMultiSeries(data)).toBe(false)
    })

    it("should return false for empty array", () => {
      expect(isMultiSeries([])).toBe(false)
    })
  })

  describe("getDataPointX", () => {
    it("should return x value if present", () => {
      expect(getDataPointX({ x: 5 })).toBe(5)
    })

    it("should return date value if x is not present", () => {
      expect(getDataPointX({ date: "2024-01-01" })).toBe("2024-01-01")
    })

    it("should return fallback if neither x nor date present", () => {
      expect(getDataPointX({ value: 10 }, 0)).toBe(0)
    })
  })

  describe("getDataPointY", () => {
    it("should return y value if present", () => {
      expect(getDataPointY({ y: 100 })).toBe(100)
    })

    it("should return value if y is not present", () => {
      expect(getDataPointY({ value: 200 })).toBe(200)
    })

    it("should return fallback if neither y nor value present", () => {
      expect(getDataPointY({ name: "Jan" }, 0)).toBe(0)
    })
  })

  describe("getDataPointLabel", () => {
    it("should return x value if present", () => {
      expect(getDataPointLabel({ x: "Jan" })).toBe("Jan")
    })

    it("should return date value if x is not present", () => {
      expect(getDataPointLabel({ date: "2024-01-01" })).toBe("2024-01-01")
    })

    it("should return fallback if neither x nor date present", () => {
      expect(getDataPointLabel({ value: 10 }, "Value")).toBe("Value")
    })
  })

  describe("isValidNumber", () => {
    it("should return true for valid numbers", () => {
      expect(isValidNumber(100)).toBe(true)
      expect(isValidNumber(0)).toBe(true)
      expect(isValidNumber(-50)).toBe(true)
      expect(isValidNumber(3.14)).toBe(true)
    })

    it("should return false for invalid numbers", () => {
      expect(isValidNumber(NaN)).toBe(false)
      expect(isValidNumber(Infinity)).toBe(false)
      expect(isValidNumber("100")).toBe(false)
      expect(isValidNumber(null)).toBe(false)
      expect(isValidNumber(undefined)).toBe(false)
    })
  })

  describe("ensureValidNumber", () => {
    it("should return value if valid", () => {
      expect(ensureValidNumber(100)).toBe(100)
    })

    it("should return fallback if invalid", () => {
      expect(ensureValidNumber(NaN, 0)).toBe(0)
      expect(ensureValidNumber("100", 0)).toBe(0)
    })
  })

  describe("parseDimension", () => {
    it("should return number if already a number", () => {
      expect(parseDimension(800)).toBe(800)
    })

    it("should parse numeric string", () => {
      expect(parseDimension("800")).toBe(800)
    })

    it("should return undefined for percentage strings", () => {
      expect(parseDimension("100%")).toBeUndefined()
    })

    it("should return undefined for pixel strings", () => {
      expect(parseDimension("800px")).toBeUndefined()
    })

    it("should return undefined for non-numeric strings", () => {
      expect(parseDimension("auto")).toBeUndefined()
    })
  })

  describe("getTransformedData", () => {
    it("should transform data with dataKey", () => {
      const entity = {
        id: "test",
        data: [
          { name: "Jan", value: 100 },
          { name: "Feb", value: 200 },
        ],
      }

      const result = getTransformedData(entity, "value")

      // When dataKey exists, name fallback uses d[dataKey] first, then d.name
      // So name will be the value (100, 200) if dataKey exists
      expect(result).toEqual([
        { x: 0, y: 100, name: 100 },
        { x: 1, y: 200, name: 200 },
      ])
    })

    it("should fallback to y or value if dataKey not found", () => {
      const entity = {
        id: "test",
        data: [{ name: "Jan", y: 100 }],
      }

      const result = getTransformedData(entity, "missingKey")

      expect(result).toEqual([{ x: 0, y: 100, name: "Jan" }])
    })

    it("should return null if entity is missing", () => {
      expect(getTransformedData(null, "value")).toBeNull()
    })

    it("should return null if entity.data is missing", () => {
      expect(getTransformedData({ id: "test" }, "value")).toBeNull()
    })
  })
})
