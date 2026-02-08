import { html, when } from "@inglorious/web"

export const app = {
  render(api) {
    const router = api.getEntity("router")

    return html`
      <div class="router">
        <nav>
          <ul>
            <li><a href="/">Home (type without entity)</a></li>
            <li><a href="/users">Users (type with entity)</a></li>
            <li>
              <a href="/posts">Posts (type with entity that loads data)</a>
            </li>
            <li><a href="/broken">Broken (catch-all route)</a></li>
            <li><a href="/lazy-type">Lazy Type</a></li>
            <li><a href="/lazy-entity">Lazy Entity</a></li>
            <li><a href="/lazy-data">Lazy Data</a></li>
            <li><a href="/admin">Admin Page (route guards)</a></li>
          </ul>
        </nav>

        <main>
          ${when(
            router.error,
            () => html`<div>Route not found: ${router.path}</div>`,
          )}
          ${when(router.isLoading, () => html`<div>Loading...</div>`)}
          ${when(!router.error && !router.isLoading, () =>
            api.render(router.route),
          )}
        </main>
      </div>
    `
  },
}
