import { nothing } from "@inglorious/web"
import { createStreamingParser } from "@openuidev/lang-core"

import { renderProgram } from "./runtime.js"

/**
 * @typedef {import('../types').OpenUIOptions} OpenUIOptions
 * @typedef {import('../types').OpenUIType} OpenUIType
 * @typedef {import('../types').OpenUIEntity} OpenUIEntity
 */

/**
 * Creates the Inglorious type that renders OpenUI Lang with a library.
 *
 * Each entity of the type is one answer from the model: its text in
 * `response`, whether it is still arriving in `isStreaming`, and the values
 * the answer's `$variables` and fields hold in `values`. Streaming is three
 * events, `streamStart`, `chunk` and `streamEnd`, so the answer renders as it
 * arrives, and a finished one can be set at once with `responseChange`.
 *
 * What the answer asks of the app, such as a message back to the assistant,
 * is announced as an `openuiAction` event for the type that talks to the
 * model to handle.
 *
 * @param {OpenUIOptions} options
 * @returns {OpenUIType}
 */
export function createOpenUI({ library }) {
  const schema = library.toJSONSchema()
  const functions = Object.fromEntries(
    Object.entries(schema.functions ?? {}).flatMap(([name, definition]) => {
      const fn = library.functions?.[name]?.fn
      return fn ? [[name, { ...definition, fn }]] : []
    }),
  )

  /**
   * One streaming parser per entity, with its latest result. A parser is not
   * state the store should hold, so it lives here, keyed by entity id, and
   * goes when the entity does.
   * @type {Map<string, { parser: import('@openuidev/lang-core').StreamParser, response?: string, isComplete?: boolean, result?: import('@openuidev/lang-core').ParseResult }>}
   */
  const parses = new Map()

  /** The parse of the entity's response, re-parsed only when it changed. */
  function parse(entity) {
    let entry = parses.get(entity.id)
    if (!entry) {
      entry = { parser: createStreamingParser(schema, library.root) }
      parses.set(entity.id, entry)
    }

    const isComplete = !entity.isStreaming
    if (entry.response !== entity.response || entry.isComplete !== isComplete) {
      entry.result = entry.parser.set(entity.response, isComplete)
      entry.response = entity.response
      entry.isComplete = isComplete
    }
    return entry.result
  }

  /** Validation errors are only worth reporting once the answer is whole. */
  function settle(entity) {
    entity.isStreaming = false
    entity.errors = parse(entity).meta.errors
  }

  return {
    create(entity) {
      entity.response ??= ""
      entity.isStreaming ??= false
      entity.values ??= {}
      entity.errors ??= []
      if (entity.response && !entity.isStreaming) settle(entity)
    },

    destroy(entity) {
      parses.delete(entity.id)
    },

    /** A new answer starts arriving: what the last one held is gone. */
    streamStart(entity) {
      entity.response = ""
      entity.isStreaming = true
      entity.values = {}
      entity.errors = []
    },

    chunk(entity, text) {
      entity.response += text
    },

    streamEnd(entity) {
      settle(entity)
    },

    /** A whole answer at once, such as one restored from history. */
    responseChange(entity, response) {
      entity.response = response
      entity.values = {}
      settle(entity)
    },

    valueChange(entity, { name, value }) {
      entity.values[name] = value
    },

    /** Back to the defaults the answer declares. */
    valuesReset(entity, names) {
      for (const name of names) delete entity.values[name]
    },

    render(entity, api) {
      const result = parse(entity)
      if (!result.root && !result.rootExpression) return nothing

      return renderProgram({
        entity,
        api,
        result,
        library,
        functions,
        actions: schema.actions,
      })
    },
  }
}
