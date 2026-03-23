import { describe, expect, it } from "vitest"

import { renderFrame } from "./index.js"

describe("engine", () => {
  it("renders non-stacked area series from highest peak to background", () => {
    const frame = {
      entity: {
        id: "areas",
        type: "area",
        data: [
          { name: "Jan", low: 20, high: 90, mid: 50 },
          { name: "Feb", low: 30, high: 120, mid: 60 },
        ],
        xKey: "name",
        colors: ["#111111", "#222222", "#333333"],
        tooltipEnabled: true,
      },
      components: [
        { type: "area", props: { dataKey: "low", fill: "#111111" } },
        { type: "area", props: { dataKey: "high", fill: "#222222" } },
        { type: "area", props: { dataKey: "mid", fill: "#333333" } },
      ],
      scales: {
        xScaleMode: "point",
        xScale: Object.assign((value) => ({ Jan: 80, Feb: 220 })[value], {
          domain: () => ["Jan", "Feb"],
          bandwidth: () => 0,
        }),
        yScale: (value) => 200 - value,
        plottedKeys: ["low", "high", "mid"],
      },
      dimensions: {
        width: 400,
        height: 240,
        plotLeft: 40,
        plotRight: 360,
        plotTop: 20,
        plotBottom: 200,
      },
    }

    const result = renderFrame(frame)
    const renderedAreas = result.values[5]
    const fills = renderedAreas.map((area) => area.values[1])

    expect(fills).toEqual(["#222222", "#333333", "#111111"])
  })

  it("does not render the brush overlay when the brush is hidden", () => {
    const frame = {
      entity: {
        id: "hidden-brush",
        type: "line",
        data: [{ name: "Jan", value: 10 }],
        fullData: [{ name: "Jan", value: 10 }],
        xKey: "name",
        colors: ["#2563eb"],
        tooltipEnabled: true,
        brush: {
          enabled: true,
          visible: false,
          startIndex: 0,
          endIndex: 0,
          height: 30,
        },
        seriesKeys: ["value"],
      },
      components: [{ type: "brush", props: {} }],
      scales: {
        plottedKeys: ["value"],
      },
      dimensions: {
        width: 400,
        height: 240,
        plotLeft: 40,
        plotWidth: 320,
        brushTop: null,
      },
    }

    const result = renderFrame(frame)
    const renderedBrush = result.values[5][0]

    expect(renderedBrush.strings).toEqual([""])
    expect(renderedBrush.values).toEqual([])
  })
})
