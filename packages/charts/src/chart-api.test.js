import { render } from "@lit-labs/ssr"
import { collectResultSync } from "@lit-labs/ssr/lib/render-result.js"
import { describe, expect, it } from "vitest"

import {
  Bar,
  Brush,
  CartesianGrid,
  Chart,
  Line,
  Pie,
  Tooltip,
  XAxis,
  YAxis,
} from "./index.js"

// The rendered markup, without lit's hydration comments.
const toHtml = (template) =>
  collectResultSync(render(template))
    .replace(/<!--[^>]*-->/g, "")
    .replace(/\s+/g, " ")

const data = [
  { name: "Jan", value: 10 },
  { name: "Feb", value: 20 },
]

describe("charts public api", () => {
  it("exports the primitives as pure factories", () => {
    expect(Line({ dataKey: "value" })).toEqual({
      type: "line",
      props: { dataKey: "value" },
    })
    expect(XAxis({ dataKey: "name" })).toEqual({
      type: "x-axis",
      props: { dataKey: "name" },
    })
  })

  it("keeps only event handlers and render on Chart, for the store", () => {
    expect(Object.keys(Chart).sort()).toEqual([
      "brushChange",
      "create",
      "dataUpdate",
      "render",
      "sizeUpdate",
      "tooltipHide",
      "tooltipShow",
    ])
  })

  it("formats an entity's ticks with formatters its type's render passes", () => {
    const PercentLine = {
      ...Chart,
      render(entity, api) {
        return Chart.render(
          {
            ...entity,
            xTickFormatter: (month) => month.toUpperCase(),
            yTickFormatter: (value) => `${value}%`,
          },
          api,
        )
      },
    }

    const html = toHtml(PercentLine.render({ id: "chart", type: "line", data }))

    expect(html).toContain("JAN")
    expect(html).toContain("20%")
  })

  it("formats tooltips with a formatter passed by the render or the Tooltip", () => {
    const formatter = (value, name) => `${name}: ${value}%`
    const configured = toHtml(
      Chart.render({
        id: "chart",
        type: "line",
        data,
        tooltip: { index: 1, dataKey: "value" },
        hasTooltip: true,
        tooltipFormatter: formatter,
      }),
    )
    const composed = toHtml(
      Chart.render({
        data,
        children: [
          XAxis({ dataKey: "name" }),
          Line({ dataKey: "value" }),
          Tooltip({ formatter }),
        ],
      }),
    )

    expect(configured).toContain("value: 20%")
    expect(composed).toContain("value: 20%")
  })

  it("formats a pie slice's value and keeps its percentage", () => {
    const html = toHtml(
      Chart.render({
        type: "pie",
        data: [
          { label: "A", value: 1 },
          { label: "B", value: 3 },
        ],
        hasTooltip: true,
        tooltipFormatter: (value) => `€${value}`,
      }),
    )

    expect(html).toContain("B: €3 (75%)")
  })

  it("renders a composition", () => {
    const html = toHtml(
      Chart.render({
        data,
        width: 800,
        height: 400,
        children: [
          CartesianGrid(),
          XAxis({ dataKey: "name" }),
          YAxis(),
          Line({ dataKey: "value" }),
        ],
      }),
    )

    expect(html).toContain('<svg class="iw-chart"')
    expect(html).toContain("iw-chart-line")
    expect(html).not.toContain("NaN")
  })

  it("renders an entity as configured", () => {
    const html = toHtml(
      Chart.render({ id: "sales", type: "Line", data, hasGrid: true }),
    )

    expect(html).toContain("iw-chart-grid")
    expect(html).toContain("iw-chart-line")
  })

  it("names the chart with ariaLabel, or after its type", () => {
    const children = [Line({ dataKey: "value" })]

    expect(
      toHtml(Chart.render({ ariaLabel: "Sales in 2026", data, children })),
    ).toContain('aria-label="Sales in 2026"')
    expect(toHtml(Chart.render({ data, children }))).toContain(
      'aria-label="line chart"',
    )
  })

  it("formats axis ticks with tickFormatter", () => {
    const html = toHtml(
      Chart.render({
        data,
        children: [
          XAxis({
            dataKey: "name",
            tickFormatter: (name) => name.toUpperCase(),
          }),
          YAxis({ tickFormatter: (value) => `${value}%` }),
          Line({ dataKey: "value" }),
        ],
      }),
    )

    expect(html).toContain("JAN")
    expect(html).toContain("20%")
  })

  it("keeps many bars within their categories, without overlapping", () => {
    const rows = Array.from({ length: 100 }, (_, index) => ({
      name: `${index}`,
      value: index,
    }))
    const html = toHtml(
      Chart.render({ type: "Bar", width: 400, height: 300, data: rows }),
    )
    const bars = [
      ...html.matchAll(/<rect x="([\d.]+)" y="[\d.]+" width="([\d.]+)"/g),
    ].map(([, x, width]) => ({ x: Number(x), width: Number(width) }))

    expect(bars).toHaveLength(100)
    bars.slice(1).forEach((bar, index) => {
      const previous = bars[index]
      expect(bar.x).toBeGreaterThanOrEqual(previous.x + previous.width)
    })
  })

  it("draws theme colors from CSS custom properties", () => {
    const html = toHtml(
      Chart.render({ data, children: [YAxis(), Line({ dataKey: "value" })] }),
    )

    expect(html).toContain("var(--iw-chart-axis, #cbd5e1)")
    expect(html).toContain("var(--iw-chart-text-muted, #64748b)")
  })
})

