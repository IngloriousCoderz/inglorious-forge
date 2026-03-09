import { beforeEach, describe, expect, it, vi } from "vitest"

beforeEach(() => {
  vi.resetModules()
})

describe("createChartInstance legacy adapter", () => {
  it("warns once per render method when legacy signature is used", async () => {
    const warnSpy = vi
      .spyOn(globalThis.console, "warn")
      .mockImplementation(() => {})

    const { createChartInstance } = await import("./create-chart-instance.js")

    const renderLineChart = vi.fn(() => "ok")
    const api = {
      getType: () => ({ renderLineChart }),
    }
    const entity = {
      id: "line-1",
      type: "line",
      data: [{ name: "A", value: 10 }],
    }

    const instance = createChartInstance(entity, api)

    instance.renderLineChart([], { width: 400 })
    instance.renderLineChart([], { width: 500 })

    const chartsWarnings = warnSpy.mock.calls
      .map(([message]) => message)
      .filter(
        (message) =>
          typeof message === "string" &&
          message.includes("[charts]") &&
          message.includes("is deprecated"),
      )

    expect(chartsWarnings).toHaveLength(1)
    expect(chartsWarnings[0]).toContain(
      "renderLineChart(children, config) is deprecated",
    )
    expect(renderLineChart).toHaveBeenCalledTimes(2)

    warnSpy.mockRestore()
  })

  it("does not warn when standard signature is used", async () => {
    const warnSpy = vi
      .spyOn(globalThis.console, "warn")
      .mockImplementation(() => {})

    const { createChartInstance } = await import("./create-chart-instance.js")

    const renderLineChart = vi.fn(() => "ok")
    const api = {
      getType: () => ({ renderLineChart }),
    }
    const entity = {
      id: "line-2",
      type: "line",
      data: [{ name: "A", value: 10 }],
    }

    const instance = createChartInstance(entity, api)
    instance.LineChart({ width: 640 }, [])

    const chartsWarnings = warnSpy.mock.calls
      .map(([message]) => message)
      .filter(
        (message) =>
          typeof message === "string" &&
          message.includes("[charts]") &&
          message.includes("is deprecated"),
      )

    expect(chartsWarnings).toHaveLength(0)
    expect(renderLineChart).toHaveBeenCalledTimes(1)

    warnSpy.mockRestore()
  })

  it("accepts renderLineChart(children) without warning", async () => {
    const warnSpy = vi
      .spyOn(globalThis.console, "warn")
      .mockImplementation(() => {})

    const { createChartInstance } = await import("./create-chart-instance.js")

    const renderLineChart = vi.fn(() => "ok")
    const api = {
      getType: () => ({ renderLineChart }),
    }
    const entity = {
      id: "line-3",
      type: "line",
      data: [{ name: "A", value: 10 }],
    }

    const instance = createChartInstance(entity, api)
    const children = [{ type: "Line", config: { dataKey: "value" } }]
    instance.renderLineChart(children)

    const chartsWarnings = warnSpy.mock.calls
      .map(([message]) => message)
      .filter(
        (message) =>
          typeof message === "string" &&
          message.includes("[charts]") &&
          message.includes("is deprecated"),
      )

    expect(chartsWarnings).toHaveLength(0)
    expect(renderLineChart).toHaveBeenCalledTimes(1)
    expect(renderLineChart.mock.calls[0][1].children).toEqual(children)
    expect(renderLineChart.mock.calls[0][1].config).toMatchObject({
      data: entity.data,
      dataKeys: [],
    })

    warnSpy.mockRestore()
  })
})
