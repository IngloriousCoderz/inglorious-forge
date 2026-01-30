/**
 * @vitest-environment jsdom
 */
import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { renderTooltip } from "./tooltip.js"

describe("renderTooltip", () => {
  const mockApi = {}

  it("should render tooltip when entity.tooltip is provided", () => {
    const entity = {
      id: "test",
      data: [{ name: "Jan", value: 100 }],
      tooltip: {
        label: "Jan",
        value: 100,
        color: "#3b82f6",
      },
      tooltipX: 100,
      tooltipY: 200,
    }

    const template = renderTooltip(entity, {}, mockApi)
    const container = document.createElement("div")
    render(template, container)

    const tooltip = container.querySelector(".iw-chart-modal")
    expect(tooltip).toBeTruthy()
    expect(tooltip.textContent).toContain("Jan")
    expect(tooltip.textContent).toContain("100")
  })

  it("should not render tooltip when entity.tooltip is null", () => {
    const entity = {
      id: "test",
      data: [{ name: "Jan", value: 100 }],
      tooltip: null,
      tooltipX: 100,
      tooltipY: 200,
    }

    const template = renderTooltip(entity, {}, mockApi)
    const container = document.createElement("div")
    render(template, container)

    const tooltip = container.querySelector(".iw-chart-modal")
    expect(tooltip).toBeNull()
  })

  it("should position tooltip at entity.tooltipX and entity.tooltipY", () => {
    const entity = {
      id: "test",
      data: [{ name: "Jan", value: 100 }],
      tooltip: {
        label: "Jan",
        value: 100,
      },
      tooltipX: 150,
      tooltipY: 250,
    }

    const template = renderTooltip(entity, {}, mockApi)
    const container = document.createElement("div")
    render(template, container)

    const tooltip = container.querySelector(".iw-chart-modal")
    expect(tooltip).toBeTruthy()
    expect(tooltip.style.left).toBe("150px")
    expect(tooltip.style.top).toBe("250px")
  })

  it("should render tooltip with formatted number", () => {
    const entity = {
      id: "test",
      data: [{ name: "Jan", value: 100 }],
      tooltip: {
        label: "Jan",
        value: 1234.56,
        color: "#3b82f6",
      },
      tooltipX: 100,
      tooltipY: 200,
    }

    const template = renderTooltip(entity, {}, mockApi)
    const container = document.createElement("div")
    render(template, container)

    const tooltip = container.querySelector(".iw-chart-modal")
    expect(tooltip).toBeTruthy()
    // formatNumber uses ",.2f" by default, so 1234.56 becomes "1,234.56"
    expect(tooltip.textContent).toContain("1,234.56")
  })
})
