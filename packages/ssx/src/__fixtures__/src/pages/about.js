import { html } from "@inglorious/web"

import { nav } from "../components/nav.js"

export const about = {
  create(entity) {
    entity.name = "Us"
  },

  click(entity) {
    entity.name += "!"
  },

  render(entity, api) {
    return html`<h1>
        About
        <span @click=${() => api.notify(`#${entity.id}:click`)}
          >${entity.name}</span
        >
      </h1>
      ${nav.render()}`
  },
}

export const metadata = {
  title: "About",
  meta: {
    description: "About page",
  },
  styles: ["./style.css"],
  scripts: ["./ga.js"],
}
