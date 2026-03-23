import { html } from "@inglorious/web"
import { chart } from "@inglorious/charts"

export function renderDonutSection(api) {
  const inlineDonutDataA = [
    { name: "A", value: 20 },
    { name: "B", value: 35 },
    { name: "C", value: 15 },
  ]
  const inlineDonutDataB = [
    { name: "A", value: 10 },
    { name: "B", value: 25 },
    { name: "C", value: 40 },
  ]

  return html`
    <div class="charts-comparison">
      <section class="chart-section">
        <h2>Donut Chart - Config Style</h2>
        ${api.render("categoryDonutChart")}
      </section>

      <section class="chart-section">
        <h2>Donut Chart - Recharts Style (Composition with api.getEntity)</h2>
        ${chart.render(
          {
            entity: "categoryDonutChartComposition",
            width: 500,
            height: 400,
            centerText: "Total",
            children: [
              chart.Pie({
                dataKey: "value",
                nameKey: "name",
                cx: "50%",
                cy: "50%",
                outerRadius: 140,
                innerRadius: 84,
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
        <h2>Donut Chart - Composition (No id #1)</h2>
        ${chart.render(
          {
            type: "donut",
            data: inlineDonutDataA,
            width: 360,
            height: 280,
            showTooltip: true,
            centerText: "Total",
            children: [
              chart.Pie({
                dataKey: "value",
                nameKey: "name",
                cx: "50%",
                cy: "50%",
                outerRadius: 90,
                innerRadius: 54,
                label: true,
              }),
            ],
          },
          api,
        )}
      </section>

      <section class="chart-section">
        <h2>Donut Chart - Composition (No id #2)</h2>
        ${chart.render(
          {
            type: "donut",
            data: inlineDonutDataB,
            width: 360,
            height: 280,
            showTooltip: true,
            centerText: "Total",
            children: [
              chart.Pie({
                dataKey: "value",
                nameKey: "name",
                cx: "50%",
                cy: "50%",
                outerRadius: 90,
                innerRadius: 54,
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
