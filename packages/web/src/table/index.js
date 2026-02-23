import * as handlers from "./handlers.js"
import * as helpers from "./helpers.js"
import * as renderers from "./template.js"

export const table = { ...handlers, ...renderers }

export const {
  getPaginationInfo,
  getRows,
  isSomeSelected,
  isAllSelected,
  getSortDirection,
  getTotalRows,
} = helpers
