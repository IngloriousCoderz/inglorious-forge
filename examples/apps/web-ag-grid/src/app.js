import { html } from "@inglorious/web"

export const app = {
  render(api) {
    const grid = api.getEntity("agGrid")

    return html`
      <div class="app-shell">
        <header class="app-header">
          <h1>AG Grid Demo (Inglorious)</h1>
          <p>
            The app re-renders often, but the grid instance stays alive and only
            receives incremental updates.
          </p>
        </header>

        <section class="controls">
          <button @click=${() => api.notify("#agGrid:tick")}>
            Force App Re-render
          </button>
          <button @click=${() => api.notify("#agGrid:shuffleRows")}>
            Shuffle Rows
          </button>
          <button @click=${() => api.notify("#agGrid:bumpPrices")}>
            Bump Prices
          </button>
          <button @click=${() => api.notify("#agGrid:addRow")}>Add Row</button>
        </section>

        <main class="demo-main">
          <div class="iw-ag-grid-meta">
            <span><b>Entity:</b> ${grid.id}</span>
            <span><b>Render Tick:</b> ${grid.tickCount}</span>
            <span><b>Grid API ID:</b> ${grid.gridApiId ?? "pending"}</span>
            <span><b>Status:</b> ${grid.gridStatus}</span>
          </div>
          ${api.render("agGrid")}
        </main>
      </div>
    `
  },
}
