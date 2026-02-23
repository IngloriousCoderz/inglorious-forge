import * as handlers from "./handlers.js"
import * as helpers from "./helpers.js"
import * as renderers from "./template.js"

export const select = { ...handlers, ...renderers }

export const {
  getOptionValue,
  isOptionSelected,
  formatOption,
  groupOptions,
  findOptionIndex,
  filterOptions,
  getOptionLabel,
} = helpers
