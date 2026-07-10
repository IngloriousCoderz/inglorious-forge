import { html } from "@inglorious/web"

const KINDS = ["Button", "Checkbox", "Switch", "Slider", "Input"]

export const app = {
  render(api) {
    const board = api.getEntity("board")
    const { width, height } = api.getEntity("boardSize") ?? {}

    return html`<main class="iw-theme-bootstrap iw-theme-light">
      <div class="controls">
        ${KINDS.map(
          (kind) =>
            html`<button @click=${() => api.notify("#board:addChild", kind)}>
              ＋ ${kind}
            </button>`,
        )}
      </div>

      <div class="stage">
        <div id="board">
          ${board.children.map(
            (id) =>
              html`<div class="cell">
                <div class="element">${api.render(id)}</div>
                <button
                  class="close"
                  @click=${() => api.notify("#board:removeChild", id)}
                >
                  ×
                </button>
              </div>`,
          )}
        </div>

        <div class="readout">
          <h2>Board size</h2>
          <p class="size">${format(width)} × ${format(height)}</p>
          <p class="hint">Drag the board's corner, or add and remove elements.</p>
        </div>
      </div>
    </main>`
  },
}

function format(value) {
  return value == null ? "…" : Math.round(value)
}
