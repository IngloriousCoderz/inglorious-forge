import * as handlers from "./handlers.js"
import { render } from "./template.js"

export const playground = { ...handlers, render }
