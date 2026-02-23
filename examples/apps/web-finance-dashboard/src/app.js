import { html, when } from "@inglorious/web"

export const app = {
  render(api) {
    const router = api.getEntity("router")

    return html`
      <div class="app">
        <header class="app-header">
          <h1>Inglorious Finance Dashboard</h1>
          <nav>
            <a href="/">Dashboard</a>
            <a href="/screener">Screener</a>
            <a href="/asset/AAPL">Asset Detail</a>
          </nav>
        </header>

        <main>
          ${when(
            router?.error,
            () => html`<p>Route not found: ${router.path}</p>`,
          )}
          ${when(router?.isLoading, () => html`<p>Loading route...</p>`)}
          ${when(router && !router.error && !router.isLoading, () =>
            api.render(router.route),
          )}
        </main>
      </div>
    `
  },
}
