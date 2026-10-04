import { clampToBounds } from "@inglorious/engine/physics/bounds.js"
import { extend, merge } from "@inglorious/utils/objects"

const DEFAULT_PARAMS = {
  collisionGroup: "bounds",
  depthAxis: "y",
}

export function clamped(params) {
  params = extend(DEFAULT_PARAMS, params)

  return (type) => ({
    create(entity, payload, api) {
      type.create?.(entity, payload, api)

      entity.collisions ??= {}
      entity.collisions[params.collisionGroup] ??= {}
      entity.collisions[params.collisionGroup].shape ??= "rectangle"
    },

    update(entity, dt, api) {
      type.update?.(entity, dt, api)

      const game = api.getEntity("game")
      merge(entity, {
        position: clampToBounds(
          entity,
          game.size,
          params.collisionGroup,
          params.depthAxis,
        ),
      })
    },
  })
}
