import type { Vector3 } from "@inglorious/utils/vector.js"

import type { Entity, UpdateHandler } from "../index"

export interface InfiniteScrollEntity extends Entity {
  position: Vector3
  velocity: Vector3
  /** `loop` is where the image repeats. */
  image: { loop: Vector3 }
}

/** Scrolls with its velocity, wrapping around at the image's `loop`, unless the game is paused. */
export function infiniteScroll(): {
  update: UpdateHandler<InfiniteScrollEntity>
}
