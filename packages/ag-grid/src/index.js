import * as handlers from "./handlers.js"
export { configureAgGrid } from "./runtime-config.js"
import { render } from "./template.js"

/**
 * Thin AG Grid adapter type for Inglorious Web.
 * Compose app-specific behaviors on top of this base type.
 */
export const agGrid = {
  ...handlers,
  render,
}
