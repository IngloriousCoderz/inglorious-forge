import type { Entity, GameConfig, GameType } from "@inglorious/engine"
import { Engine } from "@inglorious/engine/core/engine.js"
import { v } from "@inglorious/utils/v.js"
import type { Vector3 } from "@inglorious/utils/vector.js"

import { createRenderer } from "../types"
import { flippedHorizontally } from "../types/image/flags"
import { renderImage } from "../types/image/image"
import { renderCircle } from "../types/shapes/circle"
import { renderRectangle } from "../types/shapes/rectangle"
import { renderText, text } from "../types/text"

interface BallEntity extends Entity {
  position: Vector3
  radius: number
}

interface ScoreEntity extends Omit<Entity, "size"> {
  size: number
  points: number
  value: string
}

const Ball: GameType<BallEntity> = {
  render: renderCircle,
}

const Score: GameType<ScoreEntity> = {
  render: renderText,
  coinCollect(entity) {
    entity.points++
  },
}

const game = {
  types: {
    Ball,
    Score,
    Label: text({ value: "Hello", size: 20 }),
    Wall: [{ render: renderRectangle }],
    Hero: [{ render: renderImage }],
  },
  entities: {
    game: { type: "Game", size: v(800, 600) },
    ball: { type: "Ball", position: v(0, 0, 0), radius: 10 },
    hero: {
      type: "Hero",
      position: v(0, 0, 0),
      image: { id: "hero", imageSize: [32, 32] },
    },
  },
} satisfies GameConfig

declare const canvas: HTMLCanvasElement
export const engine = new Engine(createRenderer(canvas), game)

export const frame: number = flippedHorizontally(3)

interface BoxEntity extends Entity {
  size: Vector3
}

export const broken: GameType<BoxEntity> = {
  // @ts-expect-error: text is drawn from a font size, not a box
  render: renderText,
}
