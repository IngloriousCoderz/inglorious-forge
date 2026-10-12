import { findCollision } from "@inglorious/engine/collision/detection.js"
import { clampToBounds } from "@inglorious/engine/physics/bounds.js"
import { zero } from "@inglorious/utils/vector.js"

export function mouse() {
  return {
    create(entity) {
      entity.collisions ??= {}

      // Two shapes, for two different jobs. `bounds` is what the pointer is kept inside,
      // and `hitbox` is the point that is tested against everything else -- so a mouse
      // with only the first of them is a cursor that never touches anything, and every
      // press it makes lands on the scene rather than on the control under it.
      entity.collisions.bounds ??= { shape: "point" }
      entity.collisions.hitbox ??= { shape: "point" }
    },

    mouseMove(entity, position, api) {
      move(entity, position, api)
    },

    mouseDown(entity, position, api) {
      move(entity, position, api)

      const pressed = findCollision(entity, api.getEntities())

      // Remembered, because a release belongs to the press that started it rather than
      // to whatever the pointer happens to be over when it is let go. Without this, a
      // press that slides off its target -- which is what dragging a slider does -- is
      // never released at all, and whatever was pressed stays pressed for good.
      entity.pressedId = pressed?.id

      if (pressed) {
        api.notify("entityPress", pressed.id)
      } else {
        api.notify("scenePress", position)
      }
    },

    mouseUp(entity, position, api) {
      move(entity, position, api)

      const released = entity.pressedId

      entity.pressedId = undefined

      if (released) {
        api.notify("entityRelease", released)
      } else {
        api.notify("sceneRelease", position)
      }
    },

    mouseClick(entity, position, api) {
      move(entity, position, api)

      const clicked = findCollision(entity, api.getEntities())

      if (clicked) {
        api.notify("entityClick", clicked.id)
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
  const handleMouseDown = createHandler(
    "mouseDown",
    parent,
    api,
    toGamePosition,
  )
  const handleMouseUp = createHandler("mouseUp", parent, api, toGamePosition)
  const handleClick = createHandler("mouseClick", parent, api, toGamePosition)
  const handleMouseWheel = createHandler(
    "mouseWheel",
    parent,
    api,
    toGamePosition,
  )

  return {
    onMouseMove: handleMouseMove,
    onClick: handleClick,
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onMouseWheel: handleMouseWheel,
  }
}

export function createMouseEntity(overrides = {}) {
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

/**
 * Puts the pointer where the browser last said it was.
 *
 * Every event that carries a position moves the mouse as well, not just the move: a
 * press reports where the pointer is, and a mouse that stayed where it last drifted to
 * draws the cursor somewhere other than where the finger is.
 */
function move(entity, position, api) {
  const game = api.getEntity("game")

  entity.position = position

  clampToBounds(entity, game.size)
}
