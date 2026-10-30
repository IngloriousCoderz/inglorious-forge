import { Chip } from "@inglorious/ui/chip"
import { html } from "@inglorious/web"

export function renderPatterns(patterns) {
  return html`<div class="patterns">
    ${patterns.map((pattern) =>
      Chip.render({
        children: pattern,
        size: "sm",
        shape: "pill",
        color: "info",
      }),
    )}
  </div>`
}
