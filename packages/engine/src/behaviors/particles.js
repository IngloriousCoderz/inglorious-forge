import { random } from "@inglorious/utils/math/rng.js"
import { v } from "@inglorious/utils/v.js"
import {
  multiply,
  negate,
  randomVector,
  sum,
} from "@inglorious/utils/vectors.js"

const FIRST_INDEX = 0
const SINGLE = 1
const OPAQUE = 1
const NO_LAYER = 0
const NO_SPREAD = 0
const NO_DEPTH = 0
const NO_TIME = 0
const WHOLE = 1
const DEFAULT_SIZE = 1
const PARTICLE_TYPE = "Particle"

// `size` and `spread` are rebuilt on every call rather than shared from a module
// constant, because entities hold on to them and vectors are mutable.
const DEFAULT_SIZE_VECTOR = () => v(DEFAULT_SIZE, DEFAULT_SIZE, NO_DEPTH)
const NO_SPREAD_VECTOR = () => v(NO_SPREAD, NO_SPREAD, NO_SPREAD)

/**
 * A single particle: it drifts under an acceleration and fades out over its
 * lifetime, then hands itself back to the pool.
 *
 * Pair it with whatever draws the particle, which is usually `renderImage` or
 * `renderRectangle`:
 *
 * @example
 * ```js
 * types: { Particle: [{ render: renderImage }, particle()] }
 * ```
 */
export function particle() {
  return {
    update(entity, dt, api) {
      entity.age += dt

      if (entity.age >= entity.life) {
        api.notify("despawn", entity)
        return
      }

      entity.velocity = sum(entity.velocity, multiply(entity.acceleration, dt))
      entity.position = sum(entity.position, multiply(entity.velocity, dt))

      const spent = entity.age / entity.life
      entity.opacity = entity.startOpacity * (WHOLE - spent)
    },
  }
}

/**
 * Emits a burst of particles, pooled like any other entity.
 *
 * Each particle picks its own lifetime, its own acceleration and its own place
 * in the emission box, so one call reads as a burst rather than a grid.
 *
 * `acceleration` is a pair of vectors, and each particle's acceleration is drawn
 * per axis between them: the low end is where a component starts, the high end
 * where it can reach. `spread` is the half-extent of the box particles are
 * emitted in, so `[5, 5, 0]` emits within five of the position on each axis.
 *
 * @example
 * ```js
 * // Debris falling away from something that was hit.
 * emitBurst(api, {
 *   count: 64,
 *   position: v(100, 100, 0),
 *   size: v(2, 2, 0),
 *   lifetime: [0.5, 1],
 *   tint: "rgb(99, 155, 255)",
 *   acceleration: [v(-15, -80, 0), v(15, 0, 0)],
 *   spread: v(5, 5, 0),
 *   layer: LAYER_PARTICLES,
 *   image: { id: "particle", imageSize: [2, 2] },
 * })
 * ```
 */
export function emitBurst(api, params) {
  const {
    count = SINGLE,
    type = PARTICLE_TYPE,
    size = DEFAULT_SIZE_VECTOR(),
    lifetime = [WHOLE, WHOLE],
    acceleration,
    spread = NO_SPREAD_VECTOR(),
    velocity,
    opacity = OPAQUE,
    layer = NO_LAYER,
    image,
    tint,
    position = v(NO_SPREAD, NO_SPREAD, NO_DEPTH),
  } = params

  const [low, high] = acceleration ?? []

  for (let index = FIRST_INDEX; index < count; index++) {
    api.notify("spawn", {
      type,
      layer,
      size,
      image,
      tint,
      age: NO_TIME,
      life: random(...lifetime),
      startOpacity: opacity,
      opacity,
      position: within(position, spread),
      velocity: velocity ?? v(NO_SPREAD, NO_SPREAD, NO_DEPTH),
      acceleration: randomVector(low, high),
    })
  }
}

// A random point inside the box `spread` radiates around `centre`, which is the
// centre plus a random vector across the box's own range.
function within(centre, spread) {
  return sum(centre, randomVector(negate(spread), spread))
}
