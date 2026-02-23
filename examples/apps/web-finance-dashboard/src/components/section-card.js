import { html } from "@inglorious/web"

export function renderSectionCard(title, content, className = "span-12") {
  return html`
    <section class="card ${className}">
      <h2>${title}</h2>
      ${content}
    </section>
  `
}
