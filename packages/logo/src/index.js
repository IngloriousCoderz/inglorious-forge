import { Logo as handlers } from "./handlers.js"
import * as renderers from "./template.js"

export const Logo = { ...handlers, ...renderers }

export { startInteraction, stopInteraction } from "./handlers.js"
