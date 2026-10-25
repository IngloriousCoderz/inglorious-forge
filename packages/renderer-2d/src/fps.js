import { renderText } from "./text.js"

const ONE_SECOND = 1

export function renderFps(entity, ctx) {
  const { value, accuracy } = entity.dt

  renderText(
    {
      ...entity,
      value: `FPS: ${(ONE_SECOND / value).toFixed(accuracy)}`,
    },
    ctx,
  )
}
