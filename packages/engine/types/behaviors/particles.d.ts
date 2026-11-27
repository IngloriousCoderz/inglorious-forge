import type { Vector3 } from "@inglorious/utils/vector.js"

import type { Entity, GameApi, UpdateHandler } from "../index"

export interface ParticleEntity extends Entity {
  position: Vector3
  velocity: Vector3
  acceleration: Vector3
  /** Seconds since it was emitted. */
  age: number
  /** Seconds it lasts. */
  life: number
  startOpacity: number
  opacity: number
}

/** Drifts and fades over its life, then despawns. */
export function particle(): {
  update: UpdateHandler<ParticleEntity>
}

export interface BurstParams {
  /** Defaults to 1. */
  count?: number
  /** Defaults to `"Particle"`. */
  type?: string
  size?: Vector3
  /** The shortest and longest a particle lasts, in seconds. Defaults to 1. */
  lifetime?: readonly [number, number]
  /** Each particle's acceleration is drawn between these, axis by axis. */
  acceleration?: readonly [Vector3, Vector3]
  /** The half-extent of the box particles are emitted in. */
  spread?: Vector3
  velocity?: Vector3
  /** Defaults to 1. */
  opacity?: number
  layer?: number
  image?: unknown
  tint?: string
  position?: Vector3
}

/** Spawns a burst of pooled particles. */
export function emitBurst(api: GameApi, params: BurstParams): void
