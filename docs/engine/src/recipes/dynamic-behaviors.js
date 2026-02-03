/* eslint-disable no-console */
import { modernVelocity } from "@inglorious/engine/behaviors/controls/kinematic/modern.js"
import {
  controls,
  createControls,
} from "@inglorious/engine/behaviors/input/controls.js"
import { clamped } from "@inglorious/engine/behaviors/physics/clamped.js"
import { jumpable } from "@inglorious/engine/behaviors/physics/jumpable.js"
import { findCollision } from "@inglorious/engine/collision/detection.js"
import { renderRectangle } from "@inglorious/renderer-2d/shapes/rectangle.js"
import { v } from "@inglorious/utils/v.js"

const BASE_DARIO = [
  { render: renderRectangle },
  modernVelocity(),
  clamped({ depthAxis: "z" }),
  jumpable(),
  canCollideWithPowerups,
]

const DARIO = [...BASE_DARIO, canCollideWithEnemyAndDie]

const SUPER_DARIO = [
  ...BASE_DARIO,
  canBreakBricks,
  canCollideWithEnemyAndShrink,
]

const FIRE_DARIO = [
  ...BASE_DARIO,
  canBreakBricks,
  canShoot,
  canCollideWithEnemyAndLosePowers,
]

const CAPE_DARIO = [
  ...BASE_DARIO,
  canBreakBricks,
  canGlide,
  canCollideWithEnemyAndLosePowers,
]

const ULTRA_DARIO = [
  ...BASE_DARIO,
  canBreakBricks,
  canShoot,
  canGlide,
  canCollideWithEnemyAndLosePowers,
]

export default {
  types: {
    ...controls("dario"),

    dario: DARIO,

    platform: [{ render: renderRectangle }],

    mushroom: [{ render: renderRectangle }],

    fireFlower: [{ render: renderRectangle }],

    feather: [{ render: renderRectangle }],

    diamond: [{ render: renderRectangle }],

    goomba: [{ render: renderRectangle }],
  },

  entities: {
    game: {
      type: "game",
      devMode: true,
    },

    ...createControls("dario", {
      ArrowLeft: "moveLeft",
      ArrowRight: "moveRight",
      Space: "jump",
      KeyG: "glide",
      KeyS: "shoot",
      KeyB: "break",
      Btn0: "jump",
      Btn1: "glide",
      Btn2: "shoot",
      Btn3: "break",
      Btn14: "moveLeft",
      Btn15: "moveRight",
      Axis0: "moveLeftRight",
    }),

    dario: {
      type: "dario",
      layer: 1,
      position: v(116, 48, 0),
      size: v(32, 32, 0),
      backgroundColor: "#393664",
      maxSpeed: 250,
      state: "default",
      collisions: {
        bounds: { shape: "rectangle" },
        platform: { shape: "rectangle" },
        powerup: { shape: "rectangle" },
        enemy: { shape: "rectangle" },
      },
    },

    ground: {
      type: "platform",
      position: v(400, 16, 0),
      size: v(800, 32, 0),
      backgroundColor: "#654321",
      collisions: {
        platform: { shape: "rectangle" },
      },
    },

    platform1: {
      type: "platform",
      position: v(275, 100, 0),
      size: v(150, 32, 0),
      backgroundColor: "#654321",
      collisions: {
        platform: { shape: "rectangle" },
      },
    },

    powerUp1: {
      type: "mushroom",
      layer: 1,
      position: v(266, 132, 0),
      size: v(32, 32, 0),
      backgroundColor: "#dc372f",
      collisions: {
        powerup: { shape: "rectangle" },
      },
    },

    platform2: {
      type: "platform",
      position: v(525, 180, 0),
      size: v(150, 32, 0),
      backgroundColor: "#654321",
      collisions: {
        platform: { shape: "rectangle" },
      },
    },

    powerUp2: {
      type: "fireFlower",
      layer: 1,
      position: v(516, 212, 0),
      size: v(32, 32, 0),
      backgroundColor: "#e86c32",
      collisions: {
        powerup: { shape: "rectangle" },
      },
    },

    platform3: {
      type: "platform",
      position: v(725, 240, 0),
      size: v(150, 32, 0),
      backgroundColor: "#654321",
      collisions: {
        platform: { shape: "rectangle" },
      },
    },

    powerUp3: {
      type: "feather",
      layer: 1,
      position: v(716, 272, 0),
      size: v(32, 32, 0),
      backgroundColor: "#fdf3f3",
      collisions: {
        powerup: { shape: "rectangle" },
      },
    },

    platform4: {
      type: "platform",
      position: v(475, 320, 0),
      size: v(150, 32, 0),
      backgroundColor: "#654321",
      collisions: {
        platform: { shape: "rectangle" },
      },
    },

    powerUp4: {
      type: "diamond",
      layer: 1,
      position: v(466, 352, 0),
      size: v(32, 32, 0),
      backgroundColor: "#ca00ff",
      collisions: {
        powerup: { shape: "rectangle" },
      },
    },

    enemy1: {
      type: "goomba",
      position: v(48, 48, 0),
      size: v(32, 32, 0),
      backgroundColor: "#800000",
      collisions: {
        enemy: { shape: "rectangle" },
      },
    },

    enemy2: {
      type: "goomba",
      position: v(416, 48, 0),
      size: v(32, 32, 0),
      backgroundColor: "#800000",
      collisions: {
        enemy: { shape: "rectangle" },
      },
    },

    enemy3: {
      type: "goomba",
      position: v(656, 48, 0),
      size: v(32, 32, 0),
      backgroundColor: "#800000",
      collisions: {
        enemy: { shape: "rectangle" },
      },
    },
  },
}

