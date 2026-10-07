/* eslint-disable no-magic-numbers */
import { Ticker } from "@inglorious/engine/animation/ticker.js"
import { mod } from "@inglorious/utils/math/number.js"
import { pi, toRange } from "@inglorious/utils/math/trigonometry.js"

export const Sprite = {
  fromAngle,
  move2,
  move4,
  move6,
  move8,
  play,
}

function move2(entity) {
  return fromAngle(entity, ["right", "left"]) ?? "right"
}

function move4(entity) {
  return fromAngle(entity, ["right", "up", "left", "down"]) ?? "down"
}

function move6(entity) {
  return (
    fromAngle(entity, [
      "right",
      "rightUp",
      "leftUp",
      "left",
      "leftDown",
      "rightDown",
    ]) ?? "down"
  )
}

function move8(entity) {
  return (
    fromAngle(entity, [
      "right",
      "rightUp",
      "up",
      "leftUp",
      "left",
      "leftDown",
      "down",
      "rightDown",
    ]) ?? "down"
  )
}

function play(animation, { entity, dt, notify }) {
  const missing = [
    animation == null && "'animation'",
    entity == null && "'entity'",
    dt == null && "'dt'",
    notify == null && "'notify'",
  ]
    .filter(Boolean)
    .join(", ")
  if (missing.length) {
    throw new Error(`Sprite.play is missing mandatory parameters: ${missing}`)
  }

  Ticker.tick({
    target: entity.sprite,
    state: animation,
    dt,
    onTick: (sprite) => {
      const { frames, state: animation } = sprite
      const framesLength = frames[animation].length
      sprite.value = mod(sprite.value + 1, framesLength)
      if (sprite.value === framesLength - 1) {
        notify("spriteAnimationEnd", { entityId: entity.id, animation })
      }
    },
  })
}

/**
 * Determines a sprite state from an orientation angle, based on a list of states.
 * The states are assumed to be ordered starting from the right (0 radians) and
 * proceeding counter-clockwise.
 *
 * @param {object} entity - The entity with an orientation.
 * @param {string[]} states - An array of state names corresponding to directions.
 * @returns {string} The calculated state name.
 */
function fromAngle(entity, states) {
  const directions = states.length
  const slice = (2 * pi()) / directions

  // Normalize orientation to [0, 2*PI)
  const normalizedOrientation = mod(toRange(entity.orientation), 2 * pi())

  // Shift by half a slice so that 0 rad is in the middle of the first slice, then find the index
  const index = Math.floor(
    mod(normalizedOrientation + slice / 2, 2 * pi()) / slice,
  )

  return states[index] ?? entity.sprite.state
}
