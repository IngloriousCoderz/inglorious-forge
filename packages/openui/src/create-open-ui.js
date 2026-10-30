import { nothing } from "@inglorious/web"
import { createStreamingParser, evaluate } from "@openuidev/lang-core"

import { createIconResolver } from "./icons.js"
import { createContext, findBoundVariables, renderProgram } from "./runtime.js"
import { queryKey, toCallTool } from "./tools.js"

/**
 * @typedef {import('../types').OpenUIOptions} OpenUIOptions
 * @typedef {import('../types').OpenUIType} OpenUIType
 * @typedef {import('../types').OpenUIEntity} OpenUIEntity
 */

const SECOND_MS = 1000
/** A refresh interval of none: the query runs only when asked. */
const NO_REFRESH = 0
/** How long a Callout bound to a `$variable` shows before it clears it. */
const CALLOUT_MS = 3000

/**
 * Creates the Inglorious type that renders OpenUI Lang with a library.
 *
 * Each entity of the type is one answer from the model: its text in
 * `response`, whether it is still arriving in `isStreaming`, the values its
 * `$variables` and fields hold in `values`, and the results of its `Query`
 * and `Mutation` calls in `queries` and `mutations`. Streaming is three
 * events, `streamStart`, `chunk` and `streamEnd`, so the answer renders as it
 * arrives, and a finished one can be set at once with `responseChange`.
 *
 * Queries call the app's tools through `toolProvider` once the answer is
 * whole, and again whenever their arguments change. What the answer asks of
 * the app, such as a message back to the assistant, is announced as an
 * `openuiAction` event for the type that talks to the model to handle.
 *
 * @param {OpenUIOptions} options
 * @returns {OpenUIType}
 */