describe("chart state", () => {
  it("does not write to the entity it renders", () => {
    const entity = Object.freeze({
      id: "sales",
      type: "Line",
      data: Object.freeze(data.map((row) => Object.freeze(row))),
      brush: Object.freeze({ enabled: true, startIndex: 0, endIndex: 1 }),
    })
    const api = { notify() {}, getEntity: () => entity }

    expect(() => toHtml(Chart.render(entity, api))).not.toThrow()
    expect(() =>
      toHtml(
        Chart.render(
          {
            entity: "sales",
            children: [Line({ dataKey: "value" }), Brush()],
          },
          api,
        ),
      ),
    ).not.toThrow()
  })

  it("requires an entity for a brush, which keeps its state", () => {
    expect(() =>
      Chart.render({ data, children: [Line({ dataKey: "value" }), Brush()] }),
    ).toThrow(/needs an entity/)
  })

  it("falls back to native tooltips without an entity", () => {
    const html = toHtml(
      Chart.render({
        data,
        children: [Line({ dataKey: "value" }), Tooltip()],
      }),
    )

    expect(html).toContain("<title>Jan: 10</title>")
  })

  it("draws the hovered datum's tooltip from the entity's state", () => {
    const entity = {
      id: "sales",
      type: "Line",
      data,
      hasTooltip: true,
      tooltip: { index: 1, dataKey: "value" },
    }
    const api = { notify() {}, getEntity: () => entity }

    const html = toHtml(Chart.render(entity, api))

    expect(html).toContain("iw-chart-tooltip")
    expect(html).toContain("Feb")
    expect(html).not.toContain("<title>")
  })

  it("shows a pie slice's value and share in its tooltip", () => {
    const entity = {
      id: "fruit",
      type: "Pie",
      dataKey: "amount",
      nameKey: "fruit",
      data: [
        { fruit: "Apples", amount: 3 },
        { fruit: "Pears", amount: 1 },
      ],
      hasTooltip: true,
      tooltip: { index: 0 },
    }
    const api = { notify() {}, getEntity: () => entity }

    const html = toHtml(
      Chart.render({ entity: "fruit", children: [Pie(), Tooltip()] }, api),
    )

    expect(html).toContain("Apples")
    expect(html).toContain("3 (75%)")
  })

  describe("stacking, curves, axis titles and angles", () => {
    const sales = [
      { name: "Jan", online: 10, shop: 30 },
      { name: "Feb", online: 20, shop: 20 },
    ]

    // Every bar's top and bottom edge, in drawing order.
    const barEdges = (html) =>
      [
        ...html.matchAll(
          /<rect x="([\d.-]+)" y="([\d.-]+)" width="[\d.]+" height="([\d.]+)"/g,
        ),
      ].map(([, x, y, height]) => ({
        x: Number(x),
        top: Number(y),
        bottom: Number(y) + Number(height),
      }))

    it("stacks bars sharing a stackId in one place", () => {
      const html = toHtml(
        Chart.render({
          data: sales,
          children: [
            XAxis({ dataKey: "name" }),
            YAxis(),
            Bar({ dataKey: "online", stackId: "a" }),
            Bar({ dataKey: "shop", stackId: "a" }),
          ],
        }),
      )

      const [janOnline, , janShop] = barEdges(html)
      expect(janShop.x).toBe(janOnline.x)
      expect(janShop.bottom).toBeCloseTo(janOnline.top)
    })

    it("stacks bars in config mode with isStacked", () => {
      const stacked = barEdges(
        toHtml(Chart.render({ type: "bar", data: sales, isStacked: true })),
      )
      const grouped = barEdges(
        toHtml(Chart.render({ type: "bar", data: sales })),
      )

      expect(new Set(stacked.map((bar) => bar.x)).size).toBe(2)
      expect(new Set(grouped.map((bar) => bar.x)).size).toBe(4)
    })

    it("draws a line along the curve it names", () => {
      // A curve needs three points: through two, every curve is straight.
      const points = [
        { name: "Jan", value: 10 },
        { name: "Feb", value: 30 },
        { name: "Mar", value: 15 },
      ]
      const path = (curve) =>
        toHtml(
          Chart.render({ type: "line", data: points, curve, hasDots: false }),
        ).match(/<path d="([^"]+)" fill="none"/)[1]

      expect(path("linear")).not.toContain("C")
      expect(path("natural")).toContain("C")
      expect(path("step")).not.toBe(path("linear"))
    })

    it("titles its axes", () => {
      const html = toHtml(
        Chart.render({
          type: "bar",
          data: sales,
          xAxisLabel: "Month",
          yAxisLabel: "Sales",
        }),
      )

      expect(html).toContain("Month")
      expect(html).toContain("Sales")
      expect(html.match(/iw-chart-axis-label/g)).toHaveLength(2)
    })

    it("draws a pie between the angles it is given", () => {
      const half = toHtml(
        Chart.render({
          type: "pie",
          data: [
            { label: "A", value: 1 },
            { label: "B", value: 1 },
          ],
          startAngle: -90,
          endAngle: 90,
        }),
      )
      const full = toHtml(
        Chart.render({
          type: "pie",
          data: [
            { label: "A", value: 1 },
            { label: "B", value: 1 },
          ],
        }),
      )

      expect(half).not.toBe(full)
      // The first slice of the top half starts at nine o'clock.
      expect(half).toMatch(/<path d="M-[\d.]+,0A/)
    })
  })

  describe("pie legend", () => {
    const slices = [
      { label: "Rent", value: 900 },
      { label: "Food", value: 380 },
      { label: "Fun", value: 120 },
    ]
    const legendLabels = (html) =>
      [...html.matchAll(/font-size="12"\s*>([^<]+)<\/text>/g)].map(
        ([, label]) => label,
      )

    it("names every slice in its legend, in place of slice labels", () => {
      const html = toHtml(
        Chart.render({ type: "pie", data: slices, hasLegend: true }),
      )

      expect(html).toContain("iw-chart-legend")
      expect(legendLabels(html)).toEqual(["Rent", "Food", "Fun"])
      expect(html).not.toContain("<polyline")
    })

    it("keeps slice labels when asked for both", () => {
      const html = toHtml(
        Chart.render({
          type: "donut",
          data: slices,
          hasLegend: true,
          hasLabel: true,
        }),
      )

      expect(html).toContain("iw-chart-legend")
      expect(html).toContain("<polyline")
    })

    it("has no legend unless asked", () => {
      const html = toHtml(Chart.render({ type: "pie", data: slices }))

      expect(html).not.toContain("iw-chart-legend")
      expect(html).toContain("<polyline")
    })

    it("draws the pie under its legend", () => {
      const center = (html) =>
        Number(
          html.match(
            /class="iw-chart-pie"\s+transform="translate\([\d.]+, ([\d.]+)\)/,
          )[1],
        )
      const options = { type: "pie", data: slices, height: 400 }

      expect(center(toHtml(Chart.render(options)))).toBe(200)
      expect(
        center(toHtml(Chart.render({ ...options, hasLegend: true }))),
      ).toBeGreaterThan(200)
    })

    it("wraps a legend too wide for one row", () => {
      const many = Array.from({ length: 8 }, (_, index) => ({
        label: `Slice ${index}`,
        value: 1,
      }))
      const html = toHtml(
        Chart.render({ type: "pie", data: many, width: 400, hasLegend: true }),
      )
      const rows = new Set(
        [...html.matchAll(/translate\([\d.]+, ([\d.]+)\)">\s*<circle/g)].map(
          ([, y]) => y,
        ),
      )

      expect(rows.size).toBeGreaterThan(1)
    })
  })
})
