import { anchorOffset, shapeAnchor } from "@inglorious/engine/physics/anchor.js"
import * as circle from "@inglorious/utils/math/circle.js"
import * as hitmask from "@inglorious/utils/math/hitmask.js"
import * as line from "@inglorious/utils/math/line.js"
import * as point from "@inglorious/utils/math/point.js"
import * as rectangle from "@inglorious/utils/math/rectangle.js"
import * as segment from "@inglorious/utils/math/segment.js"
import { filter } from "@inglorious/utils/object.js"
import { add, zero } from "@inglorious/utils/vectors.js"

const Z = 2 // Z-axis index.
const RECTANGLE = "rectangle"

const Shape = {
  circle,
  line,
  point,
  rectangle,
  segment,
  hitmask,
}

/**
 * Finds the first collision between a point and a list of entities.
 *
 * @param {Point} entity - The point to check for collisions.
 * @param {Options} options - Options for collision detection.
 * @returns {Entity | undefined} The first entity that collides with the point, or undefined if none are found.
 */
export function findCollision(entity, entities, collisionGroup = "hitbox") {
  const otherEntities = filter(
    entities,
    (id, other) => id !== entity.id && collisionGroupOf(other, collisionGroup),
  )

  return Object.values(otherEntities)
    .toSorted((a, b) => a.position[Z] - b.position[Z])
    .find((target) => collidesWith(entity, target, collisionGroup))
}

export function collidesWith(entity, target, collisionGroup = "hitbox") {
  const entityShape = getCollisionShape(entity, collisionGroup)
  const targetShape = getCollisionShape(target, collisionGroup)

  if (!entityShape || !targetShape) {
    return false
  }

  return shapeCollidesWith(entityShape, targetShape)
}

function shapeCollidesWith(entity, target) {
  const shapeFns = Shape[entity.shape]

  switch (target.shape) {
    case "circle":
      return shapeFns.intersectsCircle(entity, target)

    case "line":
      return shapeFns.intersectsLine(entity, target)

    case "point":
      return shapeFns.intersectsPoint(entity, target)

    case "rectangle":
      return shapeFns.intersectsRectangle(entity, target)

    case "segment":
      return shapeFns.intersectsSegment(entity, target)
  }
}

export function findCollisions(entity, target, collisionGroup = "hitbox") {
  const entityShape = getCollisionShape(entity, collisionGroup)
  const targetShape = getCollisionShape(target, collisionGroup)

  if (!entityShape || !targetShape) {
    return false
  }

  const shapeFns = Shape[entityShape.shape]
  if (!shapeFns || !shapeFns.findCollisions) {
    return false
  }

  return shapeFns.findCollisions(entityShape, targetShape)
}

/**
 * Correctly calculates the absolute position and size of an entity's
 * collision shape, including any offsets and the anchor the shape hangs from.
 *
 * The shape is reported by its centre, which is where the collision maths wants
 * it, so an anchored shape is shifted off its position by half the room it does
 * not take up on that side.
 */
/**
 * The collision an entity has in a group, if it has one.
 *
 * Exported so that anything drawing a collision draws the one that actually happens,
 * rather than a second guess at it.
 *
 * A `solid` entity has one without being told what shape it is: the shape is its size.
 * That is the shape almost everything solid wants, and naming it every time is three
 * lines of configuration saying nothing.
 *
 * It is asked for rather than assumed from the presence of a `size`, because plenty of
 * things have a size and are not in the way: a line of text, a frame counter, anything
 * measured in pixels rather than in space.
 */
export function collisionGroupOf(entity, collisionGroup) {
  const collision = entity.collisions?.[collisionGroup]

  if (collision) return collision

  return entity.solid ? { shape: RECTANGLE } : null
}

function getCollisionShape(entity, collisionGroup = "hitbox") {
  const collision = collisionGroupOf(entity, collisionGroup)
  if (!collision) {
    return null
  }

  const size = collision.size ?? entity.size

  const position = add(
    entity.position,
    anchorOffset(shapeAnchor(entity, collision), size),
    collision.offset ?? zero(),
    entity.offset ?? zero(),
  )

  return {
    ...collision,
    position,
    size,
    radius: collision.radius ?? entity.radius,
  }
}
