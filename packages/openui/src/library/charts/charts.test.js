import { afterEach, describe, expect, it, vi } from "vitest"

import { uiLibrary } from "../index.js"
import { setup } from "../test-helpers.js"
import { chartComponents } from "./index.js"

describe("Chart components", () => {
  afterEach(() => {
    vi.restoreAllMocks()
    document.body.replaceChildren()
  })

  it("draws charts from chartComponents", async () => {
    const library = uiLibrary.extend({ components: { add: chartComponents } })
    const { container } = await setup({
      library,
      response: `root = Stack([bars, pie])
bars = BarChart(["Jan", "Feb"], [Series("Sales", [10, 20]), Series("Costs", [5, 8])])
pie = PieChart(["Rent", "Food"], [900, 400], "donut")
`,
    })

    expect(container.querySelectorAll("svg")).not.toHaveLength(0)
    expect(container.innerHTML).toContain("Sales")
    expect(container.innerHTML).toContain("Rent")
  })

  it("draws the chart variants", async () => {
    const library = uiLibrary.extend({ components: { add: chartComponents } })
    const { container } = await setup({
      library,
      response: `root = Stack([bars, lines, area, pie])
bars = BarChart(["Jan", "Feb"], [Series("Online", [10, 20]), Series("Shop", [30, 20])], "stacked", "Month", "Sales")
lines = LineChart(["Jan", "Feb", "Mar"], [Series("Visits", [10, 30, 15])], "natural")
area = AreaChart(["Jan", "Feb"], [Series("Signups", [5, 9])])
pie = PieChart(["A", "B"], [1, 1], "pie", "semiCircular")
`,
    })

    expect(container.querySelectorAll("svg.iw-chart")).toHaveLength(4)
    expect(container.querySelectorAll(".iw-chart-axis-label")).toHaveLength(2)
    expect(container.querySelector(".iw-chart-area")).not.toBeNull()
  })

  it("draws the rest of OpenUI's charts", async () => {
    const library = uiLibrary.extend({ components: { add: chartComponents } })
    const { container } = await setup({
      library,
      response: `root = Stack([ranking, budget, spread, skills, goals])
ranking = HorizontalBarChart(["Rome", "Paris", "Oslo"], [Series("Votes", [30, 20, 10])], "grouped", "Votes")
budget = SingleStackedBarChart(["Rent", "Food", "Fun"], [900, 400, 100])
spread = ScatterChart([ScatterSeries("Cars", [Point(1200, 15), Point(1800, 11, 4)]), ScatterSeries("Vans", [Point(2500, 8)])], "Weight", "km/l")
skills = RadarChart(["Speed", "Power", "Range"], [Series("A", [8, 5, 7]), Series("B", [4, 9, 6])])
goals = RadialChart(["Move", "Exercise"], [80, 45])
`,
    })

    expect(container.querySelectorAll("svg.iw-chart")).toHaveLength(5)
    expect(container.querySelectorAll(".iw-chart-scatter circle")).toHaveLength(
      3,
    )
    expect(container.querySelectorAll(".iw-chart-radar")).toHaveLength(2)
    expect(container.querySelector(".iw-chart-radial")).not.toBeNull()
    // The single bar: its three parts and a legend naming them.
    const [, budget] = container.querySelectorAll("svg.iw-chart")
    expect(budget.querySelectorAll(".iw-chart-bar rect")).toHaveLength(3)
    expect(budget.querySelector(".iw-chart-legend").textContent).toContain(
      "Food",
    )
  })
})
