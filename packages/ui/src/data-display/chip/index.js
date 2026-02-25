import { augmentType } from "@inglorious/store/types"

import { withRenderValidation } from "../../shared/withRenderValidation.js"
import * as renderers from "./template.js"

export const chipPrimitive = { ...renderers }
export const chip = augmentType([chipPrimitive, withRenderValidation])
