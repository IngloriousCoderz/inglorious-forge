import { html } from "@inglorious/web"

export const app = {
  render(api) {
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
          <button @click=${() => api.notify("#agGrid:addRow")}>
            Add Row
          </button>
          <button @click=${() => api.notify("#agGrid:toggleColumnSet")}>
            Toggle Column Set
          </button>
        </section>

        <main class="demo-main">${api.render("agGrid")}</main>
      </div>
    `
  },
}
