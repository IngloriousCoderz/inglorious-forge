import { abs, clamp } from "@inglorious/utils/math/number.js"
import { toRange } from "@inglorious/utils/math/trigonometry.js"

export const DEFAULT_TARGET_RADIUS = 0.1
export const DEFAULT_SLOW_RADIUS = 0.1
export const DEFAULT_TIME_TO_TARGET = 0.1

const DEFAULT_MAX_ANGULAR_ACCELERATION = 0
const DEFAULT_MAX_ANGULAR_SPEED = 0

const DEFAULT_ANGULAR_SPEED = 0
const DEFAULT_ORIENTATION = 0

const HALF_ANGULAR_ACCELERATION = 0.5

export function align(
  entity,
  target,
  dt,
  {
    targetRadius = DEFAULT_TARGET_RADIUS,
    slowRadius = DEFAULT_SLOW_RADIUS,
    timeToTarget = DEFAULT_TIME_TO_TARGET,
  } = {},
) {
  const maxAngularAcceleration =
    entity.maxAngularAcceleration ?? DEFAULT_MAX_ANGULAR_ACCELERATION
  const maxAngularSpeed = entity.maxAngularSpeed ?? DEFAULT_MAX_ANGULAR_SPEED

  let angularSpeed = entity.angularSpeed ?? DEFAULT_ANGULAR_SPEED
  let orientation = entity.orientation ?? DEFAULT_ORIENTATION

  const direction = toRange(target.orientation - orientation)
  const distance = abs(direction)

  if (distance < targetRadius) {
    return entity
  }

  let targetAngularSpeed
  if (distance > slowRadius) {
    targetAngularSpeed = maxAngularSpeed
  } else {
    targetAngularSpeed = (distance * maxAngularSpeed) / slowRadius
  }
  targetAngularSpeed *= direction / distance // restore rotation sign

  const angularSpeedDelta = targetAngularSpeed - angularSpeed

  let angularAcceleration = angularSpeedDelta / timeToTarget
  angularAcceleration = clamp(
    angularAcceleration,
    -maxAngularAcceleration,
    maxAngularAcceleration,
  )

  angularSpeed += angularAcceleration * dt
  orientation +=
    angularSpeed * dt +
    angularAcceleration * HALF_ANGULAR_ACCELERATION * dt * dt

  return { angularSpeed, orientation }
}
