import { choose, html } from "@inglorious/web"

import { InputFilter } from "./input.js"
import { RangeFilter } from "./range.js"
import { SelectFilter } from "./select.js"

export const Filters = {
  render(entity, column) {
    return html`${choose(
      column.filter.type,
      [
        ["range", () => RangeFilter.render(entity, column)],
        ["date", () => RangeFilter.render(entity, column)],
        ["time", () => RangeFilter.render(entity, column)],
        ["datetime", () => RangeFilter.render(entity, column)],
        ["select", () => SelectFilter.render(entity, column)],
      ],
      () => InputFilter.render(entity, column),
    )}`
  },
}
