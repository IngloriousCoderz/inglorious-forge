import { html } from "@inglorious/web"
import { chart } from "@inglorious/charts"

export function renderPieSection(api) {
  const inlinePieDataA = [
    { name: "A", value: 20 },
    { name: "B", value: 35 },
    { name: "C", value: 15 },
  ]
  const inlinePieDataB = [
    { name: "A", value: 10 },
    { name: "B", value: 25 },
    { name: "C", value: 40 },
  ]

  return html`
    <div class="charts-comparison">
      <section class="chart-section">
        <h2>Pie Chart - Config Style</h2>
        ${api.render("categoryPieChart")}
      </section>

      <section class="chart-section">
        <h2>Pie Chart - Recharts Style (Composition with api.getEntity)</h2>
        ${chart.render(
          {
            entity: "categoryPieChartComposition",
            width: 500,
            height: 400,
            children: [
              chart.Pie({
                dataKey: "value",
                nameKey: "name",
                cx: "50%",
                cy: "50%",
                outerRadius: 140,
                label: true,
              }),
            ],
          },
          api,
        )}
      </section>
    </div>

    <div class="charts-comparison">
      <section class="chart-section">
        <h2>Pie Chart - Composition (No id #1)</h2>
        ${chart.render(
          {
            type: "pie",
            data: inlinePieDataA,
            width: 360,
            height: 280,
            hasTooltip: true,
            children: [
              chart.Pie({
                dataKey: "value",
                nameKey: "name",
                cx: "50%",
                cy: "50%",
                outerRadius: 90,
                label: true,
              }),
            ],
          },
          api,
        )}
      </section>

      <section class="chart-section">
        <h2>Pie Chart - Composition (No id #2)</h2>
        ${chart.render(
          {
            type: "pie",
            data: inlinePieDataB,
            width: 360,
            height: 280,
            hasTooltip: true,
            children: [
              chart.Pie({
                dataKey: "value",
                nameKey: "name",
                cx: "50%",
                cy: "50%",
                outerRadius: 90,
                label: true,
              }),
            ],
          },
          api,
        )}
      </section>
    </div>
  `
}
