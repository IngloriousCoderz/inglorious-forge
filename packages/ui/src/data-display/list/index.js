import * as handlers from "./handlers.js"
import { List as renderers } from "./template.js"

export const List = { ...renderers, ...handlers }
