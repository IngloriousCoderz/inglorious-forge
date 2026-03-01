import * as handlers from "./handlers.js"
import * as helpers from "./helpers.js"
import { dataGrid as renderers } from "./template.js"

export const dataGrid = { ...handlers, ...renderers }

export const {
  getPaginationInfo,
  getRows,
  isSomeSelected,
  isAllSelected,
  getSortDirection,
  getTotalRows,
} = helpers
