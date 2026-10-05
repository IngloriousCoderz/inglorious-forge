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

      // Resolved the same way the detection resolves it, so that a `solid` entity with
      // no declared block still shows the box it is really using, and an entity with
      // neither shows nothing rather than throwing.
      Object.values(entity.collisions ?? {})
        .concat([collisionGroupOf(entity, DEFAULT_GROUP)])
        .filter(Boolean)
        // Resolving the default group hands back the very object a declared block
        // already gave, so keeping the first of each is what stops it being drawn twice.
        .filter((collision, index, all) => all.indexOf(collision) === index)
        .forEach((collision) => {
          const render = params.shapes[collision.shape]
          render?.({ ...entity, ...collision, color: GREEN }, ctx, api)
        })

      ctx.restore()
    },
  })
}
