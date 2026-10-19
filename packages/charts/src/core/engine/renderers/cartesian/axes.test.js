import { scaleBand } from "d3-scale"
import { scalePoint } from "d3-scale"
import { describe, expect, it } from "vitest"

import {
  getXTicks,
  renderCartesianGrid,
  renderXAxis,
  renderYAxis,
} from "./axes.js"

function createFrame() {
  const xScale = scaleBand().domain([0, 1]).range([0, 200]).padding(0)

  return {
    entity: {
      xKey: "name",
      data: [
        { name: "Jan", value: 10 },
        { name: "Feb", value: 20 },
      ],
    },
    primitives: [],
    scales: {
      xScale,
      yScale(value) {
        return 200 - value * 10
      },
    },
    dimensions: {
      plotLeft: 40,
      plotRight: 240,
      plotTop: 20,
      plotBottom: 200,
    },
  }
}

describe("axes renderers", () => {
  it("renders cartesian grid with domain and tick lines", () => {
    const frame = createFrame()
    frame.scales.yScale.ticks = () => [0, 10, 20]

    const result = renderCartesianGrid({ props: {} }, frame)
    const items = result.values.filter(Array.isArray)

    expect(String(result.strings.join(""))).toContain("iw-chart-grid")
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveLength(2)
    expect(items[1]).toHaveLength(3)
  })

  it("renders x-axis labels from entity data", () => {
    const result = renderXAxis({ props: { dataKey: "name" } }, createFrame())

    const labels = result.values.find(Array.isArray)

    expect(String(result.strings.join(""))).toContain("iw-chart-axis-x")
    expect(labels).toHaveLength(2)
  })

  it("renders y-axis ticks", () => {
    const frame = createFrame()
    frame.scales.yScale.ticks = () => [0, 10, 20]

    const result = renderYAxis({ props: {} }, frame)
    const labels = result.values.find(Array.isArray)

    expect(String(result.strings.join(""))).toContain("iw-chart-axis-y")
    expect(labels).toHaveLength(3)
  })

  describe("x ticks", () => {
    // 100 points across 400 pixels, labelled "Point 0" to "Point 99".
    function createCrowdedFrame() {
      const data = Array.from({ length: 100 }, (_, index) => ({
        name: `Point ${index}`,
        value: index,
      }))
      return {
        entity: { xKey: "name", data },
        primitives: [],
        scales: {
          xScale: scalePoint()
            .domain(data.map((row, index) => index))
            .range([0, 400]),
        },
      }
    }

    it("shows as many labels as fit without overlapping, keeping the last", () => {
      const ticks = getXTicks(createCrowdedFrame())

      expect(ticks.length).toBeGreaterThan(1)
      expect(ticks.length).toBeLessThan(100)
      expect(ticks.at(-1).label).toBe("Point 99")
      ticks.slice(1).forEach((tick, i) => {
        const previous = ticks[i]
        const halfWidths = ((previous.label.length + tick.label.length) * 7) / 2
        expect(tick.x - previous.x).toBeGreaterThanOrEqual(halfWidths + 5)
      })
    })

    it("shows every label when they fit", () => {
      expect(getXTicks(createFrame()).map((tick) => tick.label)).toEqual([
        "Jan",
        "Feb",
      ])
    })

    it("skips `interval` labels between the ones shown", () => {
      const ticks = getXTicks(createCrowdedFrame(), {
        props: { interval: 24 },
      })

      expect(ticks.map((tick) => tick.index)).toEqual([0, 25, 50, 75])
    })

    it("shows every label with an interval of 0", () => {
      expect(
        getXTicks(createCrowdedFrame(), { props: { interval: 0 } }),
      ).toHaveLength(100)
    })

    it("keeps fewer labels with a larger minTickGap", () => {
      const frame = createCrowdedFrame()

      expect(
        getXTicks(frame, { props: { minTickGap: 40 } }).length,
      ).toBeLessThan(getXTicks(frame).length)
    })

    it("draws the vertical grid lines where the axis shows labels", () => {
      const frame = createCrowdedFrame()
      frame.dimensions = {
        plotLeft: 0,
        plotRight: 400,
        plotTop: 0,
        plotBottom: 200,
      }
      frame.scales.yScale = Object.assign(() => 0, { ticks: () => [] })
      frame.primitives = [{ type: "x-axis", props: { interval: 9 } }]

      const [verticalLines] = renderCartesianGrid(
        { props: {} },
        frame,
      ).values.filter(Array.isArray)

      expect(verticalLines).toHaveLength(10)
    })
  })
})
