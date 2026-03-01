import * as handlers from "./handlers.js"
import * as helpers from "./helpers.js"
import { combobox as renderers } from "./template.js"

export const combobox = { ...handlers, ...renderers }

export const {
  filterOptions,
  formatOption,
  getOptionLabel,
  getOptionValue,
  isOptionSelected,
} = helpers
