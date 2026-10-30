import { renderRectangle } from "./shapes/rectangle.js"

export function renderCamera(entity, ctx, api) {
  const { devMode } = api.getEntity("game")

  if (devMode) {
    renderRectangle(entity, ctx)
  }
}
