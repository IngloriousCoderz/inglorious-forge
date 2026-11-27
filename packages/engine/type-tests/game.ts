import { v } from "@inglorious/utils/v.js"
import type { Vector3 } from "@inglorious/utils/vector.js"

import type {
  Entity,
  GameApi,
  GameConfig,
  GameEntity,
  GameType,
} from "../types"
import { arrive } from "../types/ai/movement/kinematic/arrive"
import { atFps } from "../types/behaviors/at-fps"
import { modernControls } from "../types/behaviors/controls/kinematic/modern"
import {
  controlTypes,
  createControlEntities,
} from "../types/behaviors/input/controls"
import { createMouseEntity, mouse } from "../types/behaviors/input/mouse"
import { emitBurst, particle } from "../types/behaviors/particles"
import { clamped } from "../types/behaviors/physics/clamped"
import { button } from "../types/behaviors/ui/button"
import { slider } from "../types/behaviors/ui/slider"
import { findCollision } from "../types/collision/detection"
import { Engine } from "../types/core/engine"
import { ticks } from "../types/systems/ticks"
import { createGame } from "../types/test"

interface RoundEntity extends GameEntity {
  state: "play" | "over"
  timeLeft: number
}

interface PlayerEntity extends Entity {
  position: Vector3
  maxSpeed: number
}

const Round: GameType<RoundEntity> = {
  update(entity, dt: number, api) {
    entity.timeLeft -= dt
    if (entity.timeLeft <= 0) api.notify("roundOver")
  },
}

const Player: GameType<PlayerEntity> = {
  update(entity, _dt, api: GameApi) {
    const coin = api.findCollision(entity)
    if (coin) api.notify("coinCollect", coin.id)

    const pooled = api.getAllActivePoolEntities()
    if (pooled.length) emitBurst(api, { count: 3, position: entity.position })
  },
}

const config = {
  loop: { type: "fixed", fps: 30 },
  types: {
    ...controlTypes(),
    Mouse: [mouse()],
    Round,
    Player: [Player, modernControls({ maxSpeed: 300 }), clamped(), atFps(10)],
    Particle: [particle()],
    Button: [button()],
    Slider: [slider({ max: 10, step: 1 })],
  },
  entities: {
    ...createControlEntities({ ArrowLeft: "moveLeft", Space: "restart" }),
    mouse: createMouseEntity({ cursor: "arrow" }),
    game: { type: "Round", size: v(800, 600), state: "play", timeLeft: 30 },
  },
  systems: [ticks({ fps: 10 })],
} satisfies GameConfig

// @ts-expect-error: a loop is "animationFrame" or "fixed"
export const wrongLoop: GameConfig = { loop: { type: "slow" } }

// @ts-expect-error: maxSpeed is a number
modernControls({ maxSpeed: "fast" })

export const engine = new Engine(config)
engine.update(0.016)

declare const player: PlayerEntity & { id: string }
declare const enemy: PlayerEntity & { id: string }
export const hit: PlayerEntity | undefined = findCollision(player, { enemy })

const step = arrive(player, enemy, 0.016, { targetRadius: 2 })
export const where: Vector3 = step.position

const game = createGame(config, {
  playRound() {
    return this.advance(30)
  },
})
game.playRound().step(2).press("Space")
game.check(game.entity<RoundEntity>("game").state === "over", "the round ends")
// @ts-expect-error: the entity says what it is
game.entity<RoundEntity>("game").score
