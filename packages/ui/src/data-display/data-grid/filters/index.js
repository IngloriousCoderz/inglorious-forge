import { choose, html } from "@inglorious/web"

import { inputFilter } from "./input.js"
import { rangeFilter } from "./range.js"
import { selectFilter } from "./select.js"

export const filters = {
  render(entity, column, api) {
    return html`${choose(
      column.filter.type,
      [
        ["range", () => rangeFilter.render(entity, column, api)],
        ["date", () => rangeFilter.render(entity, column, api)],
        ["time", () => rangeFilter.render(entity, column, api)],
        ["datetime", () => rangeFilter.render(entity, column, api)],
        ["select", () => selectFilter.render(entity, column, api)],
      ],
      () => inputFilter.render(entity, column, api),
    )}`
  },
}
