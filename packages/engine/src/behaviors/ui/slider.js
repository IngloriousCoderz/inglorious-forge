import { clamp, snap } from "@inglorious/utils/math/number.js"

const X = 0
const NO_EXTENT = 0
const HALF = 2
// How far along the track a point is, from nothing of the way to all of it.
const START_OF_TRACK = 0
const END_OF_TRACK = 1
const DEFAULT_MIN = 0
const DEFAULT_MAX = 1
// A step of nothing means every pixel the pointer moves is a step of its own, which is
// what a slider wants when nothing has asked for round numbers.
const WHOLE = 0

/**
 * A control that is dragged rather than clicked.
 *
 * It follows the pointer from the moment it is pressed until the moment it is released,
 * which is why it answers `entityPress` and `mouseMove` rather than `entityClick`: a
 * slider is read by where the finger is, not by where it lands.
 *
 * Every change is announced as `valueChange`, carrying the id of the slider that moved
 * and the number it moved to. Whoever wants to do something about a change is told
 * about it rather than left to go looking for it, and each slider reads its own id back
 * out of the report so that thirteen of them can be on the screen at once.
 *
 * @param {Object} [bounds] - The range the value is kept inside.
 * @param {number} [bounds.min] - The lowest value it will take.
 * @param {number} [bounds.max] - The highest.
 * @param {number} [bounds.step] - How much the value moves at a time.
 */
export function slider({
  min = DEFAULT_MIN,
  max = DEFAULT_MAX,
  step = WHOLE,
} = {}) {
  return (type) => ({
    create(entity, payload, api) {
      type.create?.(entity, payload, api)

      entity.collisions ??= {}

      // A slider with a size is a slider there is room to grab. Saying so here means a
      // game does not have to describe the same rectangle twice: once to draw it and
      // once to be hit by it.
      entity.collisions.hitbox ??= { shape: "rectangle" }

      entity.min ??= min
      entity.max ??= max
      entity.step ??= step
      entity.value ??= entity.min
      entity.isDragging ??= false
    },

    entityPress(entity, id) {
      if (id !== entity.id) return

      entity.isDragging = true
    },

    // The pointer is told to every entity, so a slider that is not being dragged has to
    // ignore what it hears. Only a dragged one takes its value from where it stands.
    mouseMove(entity, position, api) {
      if (!entity.isDragging) return

      set(entity, valueUnder(entity, position[X]), api)
    },

    entityRelease(entity, id) {
      if (id !== entity.id) return

      entity.isDragging = false
    },
  })
}

/**
 * Sets the value and says so, if it has actually moved.
 *
 * The announcement is only made when the number really changed, because a drag across a
 * slider with a step of a hundredth crosses a hundred announcements of which all but one
 * are the same number said again.
 */
function set(entity, value, api) {
  if (value === entity.value) return

  entity.value = value
  api.notify("valueChange", { entityId: entity.id, value })
}

/**
 * The value that falls under a point on the track.
 *
 * Read off the track the same way the renderer draws it -- centred on the position
 * rather than hung off an anchor -- so that where a slider is grabbed is exactly where
 * it is seen, whatever it is anchored to.
 */
function valueUnder(entity, x) {
  const [width = NO_EXTENT] = entity.size ?? []

  const start = entity.position[X] - width / HALF
  const across = width
    ? clamp((x - start) / width, START_OF_TRACK, END_OF_TRACK)
    : START_OF_TRACK

  return atStep(entity, entity.min + across * (entity.max - entity.min))
}

/** The nearest value the slider is willing to sit on. */
function atStep(entity, value) {
  const bounded = clamp(value, entity.min, entity.max)

  return entity.step ? snap(bounded, entity.step) : bounded
}
