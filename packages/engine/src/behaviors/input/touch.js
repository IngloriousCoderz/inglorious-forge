import { findCollision } from "@inglorious/engine/collision/detection.js"
import { clampToBounds } from "@inglorious/engine/physics/bounds.js"
import { magnitude } from "@inglorious/utils/math/vector.js"
import { subtract } from "@inglorious/utils/math/vectors.js"
import { v } from "@inglorious/utils/v.js"

const MOVEMENT_THRESHOLD = 5

export function touch() {
  return {
    touchStart(entity, { index, position }, api) {
      entity.isSwiping = false
      entity.positions[index] = position

      const entities = api.getEntities()
      const touchedEntity = findCollision(
        { ...entity, position: entity.positions[index] },
        entities,
        "touch",
      )
      if (touchedEntity) {
        entity.targetIds[index] = touchedEntity.id
        api.notify("entityTouchStart", entity.targetIds[index])
      } else {
        api.notify("sceneTouchStart", v(...entity.positions[index]))
      }
    },

    touchMove(entity, { index, position }, api) {
      const delta = subtract(position, entity.positions[index])

      if (magnitude(delta) > MOVEMENT_THRESHOLD) {
        entity.isSwiping = true
      }

      entity.positions[index] = position
      const game = api.getEntity("game")
      clampToBounds({ ...entity, position: entity.positions[index] }, game.size)

      if (entity.targetIds[index]) {
        api.notify("entityTouchMove", {
          targetId: entity.targetIds[index],
          position: v(...entity.positions[index]),
        })
      }
    },

    touchEnd(entity, { index }, api) {
      if (entity.isSwiping) {
        entity.isSwiping = false
      }

      if (entity.targetIds[index]) {
        api.notify("entityTouchEnd", {
          targetId: entity.targetIds[index],
          position: v(...entity.positions[index]),
        })
        entity.targetIds[index] = undefined
      } else {
        api.notify("sceneTouchEnd", v(...entity.positions[index]))
      }
    },
  }
}

export function trackTouch(parent, api, toGamePosition) {
  const handleTouchStart = createHandler(
    "touchStart",
    parent,
    api,
    toGamePosition,
  )
  const handleTouchMove = createHandler(
    "touchMove",
    parent,
    api,
    toGamePosition,
  )
  const handleTouchEnd = createHandler("touchEnd", parent, api, toGamePosition)

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchCancel: handleTouchEnd,
    onTouchEnd: handleTouchEnd,
  }
}

export function createTouch() {
  return {
    type: "Touch",
    layer: 999, // A high layer value to ensure it's always rendered on top
    positions: [],
    collisions: {
      bounds: { shape: "point" },
      touch: { shape: "circle", radius: 44 },
    },
    targetIds: [],
  }
}

function createHandler(type, parent, api, toGamePosition) {
  return (event) => {
    event.preventDefault()
    event.stopPropagation()

    if (parent == null) {
      return
    }

    // touchend doesn't have touches anymore, but it has changedTouches
    const touches = event.touches.length ? event.touches : event.changedTouches

    Array.from(touches).forEach((touch, index) => {
      const { clientX, clientY } = touch

      const position = toGamePosition(clientX, clientY)
      api.notify(type, { index, position })
    })
  }
}
