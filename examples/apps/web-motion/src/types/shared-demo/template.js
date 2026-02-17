import { html } from "@inglorious/web"

export function render(entity, api) {
  return html`
    <section class="stack">
      <h2>Shared Layout (layoutId)</h2>
      <p>Switch view to transfer the hero pill between two components.</p>
      <button @click=${() => api.notify(`#${entity.id}:toggle`)}>
        ${entity.expanded ? "Show compact" : "Show expanded"}
      </button>

      <div class="shared-scene">
        ${entity.expanded
          ? html`
              <div class="shared-large">
                ${api.render("sharedHeroExpanded")}
              </div>
              <div class="shared-small shared-placeholder"></div>
            `
          : html`
              <div class="shared-small">${api.render("sharedHeroCompact")}</div>
              <div class="shared-large shared-placeholder"></div>
            `}
      </div>
    </section>
  `
}
