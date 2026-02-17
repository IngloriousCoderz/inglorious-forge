import * as handlers from "./handlers.js"
import { render } from "./template.js"

export const sharedDemo = { ...handlers, render }
