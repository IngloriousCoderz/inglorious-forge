import { rendering } from "./rendering-behavior.js"
import { renderingSystem } from "./rendering-system.js"

export function createRenderer(canvas) {
  return {
    types: { Renderer: [rendering(canvas)] },
    entities: { renderer: { type: "Renderer" } },
    systems: [renderingSystem(canvas)],
  }
}
