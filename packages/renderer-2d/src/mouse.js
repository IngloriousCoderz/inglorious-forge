/* eslint-disable no-magic-numbers */

const CROSSHAIR = "crosshair"
const ARROW = "arrow"
const HAND = "hand"

/**
 * Draws the pointer, as whatever kind of pointer it currently is.
 *
 * A crosshair unless told otherwise, because that is what it has always drawn and games
 * already out there are pointing with it. An arrow for games with things to point at,
 * and a hand for when it is over one of them -- which the game says by writing
 * `cursor` on its mouse, rather than the renderer going looking for what is underneath.
 *
 * @param {object} entity - The mouse being drawn.
 * @param {CanvasRenderingContext2D} ctx - The context to draw into.
 */
export function renderMouse(entity, ctx) {
  const {
    cursor = CROSSHAIR,
    color = "black",
    outlineColor = "black",
    thickness = 1,
    orientation = 0,
  } = entity

  ctx.save()

  // The crosshair is drawn in one colour throughout. The arrow and the hand are filled
  // in one colour and outlined in another instead, which is what keeps a white pointer
  // readable on a white background: without the outline its edges go soft grey and the
  // whole of it washes out wherever the game is light.
  ctx.fillStyle = color
  ctx.strokeStyle = cursor === CROSSHAIR ? color : outlineColor
  ctx.lineWidth = thickness
  ctx.lineJoin = "round"

  ctx.rotate(-orientation)

  cursors[cursor]?.(ctx)

  ctx.restore()
}

const cursors = {
  [CROSSHAIR]: drawCrosshair,
  [ARROW]: drawArrow,
  [HAND]: drawHand,
}

/** Four ticks with a gap in each, and a dot in the middle. */
function drawCrosshair(ctx) {
  ctx.beginPath()
  ctx.moveTo(-6, 0)
  ctx.lineTo(-3, 0)
  ctx.stroke()

  ctx.moveTo(4, 0)
  ctx.lineTo(7, 0)
  ctx.stroke()

  ctx.moveTo(0, -6)
  ctx.lineTo(0, -3)
  ctx.stroke()

  ctx.moveTo(0, 4)
  ctx.lineTo(0, 7)
  ctx.stroke()
  ctx.closePath()

  ctx.beginPath()
  ctx.fillRect(0, 0, 1, 1)
  ctx.closePath()
}

/**
 * The everyday pointer, tip at the top-left where the finger is.
 *
 * Drawn pointing up and to the left on the canvas, which is up and to the left in the
 * world as well: the renderer flips both vertical axes together, so a shape that leans
 * one way on the canvas leans the same way in the game.
 */
function drawArrow(ctx) {
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(0, 15)
  ctx.lineTo(3.8, 11.4)
  ctx.lineTo(5.6, 16.4)
  ctx.lineTo(7.4, 15.6)
  ctx.lineTo(5.6, 10.7)
  ctx.lineTo(9.2, 10.7)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
}

/**
 * A hand with its finger out, for when there is something to press.
 *
 * One polygon rather than a handful of boxes, so the whole of it is filled and outlined
 * in one go: finger up, thumb out to the left, two knuckles suggested on the right for
 * the fingers curled underneath.
 */
function drawHand(ctx) {
  ctx.beginPath()
  ctx.moveTo(3.5, 0)
  ctx.lineTo(6, 0)
  ctx.lineTo(6, 6)
  ctx.lineTo(10.3, 6)
  ctx.lineTo(10.3, 7.2)
  ctx.lineTo(12.6, 7.2)
  ctx.lineTo(12.6, 13.5)
  ctx.lineTo(9.4, 14.5)
  ctx.lineTo(3.5, 14.5)
  ctx.lineTo(2.8, 14)
  ctx.lineTo(2.8, 13.5)
  ctx.lineTo(0.3, 8.8)
  ctx.lineTo(1.2, 8.8)
  ctx.lineTo(3.5, 7.2)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
}
