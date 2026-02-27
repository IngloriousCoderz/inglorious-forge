import { augmentType } from "@inglorious/store/types"

import { withRenderValidation } from "../../shared/withRenderValidation.js"
import * as handlers from "./handlers.js"
import * as renderers from "./template.js"

export const input = augmentType([
  { ...handlers, ...renderers },
  withRenderValidation,
])
