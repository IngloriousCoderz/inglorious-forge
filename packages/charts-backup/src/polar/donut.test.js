/**
 * @vitest-environment jsdom
 */
import { render } from "@inglorious/web/test"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { donut } from "./donut.js"

describe("donut", () => {
  let entity
  let api

  beforeEach(() => {
    entity = {
      id: "test-donut",
      type: "donut",
      data: [
        { label: "Category A", value: 20 },
        { label: "Category B", value: 35 },
        { label: "Category C", value: 15 },
      ],
      width: 400,
      height: 400,
      colors: ["#3b82f6", "#ef4444", "#10b981"],
      showTooltip: true,
      showLabel: true,
    }

    api = {
      notify: vi.fn(),
    }
  })

  describe("render()", () => {
    it("should render donut chart with data", () => {
      const result = donut.render(entity, api)
      const container = document.createElement("div")
      render(result, container)

      const svg = container.querySelector("svg")
      expect(svg).toBeTruthy()
    })

    it("should handle empty data gracefully", () => {
      entity.data = []

      const result = donut.render(entity, api)
      const container = document.createElement("div")
      render(result, container)

      const svg = container.querySelector("svg")
      expect(svg).toBeTruthy()
    })

    it("should render center text when configured", () => {
      entity.centerText = "Total Sales"

      const result = donut.render(entity, api)
      const container = document.createElement("div")
      render(result, container)

      expect(container.textContent).toContain("Total Sales")
    })

    it("should notify tooltipShow and tooltipHide on slice hover", () => {
      const result = donut.render(entity, api)
      const container = document.createElement("div")
      render(result, container)

      const slice = container.querySelector(".iw-chart-pie-slice")
      expect(slice).toBeTruthy()

      slice.dispatchEvent(
        new MouseEvent("mouseenter", {
          bubbles: true,
          clientX: 100,
          clientY: 120,
        }),
      )

      expect(api.notify).toHaveBeenCalledWith(
        `#${entity.id}:tooltipShow`,
        expect.objectContaining({
          label: expect.any(String),
          value: expect.any(Number),
          color: expect.any(String),
          x: expect.any(Number),
          y: expect.any(Number),
        }),
      )

      slice.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }))
      expect(api.notify).toHaveBeenCalledWith(`#${entity.id}:tooltipHide`)
    })

    it("should not notify tooltipShow when tooltip is disabled", () => {
      entity.showTooltip = false

      const result = donut.render(entity, api)
      const container = document.createElement("div")
      render(result, container)

      const slice = container.querySelector(".iw-chart-pie-slice")
      expect(slice).toBeTruthy()

      slice.dispatchEvent(
        new MouseEvent("mouseenter", {
          bubbles: true,
          clientX: 90,
          clientY: 110,
        }),
      )

      expect(api.notify).not.toHaveBeenCalledWith(
        `#${entity.id}:tooltipShow`,
        expect.any(Object),
      )
    })

    it("should notify tooltipMove on svg mouse move when tooltip is visible", () => {
      entity.tooltip = { label: "Category A", value: 20, color: "#3b82f6" }

      const result = donut.render(entity, api)
      const container = document.createElement("div")
      render(result, container)

      const svg = container.querySelector("svg")
      expect(svg).toBeTruthy()

      svg.dispatchEvent(
        new MouseEvent("mousemove", {
          bubbles: true,
          clientX: 100,
          clientY: 120,
        }),
      )

      expect(api.notify).toHaveBeenCalledWith(`#${entity.id}:tooltipMove`, {
        x: 115,
        y: 105,
      })
    })
  })

  describe("renderTooltip()", () => {
    it("should return a tooltip composition function", () => {
      const tooltipFn = donut.renderTooltip(entity, { config: {} }, api)
      expect(typeof tooltipFn).toBe("function")
      expect(tooltipFn.isTooltip).toBe(true)
    })
  })
})
