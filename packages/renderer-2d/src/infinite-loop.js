import { snap } from "@inglorious/utils/vectors.js"

export function infiniteLoop(render) {
  return (entity, ctx, api) => {
    const { image } = entity
    const { loop } = image || {}

    if (!loop) {
      render(entity, ctx, api)
      return
    }

    const [loopX, loopY, loopZ] = snap(loop)

    render(entity, ctx, api)

    ctx.save()
    ctx.translate(-loopX, -loopY - loopZ)
    render(entity, ctx, api)
    ctx.restore()
  }
}
