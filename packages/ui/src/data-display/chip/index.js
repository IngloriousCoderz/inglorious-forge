import { withRenderValidation } from "../../shared/withRenderValidation.js"
import * as renderers from "./template.js"

export const chipPrimitive = { ...renderers }
export const chip = [chipPrimitive, withRenderValidation]
