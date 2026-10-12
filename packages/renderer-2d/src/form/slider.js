/* eslint-disable no-magic-numbers */

import { renderText } from "@inglorious/renderer-2d/text.js"
import { clamp } from "@inglorious/utils/math/number.js"

const NO_OFFSET = 0
const DEFAULT_SIZE = [100, 20]
const DEFAULT_MIN = 0
const DEFAULT_MAX = 1
const DEFAULT_THICKNESS = 4
const KNOB = 10
const LABEL_GAP = 12
const LABEL_SIZE = 13
const HALF = 2

/**
 * Draws a slider: a track, the part of it up to the current value, and a knob to grab.
 *
 * Laid out along `x` like a button is laid out on its position rather than off its
 * anchor, because a track that hangs off its own anchor is a track whose hitbox and
 * whose drawing would have to be kept in step for no gain.
 *
 * The name of the parameter sits to the left of the track and its number to the right,
 * both on the middle line: a control whose value is somewhere else on the screen is a
 * value you have to go and find.
 *
 * @param {object} entity - The slider being drawn.
 * @param {CanvasRenderingContext2D} ctx - The context to draw into.
 */
export function renderSlider(entity, ctx) {
  const {
    size = DEFAULT_SIZE,
    color = "white",
    backgroundColor = "rgb(60, 72, 84)",
    label = "",
    labelColor = color,
    labelSize = LABEL_SIZE,
    thickness = DEFAULT_THICKNESS,
    min = DEFAULT_MIN,
    max = DEFAULT_MAX,
    step = 0,
    value = min,
  } = entity

  const [width = DEFAULT_SIZE[0]] = size ?? []
  const start = -width / HALF
  const knob = start + clamp((value - min) / (max - min), 0, 1) * width

  ctx.save()

  ctx.fillStyle = backgroundColor
  ctx.fillRect(start, -thickness / HALF, width, thickness)

  ctx.fillStyle = color
  ctx.fillRect(start, -thickness / HALF, knob - start, thickness)
  ctx.fillRect(knob - KNOB / HALF, -KNOB / HALF, KNOB, KNOB)

  ctx.restore()

  // The entity is said first in each, for the same reason a button says it that way: a
  // slider's own `size` is its track, not the size of the lettering on it.
  //
  // The label is left out when there is nothing to say, because `renderText` draws an
  // empty string as a real call.
  if (label) {
    write(
      { ...entity, value: label, size: labelSize, color: labelColor },
      ctx,
      start - LABEL_GAP,
      "right",
    )
  }

  write(
    {
      ...entity,
      value: show(value, step),
      size: labelSize,
      color: labelColor,
    },
    ctx,
    start + width + LABEL_GAP,
    "left",
  )
}

/**
 * What the number reads as.
 *
 * Shown with as many decimals as the step has, because a slider that moves in hundredths
 * and reads out fifteen of them is not showing its value but its arithmetic. A slider
 * with no step shows what it was given.
 */
function show(value, step) {
  if (!step) return String(value)

  const [, decimals = ""] = String(step).split(".")

  return value.toFixed(decimals.length)
}

/**
 * Draws one line of a slider's text, set a little to one side of its position.
 *
 * The renderer has already moved the canvas onto the slider, so the offset is the only
 * thing left to apply here -- and it is applied and undone around the text rather than
 * left on the canvas for whatever is drawn next.
 */
function write(text, ctx, offset, align) {
  ctx.save()

  ctx.translate(offset, NO_OFFSET)

  renderText({ ...text, textAlign: align, baseline: "middle" }, ctx)

  ctx.restore()
}
