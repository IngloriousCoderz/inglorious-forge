import { describe, expect, it, vi } from "vitest"

import { createFrameFromEntity } from "../../../standardizer/index.js"
import { getTooltipBindings } from "../cartesian/shared.js"
import { renderTooltip } from "./tooltip.js"

const data = [
  { name: "Jan", value: 10 },
  { name: "Feb", value: 20 },
]

function createFrame(entity, api = { notify: vi.fn() }) {
  return createFrameFromEntity(
    { id: "sales", type: "Line", width: 400, height: 200, data, ...entity },
    api,
  )
}

describe("tooltip", () => {
  it("dispatches tooltipShow and tooltipHide to the chart's entity", () => {
    const api = { notify: vi.fn() }
    const frame = createFrame({ hasTooltip: true }, api)
    const line = frame.primitives.find((item) => item.type === "line")

    const tooltip = getTooltipBindings(
      frame,
      line,
      { index: 1, dataKey: "value" },
      { label: "Feb", value: "20" },
    )
    tooltip.onEnter()
    tooltip.onLeave()

    expect(api.notify.mock.calls).toEqual([
      ["#sales:tooltipShow", { index: 1, dataKey: "value" }],
      ["#sales:tooltipHide"],
    ])
  })

  it("has no bindings when the tooltip is off", () => {
    const frame = createFrame({ hasTooltip: false })
    const line = frame.primitives.find((item) => item.type === "line")

    expect(
      getTooltipBindings(frame, line, { index: 0 }, { label: "", value: "" }),
    ).toEqual({ title: "" })
  })

  it("draws nothing until a datum is hovered", () => {
    expect(renderTooltip(createFrame({ hasTooltip: true }))).toBe("")
  })

  it("draws nothing for a datum that is gone", () => {
    const frame = createFrame({
      hasTooltip: true,
      tooltip: { index: 5, dataKey: "value" },
    })

    expect(renderTooltip(frame)).toBe("")
  })

  it("stays inside the chart near its right edge", () => {
    const frame = createFrame({
      hasTooltip: true,
      tooltip: { index: 1, dataKey: "value" },
    })

    const [x, , width] = renderTooltip(frame).values

    expect(x).toBeGreaterThanOrEqual(0)
    expect(x + width).toBeLessThanOrEqual(frame.dimensions.width)
  })
})
