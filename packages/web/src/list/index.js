import * as handlers from "./handlers.js"
import * as renderers from "./template.js"

export const list = { ...handlers, ...renderers }
