import type { BaseEntity } from "@inglorious/store"

import type { Handler } from "../index"

/** A sound to load, by name. */
export interface Sound {
  url: string
  /** From 0 to 1. Defaults to 1. */
  volume?: number
  loop?: boolean
}

export interface AudioEntity extends BaseEntity {
  sounds: Record<string, Sound>
}

/** Loads the entity's sounds and plays them on `soundPlay`, by name. */
export function audio(): {
  create: Handler<AudioEntity>
  init: (entity: AudioEntity) => Promise<void>
  soundPlay: Handler<AudioEntity, string>
  soundStop: Handler<AudioEntity, string>
  stop: () => void
  destroy: () => void
}
