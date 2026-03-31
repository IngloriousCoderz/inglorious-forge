import { rendering } from "./rendering-behavior"
import { renderingSystem } from "./rendering-system"

export function createRenderer(canvas) {
  return {
    types: { Renderer: [rendering(canvas)] },
    entities: { renderer: { type: "Renderer" } },
    systems: [renderingSystem(canvas)],
  }
}
