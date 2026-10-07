import { snap, zero } from "@inglorious/utils/vector.js"

/**
 * Places an entity on the canvas.
 *
 * This is where the Inglorious coordinate system becomes screen coordinates.
 * The world is y-up with the origin on the floor, while canvas `y` grows
 * downwards from the top-left corner, so both vertical axes are inverted here:
 *
 * ```text
 * canvasX = x
 * canvasY = gameHeight - y - z
 * ```
 *
 * A position of `(0, 0, 0)` therefore lands on the bottom-left corner of the
 * canvas, and raising either `y` or `z` moves the entity up the screen.
 */
export function absolutePosition(render) {
  return (entity, ctx, api) => {
    const { position = zero() } = entity
    const [x, y, z] = snap(position)

    const game = api.getEntity("game")
    const [, gameHeight] = game.size

    ctx.save()

    ctx.translate(x, gameHeight - y - z)
    render(entity, ctx, api)

    ctx.restore()
  }
}
