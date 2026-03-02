import { html } from "@inglorious/web"

export function renderSectionCard(
  title,
  content,
  className = "span-12",
  headerExtra = null,
) {
  return html`
    <section class="card ${className}">
      <header class="card-header">
        <h2>${title}</h2>
        ${headerExtra}
      </header>
      ${content}
    </section>
  `
}
