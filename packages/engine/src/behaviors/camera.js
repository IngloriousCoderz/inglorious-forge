import { arrive } from "@inglorious/engine/ai/movement/dynamic/arrive.js"
import { lerp } from "@inglorious/utils/math/linear-interpolation.js"
import { defaults, extend, merge } from "@inglorious/utils/object.js"

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
      // Cache the initial size to calculate the viewport in dev mode
      if (entity.size) {
        entity.baseSize = [...entity.size]
      }
    },

    update(entity, dt, api) {
      // Follow target
      if (entity.targetId) {
        const target = api.getEntity(entity.targetId)
        if (target) {
          // The camera will "arrive" at the target's position.
          // You can tweak the parameters in the entity definition
          // to change how the camera follows the target.
          merge(entity, arrive(entity, target, dt))
        }
      }

      // Smooth zoom
      if (entity.zoom !== entity.targetZoom) {
        entity.zoom = lerp(entity.zoom, entity.targetZoom, entity.zoomSpeed)

        // Update the visual size of the camera's viewport for dev mode
        if (entity.baseSize) {
          entity.size[X] = entity.baseSize[X] / entity.zoom
          entity.size[Y] = entity.baseSize[Y] / entity.zoom
        }
      }
    },

    mouseWheel(entity, deltaY) {
      const delta = Math.sign(deltaY)
      // Scrolling down (positive deltaY) should zoom out (decrease zoom value)
      entity.targetZoom -= delta * entity.zoomSpeed * entity.zoomSensitivity
      entity.targetZoom = Math.max(
        entity.minZoom,
        Math.min(entity.maxZoom, entity.targetZoom),
      )
    },
  }
}
