import type { Render } from "@inglorious/engine"

/** Draws `render` twice when the entity's image has a `loop`, so it repeats seamlessly. */
export function infiniteLoop<TRender extends Render<never, never>>(
  render: TRender,
): TRender
