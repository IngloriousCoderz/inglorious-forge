import type { FpsEntity } from "@inglorious/engine/behaviors/fps.js"

import type { TextEntity } from "./text"

/** Writes the frames per second that `fps` reads. */
export function renderFps(
  entity: Omit<TextEntity, "dt"> & Required<Pick<FpsEntity, "dt">>,
  ctx: CanvasRenderingContext2D,
): void
