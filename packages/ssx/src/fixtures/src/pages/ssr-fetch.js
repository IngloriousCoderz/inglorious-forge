import { html } from "@inglorious/web"

export const ssr = true

export const SsrFetch = {
  render(entity) {
    return html`<section>
      <h1>${entity.title}</h1>
      <p>${entity.body}</p>
      <a href="/">Back home</a>
    </section>`
  },
}

export async function load(entity) {
  const data = await getGreeting()
  entity.title = data.title
  entity.body = data.body
}

async function getGreeting() {
  await new Promise((resolve) => setTimeout(resolve, 120))
  return {
    title: "SSR fetch page",
    body: "This content came from a fake backend during render.",
  }
}
