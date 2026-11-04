import { handlers } from "./handlers.js"
import { template } from "./template.js"

export const Logo = { ...handlers, ...template }

export { startInteraction, stopInteraction } from "./handlers.js"
