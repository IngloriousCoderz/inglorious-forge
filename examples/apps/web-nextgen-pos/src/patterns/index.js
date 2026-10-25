import { Chip } from "@inglorious/ui/chip"
import { html } from "@inglorious/web"

// A caption for each panel naming the patterns it is made of. See the README for where
// each of them lives in the code.
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
