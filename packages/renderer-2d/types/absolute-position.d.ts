import type { Render } from "@inglorious/engine"

/** Draws `render` from the entity's position, with y up. */
export function absolutePosition<TRender extends Render<never, never>>(
  render: TRender,
): TRender
