import { modernControls } from "@inglorious/engine/behaviors/controls/kinematic/modern.js"
import {
  controlTypes,
  createControlEntities,
} from "@inglorious/engine/behaviors/input/controls.js"
import { clamped } from "@inglorious/engine/behaviors/physics/clamped.js"
import { findCollision } from "@inglorious/engine/collision/detection.js"
import { renderCircle } from "@inglorious/renderer-2d/shapes/circle.js"
import { renderText } from "@inglorious/renderer-2d/text.js"
import type { Api, BaseEntity } from "@inglorious/store"
import { random } from "@inglorious/utils/math/rng.js"
import { v } from "@inglorious/utils/v.js"
import {
  add,
  magnitude,
  setMagnitude,
  subtract,
  type Vector3,
} from "@inglorious/utils/vector.js"

const WIDTH = 800
const HEIGHT = 600
const MARGIN = 40
const ROUND_SECONDS = 30
const POINTS_PER_LEVEL = 5

interface GameEntity extends BaseEntity {
  state: "play" | "over"
  timeLeft: number
}

interface PlayerEntity extends BaseEntity {
  position: Vector3
  maxSpeed: number
  target?: Vector3 | null
}

interface CoinEntity extends BaseEntity {
  id: string
  position: Vector3
}

interface ScoreEntity extends BaseEntity {
  points: number
  level: number
  best: number
  value: string
}

interface Touch {
  position: Vector3
}

type GameType = {
  update: (entity: GameEntity, dt: number, api: Api) => void
  restart: (entity: GameEntity, payload: unknown, api: Api) => void
}

type PlayerType = {
  render: typeof renderCircle
  touchStart: (entity: PlayerEntity, touch: Touch) => void
  touchMove: (entity: PlayerEntity, touch: Touch) => void
  touchEnd: (entity: PlayerEntity) => void
  update: (entity: PlayerEntity, dt: number, api: Api) => void
}

type CoinType = {
  render: typeof renderCircle
  coinCollect: (entity: CoinEntity, coinId: string) => void
}

type ScoreType = {
  render: typeof renderText
  coinCollect: (entity: ScoreEntity) => void
  roundStart: (entity: ScoreEntity) => void
  roundOver: (entity: ScoreEntity) => void
  update: (entity: ScoreEntity, dt: number, api: Api) => void
}

const Game: GameType = {
  update(entity, dt, api) {
    if (entity.state !== "play") return

    entity.timeLeft = Math.max(entity.timeLeft - dt, 0)
    if (!entity.timeLeft) {
      entity.state = "over"
      api.notify("roundOver")
    }
  },

  restart(entity, _, api) {
    if (entity.state !== "over") return

    entity.state = "play"
    entity.timeLeft = ROUND_SECONDS
    api.notify("roundStart")
  },
}

const Player: PlayerType = {
  render: renderCircle,

  touchStart(entity, { position }) {
    entity.target = position
  },

  touchMove(entity, { position }) {
    entity.target = position
  },

  touchEnd(entity) {
    entity.target = null
  },

  update(entity, dt, api) {
    const game = api.getEntity("game") as GameEntity
    if (game.state !== "play") return

    if (entity.target) followTarget(entity, entity.target, dt)

    const coin = findCollision(entity, api.getEntities())
    if (coin) api.notify("coinCollect", coin.id)
  },
}

const Coin: CoinType = {
  render: renderCircle,

  coinCollect(entity, coinId) {
    if (coinId === entity.id) entity.position = randomPosition()
  },
}

const Score: ScoreType = {
  render: renderText,

  coinCollect(entity) {
    entity.points += entity.level
    entity.level = Math.floor(entity.points / POINTS_PER_LEVEL) + 1
  },

  roundStart(entity) {
    entity.points = 0
    entity.level = 1
  },

  roundOver(entity) {
    entity.best = Math.max(entity.best, entity.points)
  },

  update(entity, _, api) {
    const { state, timeLeft } = api.getEntity("game") as GameEntity
    const { points, level, best } = entity

    entity.value =
      state === "play"
        ? `Points: ${points}   Level: ${level}   Time: ${Math.ceil(timeLeft)}`
        : `Time's up! You scored ${points} (best: ${best})\nPress Space or tap to play again`
  },
}

export default {
  types: {
    ...controlTypes(),
    Game,
    Player: [Player, modernControls(), clamped()],
    Coin,
    Score,
  },

  entities: {
    ...createControlEntities(
      {
        ArrowUp: "moveUp",
        ArrowDown: "moveDown",
        ArrowLeft: "moveLeft",
        ArrowRight: "moveRight",
        KeyW: "moveUp",
        KeyS: "moveDown",
        KeyA: "moveLeft",
        KeyD: "moveRight",
        Axis0: "moveLeftRight",
        Axis1: "moveUpDown",
        Space: "restart",
        Btn0: "restart",
      },
      ["restart"],
    ),

    game: {
      type: "Game",
      devMode: true,
      size: v(WIDTH, HEIGHT),
      backgroundColor: "#1d1f33",
      state: "play",
      timeLeft: ROUND_SECONDS,
    },

    player: {
      type: "Player",
      position: v(WIDTH / 2, 0, HEIGHT / 2),
      size: v(32, 0, 32),
      radius: 16,
      maxSpeed: 300,
      color: "white",
      backgroundColor: "#4fc3f7",
      collisions: { hitbox: { shape: "circle" } },
    },

    coin1: createCoin("coin1"),
    coin2: createCoin("coin2"),
    coin3: createCoin("coin3"),

    score: {
      type: "Score",
      position: v(MARGIN / 2, 0, HEIGHT - MARGIN / 2),
      font: "monospace",
      size: 20,
      lineHeight: 28,
      color: "white",
      points: 0,
      level: 1,
      best: 0,
    },
  },
}

function createCoin(id: string) {
  return {
    id,
    type: "Coin",
    position: randomPosition(),
    radius: 10,
    color: "#b8860b",
    backgroundColor: "gold",
    collisions: { hitbox: { shape: "circle" } },
  }
}

function randomPosition() {
  return v(
    random(MARGIN, WIDTH - MARGIN),
    0,
    random(MARGIN, HEIGHT - MARGIN * 2),
  )
}

function followTarget(entity: PlayerEntity, target: Vector3, dt: number) {
  const toTarget = subtract(target, entity.position)
  const step = Math.min(magnitude(toTarget), entity.maxSpeed * dt)
  if (step) entity.position = add(entity.position, setMagnitude(toTarget, step))
}
