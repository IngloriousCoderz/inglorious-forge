import type { Vector3 } from "@inglorious/utils/vector.js"

import type { Anchor, Collision, Entity } from "../index"

export const CENTER: Vector3
export const DEFAULT_ANCHOR: Vector3
export const TOP_LEFT: Vector3
export const TOP_CENTER: Vector3
export const TOP_RIGHT: Vector3
export const LEFT: Vector3
export const RIGHT: Vector3
export const BOTTOM_LEFT: Vector3
export const BOTTOM_CENTER: Vector3
export const BOTTOM_RIGHT: Vector3

/** The entity's anchor, its image's, or the centre. */
export function entityAnchor(
  entity: Pick<Entity, "anchor"> & { image?: { anchor?: Anchor } },
): Anchor

/** A collision shape's anchor, or its entity's. */
export function shapeAnchor(
  entity: Pick<Entity, "anchor"> & { image?: { anchor?: Anchor } },
  collision: Pick<Collision, "anchor">,
): Anchor

/** How far a box's centre is from the point it hangs from. */
export function anchorOffset(
  anchor: Anchor | undefined,
  size: readonly number[] | undefined,
): Vector3

/** The room a box takes before and after the point it hangs from, on each axis. */
export function anchorMargins(
  anchor: Anchor | undefined,
  size: readonly number[] | undefined,
): { before: Vector3; after: Vector3 }
