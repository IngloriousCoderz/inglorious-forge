import { CHARTS } from "@benchmarks/dashboard-shared"
import { html } from "@inglorious/web"

export const app = {
  render(api) {
    const { filter, sortBy } = api.getEntity("metrics")

    return html`
      <div class="dashboard">
        <div class="header">
          <div class="title">🚀 INGLORIOUS WEB BENCHMARK</div>
          ${api.render("metrics")}
        </div>

        <div class="controls">
          <input
            type="text"
            placeholder="Filter by name or status..."
            .value=${filter}
            @input=${(e) => api.notify("#metrics:setFilter", e.target.value)}
          />
          <select
            .value=${sortBy}
            @change=${(e) => api.notify("#metrics:setSort", e.target.value)}
          >
            <option value="id">Sort by ID</option>
            <option value="value">Sort by Value</option>
            <option value="progress">Sort by Progress</option>
          </select>
        </div>

        <div class="charts">
          ${Object.keys(CHARTS).map((chartId) => api.render(chartId))}
        </div>

        <div class="table-container">${api.render("table")}</div>

        <div class="info">
          Inglorious baseline benchmark using shared dashboard logic.
        </div>
      </div>
    `
  },
}
