import { choose, html } from "@inglorious/web"

import { rangeFilter } from "./range.js"
import { valueFilter } from "./value.js"

export const filters = {
  render(entity, column, api) {
    return html`${choose(
      column.filter.type,
      [
        ["range", () => rangeFilter.render(entity, column, api)],
        ["date", () => rangeFilter.render(entity, column, api)],
        ["time", () => rangeFilter.render(entity, column, api)],
        ["datetime", () => rangeFilter.render(entity, column, api)],
      ],
      () => valueFilter.render(entity, column, api),
    )}`
  },
}
