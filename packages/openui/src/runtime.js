import { nothing } from "@inglorious/web"
import {
  ACTION_STEPS,
  BuiltinActionType,
  evaluate,
  evaluateRoot,
  resolveStateField,
} from "@openuidev/lang-core"

/**
 * @typedef {import('@openuidev/lang-core').ParseResult} ParseResult
 * @typedef {import('@openuidev/lang-core').ActionPlan} ActionPlan
 * @typedef {import('@openuidev/lang-core').Library} Library
 * @typedef {import('../types').OpenUIEntity} OpenUIEntity
 */

/**
 * Renders a parsed program against an entity's values.
 *
 * The values the program reads and writes, its `$variables` and its fields,
 * live in `entity.values`, falling back to the defaults the program declares.
 * Everything that changes them is an event on the entity, so the store stays
 * the one source of truth and a render is a pure function of it.
 *
 * @param {object} options
 * @param {OpenUIEntity} options.entity
 * @param {{ notify: (type: string, payload?: unknown) => void }} options.api
 * @param {ParseResult} options.result
 * @param {Library} options.library
 * @param {Record<string, unknown>} options.functions
 * @param {Record<string, unknown> | undefined} options.actions
 */
export function renderProgram({
  entity,
  api,
  result,
  library,
  functions,
  actions,
}) {
  const defaults = result.stateDeclarations ?? {}
  const getValue = (name) =>
    Object.hasOwn(entity.values, name) ? entity.values[name] : defaults[name]
  const setValue = (name, value) =>
    api.notify(`#${entity.id}:valueChange`, { name, value })

  const context = {
    getState: getValue,
    // Query and Mutation results: not run yet, so nothing to resolve.
    resolveRef: () => null,
    functions,
    actions,
  }

  // lang-core's binding store, backed by the entity: reads come from it,
  // writes become events on it.
  const store = {
    get: getValue,
    set: setValue,
    subscribe: () => () => {},
    getSnapshot: () => ({ ...defaults, ...entity.values }),
    initialize() {},
    dispose() {},
  }

  let root
  try {
    root = evaluateRoot(result, { ctx: context, library, store, errors: [] })
  } catch (error) {
    console.error("[openui] could not evaluate the program:", error)
    return nothing
  }

  const renderContext = {
    isStreaming: entity.isStreaming,
    triggerAction: (message, formName, action) =>
      runAction({ entity, api, context, store, message, formName, action }),
    stateField: (name, bindingValue) =>
      resolveStateField(name, bindingValue, store, context, getValue, setValue),
  }

  /** Renders whatever a prop holds: a component, a list, text, or nothing. */
  function renderNode(value) {
    if (value == null || value === false) return nothing
    if (Array.isArray(value)) return value.map(renderNode)
    if (typeof value !== "object") return String(value)
    if (value.type !== "element") return nothing

    const definition = library.components[value.typeName]
    if (!definition) return nothing

    try {
      return definition.component({
        ...renderContext,
        props: value.props,
        statementId: value.statementId,
        renderNode,
      })
    } catch (error) {
      // One broken component should not take the rest of the answer down.
      console.error(`[openui] ${value.typeName} failed to render:`, error)
      return nothing
    }
  }

  return renderNode(root)
}

/**
 * Runs what a component triggers: an action plan's steps in order, or a
 * plain message back to the assistant.
 *
 * Steps that change values become `valueChange` and `valuesReset` events on
 * the entity. Steps meant for the app (back to the assistant, open a URL, a
 * custom action) are announced as `openuiAction`, for whatever type talks to
 * the model to handle. `@Set` values are seen by the steps after them, as
 * they would be with a synchronous store.
 */
function runAction({ entity, api, context, store, message, formName, action }) {
  const pending = {}
  const stepContext = {
    ...context,
    getState: (name) =>
      Object.hasOwn(pending, name) ? pending[name] : context.getState(name),
  }

  const announce = (event) =>
    api.notify("openuiAction", {
      id: entity.id,
      humanFriendlyMessage: "",
      params: {},
      formName,
      formState: { ...store.getSnapshot(), ...pending },
      ...event,
    })

  if (!action) {
    announce({
      type: BuiltinActionType.ContinueConversation,
      humanFriendlyMessage: message,
    })
    return
  }

  // An action object from before action plans: `{ type, params, url }`.
  if (!("steps" in action)) {
    const params = { ...action.params }
    if (action.url) params.url = action.url
    if (action.context) params.context = action.context
    announce({
      type: action.type || BuiltinActionType.ContinueConversation,
      params,
      humanFriendlyMessage: message,
    })
    return
  }

  for (const step of /** @type {ActionPlan} */ (action).steps) {
    switch (step.type) {
      case ACTION_STEPS.Set: {
        const value = evaluate(step.valueAST, stepContext)
        pending[step.target] = value
        store.set(step.target, value)
        break
      }
      case ACTION_STEPS.Reset:
        for (const target of step.targets) delete pending[target]
        api.notify(`#${entity.id}:valuesReset`, step.targets)
        break
      case ACTION_STEPS.ToAssistant:
        announce({
          type: BuiltinActionType.ContinueConversation,
          params: step.context === undefined ? {} : { context: step.context },
          humanFriendlyMessage: step.message,
        })
        break
      case ACTION_STEPS.OpenUrl:
        announce({ type: BuiltinActionType.OpenUrl, params: { url: step.url } })
        break
      case "custom_action":
        announce({ type: step.name, params: step.params })
        break
      case ACTION_STEPS.Run:
        console.warn(
          `[openui] @Run(${step.statementId}) skipped: Query and Mutation are not supported yet`,
        )
        break
    }
  }
}
