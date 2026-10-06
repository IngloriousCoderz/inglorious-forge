import { namesNear } from "@inglorious/utils/data-structures/string.js"

/**
 * Checks that every entity in a configuration has a type that was declared.
 *
 * A type that was never declared is not an error anywhere downstream: it augments into an
 * empty type, so the entity stands there with none of the handlers, rendering or collision
 * its type was meant to give it, and every event sent to it goes nowhere. Nothing about
 * that looks wrong where it happens, which is why it is worth saying so before the game
 * starts rather than after.
 *
 * @example
 * ```js
 * import { assertTypesAreDeclared } from "@inglorious/engine/core/types.js"
 *
 * assertTypesAreDeclared(config)
 * ```
 *
 * @param {object} config - A game configuration.
 * @throws {Error} If an entity names a type the configuration does not declare.
 */
export function assertTypesAreDeclared(config) {
  const declared = Object.keys(config.types ?? {})

  const undeclared = Object.entries(config.entities ?? {}).filter(
    ([, entity]) => entity?.type && !declared.includes(entity.type),
  )

  if (!undeclared.length) return

  const problems = undeclared.map(([id, entity]) => {
    const near = namesNear(entity.type, declared)

    return [
      `  ${id} has type "${entity.type}", which is not declared`,
      near.length
        ? `    did you mean ${near.map((name) => `"${name}"`).join(" or ")}?`
        : `    declared types are: ${declared.join(", ")}`,
    ].join("\n")
  })

  throw new Error(
    [
      `${undeclared.length} of the entities in this game name a type that is not declared.`,
      "An undeclared type gives an entity no handlers at all, so everything sent to it is",
      "silently dropped.",
      ...problems,
    ].join("\n"),
  )
}
