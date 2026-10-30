import { collisionGroupOf } from "../../collision/detection.js"

const DEFAULT_GROUP = "hitbox"
const GREEN = "#00FF00"

export function collisionGizmos(params) {
  return (type) => ({
    render(entity, ctx, api) {
      type.render(entity, ctx, api)

      const game = api.getEntity("game")

      if (!game.debug) {
        return
      }

      if (!params?.shapes) {
        return
      }

      ctx.save()

      Object.values(entity.collisions ?? {})
        .concat([collisionGroupOf(entity, DEFAULT_GROUP)])
        .filter(Boolean)
        .filter((collision, index, all) => all.indexOf(collision) === index)
        .forEach((collision) => {
          const render = params.shapes[collision.shape]
          render?.({ ...entity, ...collision, color: GREEN }, ctx, api)
        })

      ctx.restore()
    },
  })
}
