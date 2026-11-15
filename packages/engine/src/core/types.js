import { namesNear } from "@inglorious/utils/data-structures/string.js"

/**
 * Throws when an entity names a type the configuration does not declare, with
 * the nearest declared names: such an entity would silently get no handlers.
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
