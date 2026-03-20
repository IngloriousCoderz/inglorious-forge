import { describe, expect, it } from "vitest"

import { renderTooltipOverlay } from "./tooltip.js"

describe("tooltip overlay renderer", () => {
  it("renders tooltip box when tooltipEnabled and tooltip state are present", () => {
    const result = renderTooltipOverlay(
      {},
      {
        entity: { tooltipEnabled: true },
        interactionEntity: {
          tooltip: {
            x: 10,
            y: 20,
            label: "Revenue",
            value: 123,
            color: "#ff0000",
          },
        },
      },
    )

    const output = String(result.strings.join(""))

    expect(output).toContain("iw-chart-modal")
    expect(result.values).toEqual(
      expect.arrayContaining(["Revenue", 123, "#ff0000"]),
    )
  })

  it("renders nothing when tooltipEnabled is false", () => {
    const result = renderTooltipOverlay(
      {},
      {
        entity: { tooltipEnabled: false },
        interactionEntity: {
          tooltip: {
            x: 10,
            y: 20,
            label: "Revenue",
            value: 123,
            color: "#ff0000",
          },
        },
      },
    )

    expect(result.strings).toEqual([""])
    expect(result.values).toEqual([])
  })
})
