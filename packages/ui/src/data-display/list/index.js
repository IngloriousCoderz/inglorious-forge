import * as handlers from "./handlers.js"
import { list as renderers } from "./template.js"

export const list = { ...renderers, ...handlers }
