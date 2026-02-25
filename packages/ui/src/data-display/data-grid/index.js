import { augmentType } from "@inglorious/store/types"

import { withRenderValidation } from "../../shared/withRenderValidation.js"
import * as handlers from "./handlers.js"
import * as helpers from "./helpers.js"
import * as renderers from "./template.js"

export const dataGrid = augmentType([
  { ...handlers, ...renderers },
  withRenderValidation,
])

export const {
  getPaginationInfo,
  getRows,
  isSomeSelected,
  isAllSelected,
  getSortDirection,
  getTotalRows,
} = helpers
