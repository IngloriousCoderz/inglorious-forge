import { html } from "@inglorious/web"

const messages = {
  en: "Hello world!",
  it: "Ciao mondo!",
  pt: "Olá mundo!",
}
export const hello = {
  render(entity) {
    return html`<h1>${messages[entity.locale] ?? messages.en}</h1>
      <a href="/hello">en</a> | <a href="/it/hello">it</a> |
      <a href="/pt/hello">pt</a>`
  },
}
