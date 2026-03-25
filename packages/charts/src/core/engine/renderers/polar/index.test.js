import { describe, expect, it } from "vitest"

import { renderCenterText, renderPieSeries } from "./index.js"

function containsTemplateText(value, text) {
  if (!value) return false

  if (Array.isArray(value)) {
    return value.some((item) => containsTemplateText(item, text))
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value).includes(text)
  }

  if (Array.isArray(value.strings)) {
    if (String(value.strings.join("")).includes(text)) {
      return true
    }

    return (
      value.values?.some((item) => containsTemplateText(item, text)) || false
    )
  }

  return false
}

function createFrame() {
  return {
    entity: {
      dataKey: "value",
      nameKey: "name",
      isTooltipEnabled: true,
      colors: ["#2563eb", "#f97316"],
      centerText: "42%",
      data: [
        { name: "Revenue", value: 60 },
        { name: "Cost", value: 40 },
      ],
    },
    scales: {
      centerX: 160,
      centerY: 120,
      innerRadius: 40,
      outerRadius: 80,
    },
  }
}

describe("polar renderers", () => {
  it("renders pie slices and labels", () => {
    const result = renderPieSeries(
      {
        props: {
          label: true,
        },
      },
      createFrame(),
    )

    const slices = result.values.find(Array.isArray)

    expect(String(result.strings.join(""))).toContain("iw-chart-pie")
    expect(slices).toHaveLength(2)
    expect(containsTemplateText(result, "polyline")).toBe(true)
    expect(containsTemplateText(result, "60%")).toBe(true)
  })

  it("renders center text for donuts", () => {
    const result = renderCenterText(createFrame())

    expect(String(result.strings.join(""))).toContain('text-anchor="middle"')
    expect(result.values).toContain("42%")
  })
})
