import type { Entity } from "@inglorious/engine"

export interface CharacterEntity extends Omit<Entity, "size"> {
  /** The diameter. Defaults to 24. */
  size?: number
}

/** Draws a circle with an arrow showing where it faces. */
export function renderCharacter(
  entity: CharacterEntity,
  ctx: CanvasRenderingContext2D,
): void
