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
    const lineChild = () => null
    lineChild.dataKey = "value"
    const children = [lineChild]
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
      dataKeys: ["value"],
    })

    warnSpy.mockRestore()
  })

  it("normalizes invalid config fields in dev mode", async () => {
    const { createChartInstance } = await import("./create-chart-instance.js")

    const renderLineChart = vi.fn(() => "ok")
    const api = {
      getType: () => ({ renderLineChart }),
    }
    const entity = {
      id: "line-4",
      type: "line",
      data: [{ name: "A", value: 10 }],
    }

    const instance = createChartInstance(entity, api)
    const lineChild = () => null
    lineChild.dataKey = "value"
    const children = [lineChild]

    instance.LineChart({ data: "invalid", dataKeys: "invalid" }, children)

    expect(renderLineChart).toHaveBeenCalledTimes(1)
    expect(renderLineChart.mock.calls[0][1].config.data).toEqual(entity.data)
    expect(renderLineChart.mock.calls[0][1].config.dataKeys).toEqual(["value"])
  })

  it("accepts non-object config and null children with safe fallback", async () => {
    const { createChartInstance } = await import("./create-chart-instance.js")

    const renderLineChart = vi.fn(() => "ok")
    const api = {
      getType: () => ({ renderLineChart }),
    }
    const entity = {
      id: "line-5",
      type: "line",
      data: [{ name: "A", value: 10 }],
    }

    const instance = createChartInstance(entity, api)
    instance.LineChart("invalid", null)

    expect(renderLineChart).toHaveBeenCalledTimes(1)
    expect(renderLineChart.mock.calls[0][1]).toMatchObject({
      children: [],
      config: { data: entity.data, dataKeys: [] },
    })
  })
})
