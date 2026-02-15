import { html } from "@inglorious/web"

import { CHARTS } from "@/charts"

export const app = {
  render(api) {
    const { filter, sortBy } = api.getEntity("metrics")

    return html`
      <div class="dashboard">
        <div class="header">
          <div class="title">🚀 INGLORIOUS WEB (OPTIMIZED) BENCHMARK</div>
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

        <div class="charts">${Object.keys(CHARTS).map(api.render)}</div>

        <div class="table-container">${api.render("table")}</div>

        <div class="info">
          🎯 INGLORIOUS IMPLEMENTATION with memoized selectors. No real
          performance gain compared to the basic example, since the hard work is
          on the DOM.
        </div>
      </div>
    `
  },
}
