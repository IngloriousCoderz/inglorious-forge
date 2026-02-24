import { withRenderValidation } from "../../shared/withRenderValidation.js"
import * as handlers from "./handlers.js"
import * as helpers from "./helpers.js"
import * as renderers from "./template.js"

export const selectPrimitive = { ...handlers, ...renderers }
export const select = [selectPrimitive, withRenderValidation]

export const {
  filterOptions,
  formatOption,
  getOptionLabel,
  getOptionValue,
  isOptionSelected,
} = helpers