function canBreakBricks() {
  return {
    break(entity, entityId) {
      if (entityId === entity.id) {
        console.log("Breaking!")
      }
    },
  }
}

function canShoot() {
  return {
    shoot(entity, entityId) {
      if (entityId === entity.id) {
        console.log("Shooting!")
      }
    },
  }
}

function canGlide() {
  return {
    glide(entity, entityId) {
      if (entityId === entity.id) {
        console.log("Gliding!")
      }
    },
  }
}

function canCollideWithPowerups(type) {
  return {
    update(entity, dt, api) {
      type.update?.(entity, dt, api)

      const entities = api.getEntities()
      const powerup = findCollision(entity, entities, "powerup")

      if (!powerup) return

      const oldheight = entity.size[1]

      switch (powerup.type) {
        case "mushroom":
          entity.size = v(64, 64, 0)
          entity.maxSpeed = 300
          entity.position[1] += (entity.size[1] - oldheight) / 2
          entity.backgroundColor = "#b9342e"

          api.setType(entity.type, SUPER_DARIO)
          break

        case "fireFlower":
          entity.size = v(64, 64, 0)
          entity.maxSpeed = 350
          entity.position[1] += (entity.size[1] - oldheight) / 2
          entity.backgroundColor = "#f4f3e9"

          api.setType(entity.type, FIRE_DARIO)
          break

        case "feather":
          entity.size = v(64, 64, 0)
          entity.maxSpeed = 350
          entity.position[1] += (entity.size[1] - oldheight) / 2
          entity.backgroundColor = "#f4f040"

          api.setType(entity.type, CAPE_DARIO)
          break

        case "diamond":
          entity.size = v(96, 96, 0)
          entity.maxSpeed = 400
          entity.position[1] += (entity.size[1] - oldheight) / 2
          entity.backgroundColor = "#ca00ff"

          api.setType(entity.type, ULTRA_DARIO)
          break
      }

      api.notify("remove", powerup.id)
    },
  }
}

function canCollideWithEnemyAndDie(type) {
  return {
    update(entity, dt, api) {
      type.update?.(entity, dt, api)

      const entities = api.getEntities()
      const enemy = findCollision(entity, entities, "enemy")

      if (!enemy) return

      api.notify("remove", entity.id)
      api.notify("remove", enemy.id)

      console.log("Game over!")
    },
  }
}

function canCollideWithEnemyAndShrink(type) {
  return {
    update(entity, dt, api) {
      type.update?.(entity, dt, api)

      const entities = api.getEntities()
      const enemy = findCollision(entity, entities, "enemy")

      if (!enemy) return

      const oldShrinkHeight = entity.size[1]
      entity.size = v(32, 32, 0)
      entity.maxSpeed = 250
      entity.position[1] += (entity.size[1] - oldShrinkHeight) / 2
      entity.backgroundColor = "#393664"

      api.setType(entity.type, DARIO)

      api.notify("remove", enemy.id)
    },
  }
}

function canCollideWithEnemyAndLosePowers(type) {
  return {
    update(entity, dt, api) {
      type.update?.(entity, dt, api)

      const entities = api.getEntities()
      const enemy = findCollision(entity, entities, "enemy")

      if (!enemy) return

      const oldLosePowersHeight = entity.size[1]
      entity.size = v(64, 64, 0)
      entity.maxSpeed = 300
      entity.position[1] += (entity.size[1] - oldLosePowersHeight) / 2
      entity.backgroundColor = "#b9342e"

      api.setType(entity.type, SUPER_DARIO)

      api.notify("remove", enemy.id)
    },
  }
}