export function createOpenUI({ library, toolProvider, icons }) {
  const schema = library.toJSONSchema()
  const functions = Object.fromEntries(
    Object.entries(schema.functions ?? {}).flatMap(([name, definition]) => {
      const fn = library.functions?.[name]?.fn
      return fn ? [[name, { ...definition, fn }]] : []
    }),
  )
  const callTool = toCallTool(toolProvider)
  const iconFor = createIconResolver(icons)

  /**
   * One streaming parser per entity, with its latest result, the timers
   * refreshing its queries and those hiding its Callouts. None is state the
   * store should hold, so they live here, keyed by entity id, and go when the
   * entity does.
   * @type {Map<string, { parser: import('@openuidev/lang-core').StreamParser, response?: string, isComplete?: boolean, result?: import('@openuidev/lang-core').ParseResult, timers: Map<string, { seconds: number, timer: ReturnType<typeof setInterval> }>, dismissals: Map<string, ReturnType<typeof setTimeout>> }>}
   */
  const runtimes = new Map()

  function runtimeOf(entity) {
    let runtime = runtimes.get(entity.id)
    if (!runtime) {
      runtime = {
        parser: createStreamingParser(schema, library.root),
        timers: new Map(),
        dismissals: new Map(),
      }
      runtimes.set(entity.id, runtime)
    }
    return runtime
  }

  /** The parse of the entity's response, re-parsed only when it changed. */
  function parse(entity) {
    const runtime = runtimeOf(entity)
    const isComplete = !entity.isStreaming
    if (
      runtime.response !== entity.response ||
      runtime.isComplete !== isComplete
    ) {
      runtime.result = runtime.parser.set(entity.response, isComplete)
      runtime.response = entity.response
      runtime.isComplete = isComplete
    }
    return runtime.result
  }

  /** Validation errors are only worth reporting once the answer is whole. */
  function settle(entity, api) {
    entity.isStreaming = false
    entity.errors = parse(entity).meta.errors
    syncQueries(entity, api)
    syncCallouts(entity, api)
  }

  /**
   * A Callout bound to a `$variable`, as in `Callout(..., $saved)`, clears it
   * a few seconds after it turns true, as OpenUI's does. Run after anything
   * that changes values.
   */
  function syncCallouts(entity, api) {
    if (entity.isStreaming) return

    const { id } = entity
    const { dismissals } = runtimeOf(entity)
    const result = parse(entity)
    const { getValue } = createContext({
      entity,
      result,
      functions,
      actions: schema.actions,
    })
    const shown = [
      ...findBoundVariables({
        entity,
        result,
        library,
        functions,
        actions: schema.actions,
        typeName: "Callout",
        prop: "visible",
      }),
    ].filter((name) => getValue(name) === true)

    for (const [name, timer] of dismissals) {
      if (shown.includes(name)) continue
      clearTimeout(timer)
      dismissals.delete(name)
    }
    for (const name of shown) {
      if (dismissals.has(name)) continue
      dismissals.set(
        name,
        setTimeout(() => {
          dismissals.delete(name)
          api.notify(`#${id}:valueChange`, { name, value: false })
        }, CALLOUT_MS),
      )
    }
  }

  /**
   * Fetches every query whose tool or arguments changed since it last ran,
   * and drops the queries the answer no longer has. Run after anything that
   * a query's arguments can read.
   */
  function syncQueries(entity, api) {
    if (!callTool || entity.isStreaming) return

    const result = parse(entity)
    const { context } = createContext({
      entity,
      result,
      functions,
      actions: schema.actions,
    })
    const live = new Set()

    for (const node of result.queryStatements) {
      if (!node.complete) continue
      live.add(node.statementId)

      const tool = evaluate(node.toolAST, context)
      const args = node.argsAST ? evaluate(node.argsAST, context) : {}
      const key = queryKey(tool, args)
      const previous = entity.queries[node.statementId]

      if (previous?.key !== key) {
        entity.queries[node.statementId] = {
          key,
          tool,
          args,
          status: "loading",
          data: previous
            ? previous.data
            : node.defaultsAST
              ? evaluate(node.defaultsAST, context)
              : null,
          error: null,
        }
        fetchQuery(
          entity.id,
          node.statementId,
          entity.queries[node.statementId],
          api,
        )
      }

      const seconds = node.refreshAST
        ? evaluate(node.refreshAST, context)
        : NO_REFRESH
      scheduleRefresh(entity.id, node.statementId, seconds, api)
    }

    for (const statementId of Object.keys(entity.queries)) {
      if (live.has(statementId)) continue
      delete entity.queries[statementId]
      scheduleRefresh(entity.id, statementId, NO_REFRESH, api)
    }
  }

  /**
   * Calls the query's tool and reports back as an event. The arguments go
   * out as a plain copy: the entity's own are only readable while the handler
   * that started the call runs, and a tool may read them later.
   */
  function fetchQuery(id, statementId, { key, tool, args }, api) {
    callTool(tool, JSON.parse(JSON.stringify(args ?? {}))).then(
      (data) =>
        api.notify(`#${id}:querySuccess`, {
          statementId,
          key,
          data: data ?? null,
        }),
      (error) => {
        console.error(`[openui] Query "${tool}" failed:`, error)
        api.notify(`#${id}:queryError`, {
          statementId,
          key,
          error: error instanceof Error ? error.message : String(error),
        })
      },
    )
  }

  /** Keeps a query's refresh timer in step with its interval, in seconds. */
  function scheduleRefresh(id, statementId, seconds, api) {
    const { timers } = runtimes.get(id)
    const current = timers.get(statementId)
    const interval =
      typeof seconds === "number" && seconds > NO_REFRESH ? seconds : NO_REFRESH
    if (current?.seconds === interval) return

    if (current) clearInterval(current.timer)
    timers.delete(statementId)
    if (!interval) return

    timers.set(statementId, {
      seconds: interval,
      timer: setInterval(
        () => api.notify(`#${id}:queriesRun`, [statementId]),
        interval * SECOND_MS,
      ),
    })
  }

  function stopTimers(id) {
    const runtime = runtimes.get(id)
    if (!runtime) return
    for (const { timer } of runtime.timers.values()) clearInterval(timer)
    runtime.timers.clear()
    for (const timer of runtime.dismissals.values()) clearTimeout(timer)
    runtime.dismissals.clear()
  }

  return {
    create(entity, _, api) {
      entity.response ??= ""
      entity.isStreaming ??= false
      entity.values ??= {}
      entity.errors ??= []
      entity.view ??= {}
      entity.fieldErrors = {}
      entity.queries = {}
      entity.mutations = {}
      if (entity.response && !entity.isStreaming) settle(entity, api)
    },

    destroy(entity) {
      stopTimers(entity.id)
      runtimes.delete(entity.id)
    },

    /** A new answer starts arriving: what the last one held is gone. */
    streamStart(entity) {
      stopTimers(entity.id)
      entity.response = ""
      entity.isStreaming = true
      entity.values = {}
      entity.view = {}
      entity.fieldErrors = {}
      entity.errors = []
      entity.queries = {}
      entity.mutations = {}
    },

    chunk(entity, text) {
      entity.response += text
    },

    streamEnd(entity, _, api) {
      settle(entity, api)
    },

    /** A whole answer at once, such as one restored from history. */
    responseChange(entity, response, api) {
      stopTimers(entity.id)
      entity.response = response
      entity.values = {}
      entity.view = {}
      entity.fieldErrors = {}
      entity.queries = {}
      entity.mutations = {}
      settle(entity, api)
    },

    valueChange(entity, { name, value }, api) {
      entity.values[name] = value
      syncQueries(entity, api)
      syncCallouts(entity, api)
    },

    /** A field inside a Form: its value is kept under the form's name. */
    fieldChange(entity, { formName, name, value }, api) {
      entity.values[formName] = { ...entity.values[formName], [name]: value }
      if (entity.fieldErrors[formName])
        delete entity.fieldErrors[formName][name]
      syncQueries(entity, api)
    },

    /** What failed when a form's fields were last checked, by field name. */
    fieldErrorsChange(entity, { formName, errors }) {
      entity.fieldErrors[formName] = errors
    },

    viewChange(entity, { key, value }) {
      entity.view[key] = value
    },

    /** Back to the defaults the answer declares. */
    valuesReset(entity, names, api) {
      for (const name of names) delete entity.values[name]
      syncQueries(entity, api)
      syncCallouts(entity, api)
    },

    /** Fetches queries again, such as on `@Run` or a refresh interval. */
    queriesRun(entity, statementIds, api) {
      for (const statementId of statementIds) {
        const query = entity.queries[statementId]
        if (!query || query.status === "loading") continue
        query.status = "loading"
        fetchQuery(entity.id, statementId, query, api)
      }
    },

    querySuccess(entity, { statementId, key, data }) {
      const query = entity.queries[statementId]
      if (query?.key !== key) return
      query.status = "success"
      query.data = data
      query.error = null
    },

    queryError(entity, { statementId, key, error }) {
      const query = entity.queries[statementId]
      if (query?.key !== key) return
      query.status = "error"
      query.error = error
    },

    mutationStart(entity, { statementId }) {
      entity.mutations[statementId] = {
        status: "loading",
        data: null,
        error: null,
      }
    },

    mutationSuccess(entity, { statementId, data }) {
      entity.mutations[statementId] = { status: "success", data, error: null }
    },

    mutationError(entity, { statementId, error }) {
      entity.mutations[statementId] = { status: "error", data: null, error }
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
        callTool,
        iconFor,
      })
    },
  }
}
