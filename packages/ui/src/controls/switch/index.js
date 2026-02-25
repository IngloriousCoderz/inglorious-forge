import { augmentType } from "@inglorious/store/types"

import { withRenderValidation } from "../../shared/withRenderValidation.js"
import * as renderers from "./template.js"

export const switchControl = augmentType([
  { ...renderers },
  withRenderValidation,
])
