import { findCollision } from "@inglorious/engine/collision/detection.js"
import { clampToBounds } from "@inglorious/engine/physics/bounds.js"
import { zero } from "@inglorious/utils/math/vector.js"

export function mouse() {
  return {
    create(entity) {
      entity.collisions ??= {}
      entity.collisions.bounds ??= { shape: "point" }
    },

    mouseMove(entity, position, api) {
      const game = api.getEntity("game")

      entity.position = position

      clampToBounds(entity, game.size)
    },

    mouseClick(entity, position, api) {
      const entities = api.getEntities()
      const clickedEntity = findCollision(entity, entities)
      if (clickedEntity) {
        api.notify("entityClick", clickedEntity.id)
      } else {
        api.notify("sceneClick", position)
      }
    },
  }
}

export function trackMouse(parent, api, toGamePosition) {
  const handleMouseMove = createHandler(
    "mouseMove",
    parent,
    api,
    toGamePosition,
  )
  const handleClick = createHandler("mouseClick", parent, api, toGamePosition)
  const handleWheel = createHandler("mouseWheel", parent, api, toGamePosition)

  return {
    onMouseMove: handleMouseMove,
    onClick: handleClick,
    onWheel: handleWheel,
  }
}

export function createMouse(overrides = {}) {
  return {
    type: "Mouse",
    layer: 999, // A high layer value to ensure it's always rendered on top
    position: zero(),
    ...overrides,
  }
}

function createHandler(type, parent, api, toGamePosition) {
  return (event) => {
    event.preventDefault()
    event.stopPropagation()

    if (parent == null) {
      return
    }

    if (type === "mouseWheel") {
      api.notify(type, event.deltaY)
      return
    }

    const position = toGamePosition(event.clientX, event.clientY)
    api.notify(type, position)
  }
}
