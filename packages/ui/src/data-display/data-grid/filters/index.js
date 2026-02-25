import { choose, html } from "@inglorious/web"

import { dateFilter } from "./date.js"
import { numberFilter } from "./number.js"
import { rangeFilter } from "./range.js"
import { selectFilter } from "./select.js"
import { textFilter } from "./text.js"

export const filters = {
  render(entity, column, api) {
    return html`${choose(
      column.filter.type,
      [
        ["number", () => numberFilter.render(entity, column, api)],
        ["range", () => rangeFilter.render(entity, column, api)],
        ["select", () => selectFilter.render(entity, column, api)],
        ["date", () => dateFilter.render(entity, column, api)],
        ["time", () => dateFilter.render(entity, column, api)],
        ["datetime", () => dateFilter.render(entity, column, api)],
      ],
      () => textFilter.render(entity, column, api),
    )}`
  },
}
