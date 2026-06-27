import { html } from "@inglorious/web"

export const ssr = true

export const SsrStatic = {
  render(entity) {
    return html`<section>
      <h1>SSR static page</h1>
      <p>${entity.message}</p>
      <p>Generated at: ${entity.timestamp}</p>
      <a href="/">Back home</a>
    </section>`
  },
}

export async function load(entity) {
  entity.message = "Rendered on the server with static data"
  entity.timestamp = new Date().toISOString()
}
