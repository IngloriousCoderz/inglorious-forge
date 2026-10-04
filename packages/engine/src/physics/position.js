import { anchorMargins, shapeAnchor } from "./anchor.js"

const Y = 1

/**
 * Where an entity's position has to be for it to come to rest on top of a
 * target, given that both are positioned by their anchor rather than their
 * centre.
 */
export function calculateLandingPosition(
  entity,
  target,
  collisionGroup = "platform",
) {
  const entityShape = entity.collisions[collisionGroup]?.shape

  if (CalculatePY[entityShape]) {
    return CalculatePY[entityShape](entity, target, collisionGroup)
  }

  return calculatePYForPoint(entity, target, collisionGroup)
}

/**
 * How far the top edge of a shape sits above the point it is anchored to.
 */
function topOf(target, collisionGroup) {
  const collision = target.collisions[collisionGroup]
  const { after } = anchorMargins(
    shapeAnchor(target, collision),
    collision.size ?? target.size,
  )

  return target.position[Y] + after[Y]
}

function calculatePYForPoint(entity, target, collisionGroup) {
  return topOf(target, collisionGroup)
}

function calculatePYForCircle(entity, target, collisionGroup) {
  const entityRadius = entity.collisions[collisionGroup].radius ?? entity.radius

  return topOf(target, collisionGroup) + entityRadius
}

function calculatePYForRectangle(entity, target, collisionGroup) {
  const collision = entity.collisions[collisionGroup]
  const { before } = anchorMargins(
    shapeAnchor(entity, collision),
    collision.size ?? entity.size,
  )

  return topOf(target, collisionGroup) + before[Y]
}

const CalculatePY = {
  point: calculatePYForPoint,
  circle: calculatePYForCircle,
  rectangle: calculatePYForRectangle,
}
