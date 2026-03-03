import { choose, html } from "@inglorious/web"

import { inputFilter } from "./input.js"
import { rangeFilter } from "./range.js"
import { selectFilter } from "./select.js"

export const filters = {
  render(entity, column) {
    return html`${choose(
      column.filter.type,
      [
        ["range", () => rangeFilter.render(entity, column)],
        ["date", () => rangeFilter.render(entity, column)],
        ["time", () => rangeFilter.render(entity, column)],
        ["datetime", () => rangeFilter.render(entity, column)],
        ["select", () => selectFilter.render(entity, column)],
      ],
      () => inputFilter.render(entity, column),
    )}`
  },
}
