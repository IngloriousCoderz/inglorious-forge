/**
 * @vitest-environment jsdom
 */
import { render } from "lit-html"
import { describe, expect, it } from "vitest"

import { renderGrid } from "./grid.js"

describe("renderGrid", () => {
  const mockApi = {}
  const mockEntity = {
    id: "test",
    data: [
      { x: 0, y: 10 },
      { x: 1, y: 20 },
      { x: 2, y: 30 },
    ],
  }

  const createMockScales = () => {
    const linearScale = (domain, range) => {
      const scale = (value) => {
        const [d0, d1] = domain
        const [r0, r1] = range
        return ((value - d0) / (d1 - d0)) * (r1 - r0) + r0
      }
      scale.domain = () => domain
      scale.range = () => range
      scale.ticks = (count) => {
        const step = (domain[1] - domain[0]) / count
        return Array.from({ length: count + 1 }, (_, i) => domain[0] + step * i)
      }
      return scale
    }

    return {
      xScale: linearScale([0, 2], [50, 750]),
      yScale: linearScale([0, 30], [350, 50]),
    }
  }

  it("should render grid with horizontal and vertical lines", () => {
    const { xScale, yScale } = createMockScales()
    const props = {
      xScale,
      yScale,
      width: 800,
      height: 400,
      padding: { top: 20, right: 50, bottom: 30, left: 50 },
    }

    const template = renderGrid(mockEntity, props, mockApi)
    const container = document.createElement("div")
    render(template, container)

    const horizontalLines = container.querySelectorAll(
      ".iw-chart-cartesian-grid-horizontal line",
    )
    const verticalLines = container.querySelectorAll(
      ".iw-chart-cartesian-grid-vertical line",
    )

    expect(horizontalLines.length).toBeGreaterThan(0)
    expect(verticalLines.length).toBeGreaterThan(0)
  })

  it("should use custom Y ticks if provided", () => {
    const { xScale, yScale } = createMockScales()
    const props = {
      xScale,
      yScale,
      width: 800,
      height: 400,
      padding: { top: 20, right: 50, bottom: 30, left: 50 },
      customYTicks: [0, 10, 20, 30],
    }

    const template = renderGrid(mockEntity, props, mockApi)
    const container = document.createElement("div")
    render(template, container)

    const horizontalLines = container.querySelectorAll(
      ".iw-chart-cartesian-grid-horizontal line",
    )

    expect(horizontalLines.length).toBe(4)
  })

  it("should handle band scale for X axis", () => {
    const bandScale = (domain, range) => {
      const [r0, r1] = range
      const bandwidth = (r1 - r0) / domain.length
      const scale = (value) => {
        const index = domain.indexOf(value)
        return r0 + index * bandwidth
      }
      scale.domain = () => domain
      scale.range = () => range
      scale.bandwidth = () => bandwidth
      return scale
    }

    const { yScale } = createMockScales()
    const xScale = bandScale(["A", "B", "C"], [50, 750])
    const props = {
      xScale,
      yScale,
      width: 800,
      height: 400,
      padding: { top: 20, right: 50, bottom: 30, left: 50 },
    }

    const template = renderGrid(mockEntity, props, mockApi)
    const container = document.createElement("div")
    render(template, container)

    const verticalLines = container.querySelectorAll(
      ".iw-chart-cartesian-grid-vertical line",
    )

    expect(verticalLines.length).toBeGreaterThan(0)
  })
})
