import { logo as handlers } from "./handlers.js"
import { render } from "./template.js"

export const logo = { ...handlers, render }

export { startInteraction, stopInteraction } from "./handlers.js"
