import type { StateChangePayload } from "@inglorious/store/fsm"

import type { Decorator, Entity, Handler } from "../../index"
import type { InputMapping } from "./keyboard"

export interface MappedEntity extends Entity {
  state?: string
}

/** Notifies `mappingChange` with what each state of the entity's machine answers to. */
export function mappings(
  mappingsByState: Record<string, InputMapping>,
): Decorator<{
  create: Handler<MappedEntity, unknown>
  stateChange: Handler<MappedEntity, StateChangePayload>
}>
