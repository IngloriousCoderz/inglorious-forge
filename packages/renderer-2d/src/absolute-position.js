import { snap, zero } from "@inglorious/utils/vectors"

export function absolutePosition(render) {
  return (entity, ctx, api) => {
    const { position = zero() } = entity
    const [x, y, z] = snap(position)

    const game = api.getEntity("game")
    const [, gameHeight] = game.size

    ctx.save()

    ctx.translate(x, gameHeight - y - z)
    render(entity, ctx, api)

    ctx.restore()
  }
}
