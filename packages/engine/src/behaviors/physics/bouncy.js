import { defaults, extend } from "@inglorious/utils/objects"
import { jump } from "@inglorious/utils/physics/jump.js"

const DEFAULT_PARAMS = {
  bounciness: 1,
}

export function bouncy(params) {
  params = extend(DEFAULT_PARAMS, params)

  return (type) => ({
    create(entity, payload, api) {
      type.create?.(entity, payload, api)

      defaults(entity, params)
    },

    land(entity, entityId) {
      if (entity.id === entityId) {
        entity.vy = jump(entity) * entity.bounciness
        entity.groundObject = undefined
      }
    },
  })
}
