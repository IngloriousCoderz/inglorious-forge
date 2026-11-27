import type { Entity, Handler } from "../../index"

/** What each movement action is: `true` while held, or a stick's value from -1 to 1. */
export type Movement = Partial<Record<string, boolean | number>>

export interface MovingEntity extends Entity {
  movement?: Movement
}

/** The handlers `createMovementEventHandlers` makes for `TName`, and their `…End`. */
export type MovementHandlers<TName extends string> = {
  [K in TName]: Handler<MovingEntity, { value: number } | undefined>
} & {
  [K in TName as `${K}End`]: Handler<MovingEntity>
}

/** Records each action on the entity's `movement` while it is held. */
export function createMovementEventHandlers<TName extends string>(
  events: TName[],
): MovementHandlers<TName>
