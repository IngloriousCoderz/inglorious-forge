import { withRenderValidation } from "../../shared/withRenderValidation.js"
import * as renderers from "./template.js"

export const button = [{ ...renderers }, withRenderValidation]
