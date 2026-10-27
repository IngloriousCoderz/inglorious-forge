import { markReactive } from "@openuidev/lang-core"

/**
 * Marks a prop schema as bindable to a `$variable`, as in
 * `Input("search", $query)`: the field shows the variable and writes back to
 * it. Read it in the component with `stateField(name, props.value)`.
 * @template T
 * @param {T} schema
 * @returns {T}
 */
export function reactive(schema) {
  markReactive(schema)
  return schema
}
