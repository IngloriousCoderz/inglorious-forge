import { abs, clamp } from "@inglorious/utils/math/number.js"
import { toRange } from "@inglorious/utils/math/trigonometry.js"

export const DEFAULT_TARGET_RADIUS = 0.1
export const DEFAULT_TIME_TO_TARGET = 0.1

const DEFAULT_MAX_ANGULAR_SPEED = 0

const DEFAULT_ORIENTATION = 0

export function align(
  entity,
  target,
  dt,
  {
    targetRadius = DEFAULT_TARGET_RADIUS,
    timeToTarget = DEFAULT_TIME_TO_TARGET,
  } = {},
) {
  const maxAngularSpeed = entity.maxAngularSpeed ?? DEFAULT_MAX_ANGULAR_SPEED

  let orientation = entity.orientation ?? DEFAULT_ORIENTATION

  const direction = toRange(target.orientation - orientation)
  const distance = abs(direction)

  if (distance < targetRadius) {
    return entity
  }

  let angularVelocity = direction / timeToTarget
  angularVelocity = clamp(angularVelocity, -maxAngularSpeed, maxAngularSpeed)

  orientation += angularVelocity * dt

  return { orientation }
}
