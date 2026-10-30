import { lerp } from "@inglorious/utils/math/linear-interpolation.js"
import { defaults, extend, merge } from "@inglorious/utils/object.js"

import { arrive } from "../ai/movement/dynamic/arrive.js"

const DEFAULT_PARAMS = {
  zoom: 1,
  zoomSpeed: 0.1,
  zoomSensitivity: 5,
  minZoom: 0.5,
  maxZoom: 4,
  targetId: null,
}

const X = 0
const Y = 1

export function camera(params) {
  params = extend(DEFAULT_PARAMS, params)

  return {
    create(entity) {
      defaults(entity, params)
      entity.targetZoom = entity.zoom
      if (entity.size) {
        entity.baseSize = [...entity.size]
      }
    },

    update(entity, dt, api) {
      if (entity.targetId) {
        const target = api.getEntity(entity.targetId)
        if (target) {
          merge(entity, arrive(entity, target, dt))
        }
      }

      if (entity.zoom !== entity.targetZoom) {
        entity.zoom = lerp(entity.zoom, entity.targetZoom, entity.zoomSpeed)

        if (entity.baseSize) {
          entity.size[X] = entity.baseSize[X] / entity.zoom
          entity.size[Y] = entity.baseSize[Y] / entity.zoom
        }
      }
    },

    mouseWheel(entity, deltaY) {
      const delta = Math.sign(deltaY)
      entity.targetZoom -= delta * entity.zoomSpeed * entity.zoomSensitivity
      entity.targetZoom = Math.max(
        entity.minZoom,
        Math.min(entity.maxZoom, entity.targetZoom),
      )
    },
  }
}
