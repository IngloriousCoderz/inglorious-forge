import { arrive } from "@inglorious/engine/ai/movement/kinematic/arrive.js"
import { Sprite } from "@inglorious/engine/animation/sprite.js"
import { fsm } from "@inglorious/engine/behaviors/fsm.js"
import {
  createMouseEntity,
  mouse,
} from "@inglorious/engine/behaviors/input/mouse.js"
import { spriteAnimationSystem } from "@inglorious/engine/systems/sprite-animation.js"
import { flippedHorizontally } from "@inglorious/renderer-2d/image/flags.js"
import { renderSprite } from "@inglorious/renderer-2d/image/sprite.js"
import { renderMouse } from "@inglorious/renderer-2d/mouse.js"
import { decide } from "@inglorious/utils/algorithms/decision-tree.js"
import { merge } from "@inglorious/utils/object.js"
import { v } from "@inglorious/utils/v.js"
import { length, subtract } from "@inglorious/utils/vectors.js"

// A reusable decision tree node
const wakeUp = () => ({
  test({ entity, target }) {
    const distance = length(subtract(target.position, entity.position))
    return distance >= 10
  },
  true() {
    return "aware"
  },
  false({ entity }) {
    return entity.state
  },
})

// Our decision tree
const nextState = {
  test({ entity }) {
    return entity.state
  },
  idle() {
    return {
      test({ entity, target }) {
        const distance = length(subtract(target.position, entity.position))
        return distance < 250
      },
      true() {
        return "aware"
      },
      false({ entity }) {
        return entity.state
      },
    }
  },
  chasing() {
    return {
      test({ entity, target }) {
        const distance = length(subtract(target.position, entity.position))
        return distance >= 250
      },
      true() {
        return "idle"
      },
      false() {
        return {
          test({ entity, target }) {
            const distance = length(subtract(target.position, entity.position))
            return distance < 10
          },
          true() {
            return "sleepy"
          },
          false({ entity }) {
            return entity.state
          },
        }
      },
    }
  },
  sleepy: wakeUp,
  sleeping: wakeUp,
}

export default {
  systems: [spriteAnimationSystem()],

  types: {
    Mouse: [{ render: renderMouse }, mouse()],

    Cat: [
      { render: renderSprite },
      fsm({
        idle: {
          update(entity, dt, api) {
            const mouse = api.getEntity("mouse")

            entity.sprite.state = "idle"

            entity.state = decide(nextState, { entity, target: mouse })
          },
        },

        aware: {
          update(entity) {
            entity.sprite.state = "aware"
          },

          spriteAnimationEnd(entity, { entityId, animation }) {
            // always check who originated the event and which sprite is running!
            if (entityId === entity.id && animation === "aware") {
              entity.state = "chasing"
            }
          },
        },

        chasing: {
          update(entity, dt, api) {
            const mouse = api.getEntity("mouse")

            merge(entity, arrive(entity, mouse, dt))

            const animation = Sprite.move8(entity)
            entity.sprite.state = animation

            entity.state = decide(nextState, { entity, target: mouse })
          },
        },

        sleepy: {
          update(entity, dt, api) {
            const mouse = api.getEntity("mouse")

            entity.sprite.state = "sleepy"

            entity.state = decide(nextState, { entity, target: mouse })
          },

          spriteAnimationEnd(entity, { entityId, animation }) {
            // always check who originated the event and which sprite is running!
            if (entityId === entity.id && animation === "sleepy") {
              entity.state = "sleeping"
            }
          },
        },

        sleeping: {
          update(entity, dt, api) {
            const mouse = api.getEntity("mouse")

            entity.sprite.state = "sleeping"

            entity.state = decide(nextState, { entity, target: mouse })
          },
        },
      }),
    ],
  },

  entities: {
    game: {
      type: "Game",
      devMode: true,
      pixelated: true,
    },

    mouse: createMouseEntity(),

    images: {
      type: "Images",
      images: {
        neko: { url: "/sprites/neko.png" },
      },
    },

    neko: {
      type: "Cat",
      state: "idle",
      maxSpeed: 250,
      position: v(400, 0, 300),
      sprite: {
        image: {
          id: "neko",
          imageSize: v(192, 192),
          tileSize: v(32, 32),
        },
        scale: 2,
        speed: 0.2,
        frames: {
          idle: [4],
          aware: v(0, 4),
          leftUp: [flippedHorizontally(23), flippedHorizontally(29)],
          up: [28, 30, 28, 31],
          rightUp: v(23, 29),
          right: v(16, 22),
          rightDown: v(13, 14),
          down: [1, 2, 1, 7],
          leftDown: [flippedHorizontally(13), flippedHorizontally(14)],
          left: [flippedHorizontally(16), flippedHorizontally(22)],
          sleepy: [4, 10, 10, 3, 9, 15, 9, 15, 15],
          sleeping: [26, 26, 27, 27],
        },
      },
    },
  },
}
