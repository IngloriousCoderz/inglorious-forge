import { html } from "@inglorious/web"

export const app = {
  render(api) {
    return html`
      <div class="app">
        <header>
          <h1>Charts Examples</h1>
          <p>Examples of Line, Area, Bar, Pie, and Donut charts</p>
        </header>

        <main>
          <section class="chart-section">
            <h2>Line Chart - Simple</h2>
            ${api.render("salesLineChart")}
          </section>

          <section class="chart-section">
            <h2>Line Chart - Multiple Series</h2>
            ${api.render("multiSeriesLineChart")}
          </section>

          <section class="chart-section">
            <h2>Area Chart - Simple</h2>
            ${api.render("salesAreaChart")}
          </section>

          <section class="chart-section">
            <h2>Area Chart - Multiple Series</h2>
            ${api.render("multiSeriesAreaChart")}
          </section>

          <section class="chart-section">
            <h2>Bar Chart</h2>
            ${api.render("salesBarChart")}
          </section>

          <section class="chart-section">
            <h2>Pie Chart</h2>
            ${api.render("categoryPieChart")}
          </section>

          <section class="chart-section">
            <h2>Donut Chart</h2>
            ${api.render("categoryDonutChart")}
          </section>
        </main>
      </div>
    `
  },
}
