import type { GameConfig } from "../index"

/** Throws when an entity names a type the configuration does not declare. */
export function assertTypesAreDeclared(config: GameConfig): void
