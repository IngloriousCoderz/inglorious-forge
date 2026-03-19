import { describe, expect, it } from "vitest"

import { renderLegend } from "./legend.js"

describe("legend renderer", () => {
  it("renders legend items from explicit data keys and colors", () => {
    const result = renderLegend(
      {
        props: {
          dataKeys: ["revenue", "cost"],
          colors: ["#2563eb", "#f97316"],
        },
      },
      {
        entity: {
          colors: ["#111111", "#222222"],
        },
        scales: {
          plottedKeys: ["fallback"],
        },
        dimensions: {
          plotLeft: 40,
          padding: { top: 16 },
        },
      },
    )

    const output = String(result.strings.join(""))

    expect(output).toContain("iw-chart-legend")

    const items = result.values.find(Array.isArray)
    expect(items).toHaveLength(2)
  })

  it("uses frame plotted keys when the component does not define them", () => {
    const result = renderLegend(
      { props: {} },
      {
        entity: {
          colors: ["#8884d8", "#82ca9d"],
        },
        scales: {
          plottedKeys: ["productA", "productB"],
        },
        dimensions: {
          plotLeft: 48,
          padding: { top: 20 },
        },
      },
    )

    const items = result.values.find(Array.isArray)

    expect(items).toHaveLength(2)
  })
})
