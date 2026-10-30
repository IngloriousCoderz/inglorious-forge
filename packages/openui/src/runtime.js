import { nothing } from "@inglorious/web"
import {
  ACTION_STEPS,
  BuiltinActionType,
  evaluate,
  evaluateRoot,
  parseStructuredRules,
  resolveStateField,
  validate,
} from "@openuidev/lang-core"

/**
 * @typedef {import('@openuidev/lang-core').ParseResult} ParseResult
 * @typedef {import('@openuidev/lang-core').ActionPlan} ActionPlan
 * @typedef {import('@openuidev/lang-core').EvaluationContext} EvaluationContext
 * @typedef {import('@openuidev/lang-core').Library} Library
 * @typedef {import('../types').OpenUIEntity} OpenUIEntity
 * @typedef {import('./tools.js').CallTool} CallTool
 */

const IDLE_MUTATION = { status: "idle", data: null, error: null }

/**
 * What an answer's expressions read, all from the entity: `$variables` and
 * fields from `values`, falling back to the defaults the answer declares, and
 * `Query`/`Mutation` results from `queries` and `mutations`, falling back to
 * a query's defaults until it has data.
 *
 * @param {object} options
 * @param {OpenUIEntity} options.entity
 * @param {ParseResult} options.result
 * @param {Record<string, unknown>} options.functions
 * @param {Record<string, unknown> | undefined} options.actions
 * @returns {{ context: EvaluationContext, defaults: Record<string, unknown>, getValue: (name: string) => unknown }}
 */
export function createContext({ entity, result, functions, actions }) {
  const defaults = result.stateDeclarations ?? {}
  const getValue = (name) =>
    Object.hasOwn(entity.values, name) ? entity.values[name] : defaults[name]

  const context = {
    getState: getValue,
    resolveRef(name) {
      if (Object.hasOwn(entity.queries, name)) return entity.queries[name].data
      if (Object.hasOwn(entity.mutations, name)) return entity.mutations[name]

      const query = result.queryStatements.find(
        (node) => node.statementId === name,
      )
      if (query) {
        return query.defaultsAST ? evaluate(query.defaultsAST, context) : null
      }
      const isMutation = result.mutationStatements.some(
        (node) => node.statementId === name,
      )
      return isMutation ? IDLE_MUTATION : null
    },
    functions,
    actions,
  }

  return { context, defaults, getValue }
}

/**
 * The `$variables` a component's prop is bound to across the answer, such as
 * the ones Callouts show while true, so their timers can be kept in step.
 *
 * @param {object} options
 * @param {OpenUIEntity} options.entity
 * @param {ParseResult} options.result
 * @param {Library} options.library
 * @param {Record<string, unknown>} options.functions
 * @param {Record<string, unknown> | undefined} options.actions
 * @param {string} options.typeName
 * @param {string} options.prop
 * @returns {Set<string>}
 */
export function findBoundVariables({
  entity,
  result,
  library,
  functions,
  actions,
  typeName,
  prop,
}) {
  const { context, defaults, getValue } = createContext({
    entity,
    result,
    functions,
    actions,
  })
  const store = {
    get: getValue,
    set() {},
    subscribe: () => () => {},
    getSnapshot: () => ({ ...defaults, ...entity.values }),
    initialize() {},
    dispose() {},
  }
  const names = new Set()

  let root
  try {
    root = evaluateRoot(result, { ctx: context, library, store, errors: [] })
  } catch {
    return names
  }

  const visit = (value) => {
    if (Array.isArray(value)) return value.forEach(visit)
    if (!value || typeof value !== "object") return
    if (value.type !== "element") return
    const binding = value.props?.[prop]
    if (value.typeName === typeName && binding?.__reactive === "assign") {
      names.add(binding.target)
    }
    Object.values(value.props ?? {}).forEach(visit)
  }
  visit(root)
  return names
}

/**
 * Renders a parsed program against an entity.
 *
 * Everything that changes what it shows is an event on the entity, so the
 * store stays the one source of truth and a render is a pure function of it.
 *
 * @param {object} options
 * @param {OpenUIEntity} options.entity
 * @param {{ notify: (type: string, payload?: unknown) => void, getEntity?: (id: string) => OpenUIEntity | undefined }} options.api
 * @param {ParseResult} options.result
 * @param {Library} options.library
 * @param {Record<string, unknown>} options.functions
 * @param {Record<string, unknown> | undefined} options.actions
 * @param {CallTool | null} options.callTool
 * @param {(name: string) => unknown} options.iconFor
 */
export function renderProgram({
  entity,
  api,
  result,
  library,
  functions,
  actions,
  callTool,
  iconFor,
}) {
  const { context, defaults, getValue } = createContext({
    entity,
    result,
    functions,
    actions,
  })
  const setValue = (name, value) =>
    api.notify(`#${entity.id}:valueChange`, { name, value })

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

  const shared = {
    iconFor,
    isStreaming: entity.isStreaming,
    isLoading: Object.values(entity.queries).some(
      (query) => query.status === "loading",
    ),
    /**
     * State only the screen needs, such as the open tab: kept apart from
     * `values`, so it never goes to the model as something the user entered.
     */
    viewState: (key, fallback) => ({
      value: Object.hasOwn(entity.view, key) ? entity.view[key] : fallback,
      setValue: (value) =>
        api.notify(`#${entity.id}:viewChange`, { key, value }),
    }),
  }

  /**
   * What a component sees, for where it stands: inside a Form, its fields
   * keep their values under the form's name, as OpenUI's own runtime does,
   * and its buttons can check the fields before acting.
   * @param {{ formName?: string, fields?: { name: string, rules?: unknown, value?: unknown }[] }} scope
   */
  function contextFor(scope) {
    const { formName } = scope
    const getField = (name) =>
      formName ? getValue(formName)?.[name] : getValue(name)
    const setField = (name, value) =>
      formName
        ? api.notify(`#${entity.id}:fieldChange`, { formName, name, value })
        : setValue(name, value)
    const stateField = (name, bindingValue) => {
      const field = resolveStateField(
        name,
        bindingValue,
        store,
        context,
        getField,
        setField,
      )
      const errors = entity.fieldErrors[formName ?? ""]
      if (!field.isReactive || !errors?.[name]) return field

      return {
        ...field,
        setValue: (value) => {
          field.setValue(value)
          api.notify(`#${entity.id}:fieldErrorsChange`, {
            formName: formName ?? "",
            errors: Object.fromEntries(
              Object.entries(errors).filter(([field]) => field !== name),
            ),
          })
        },
      }
    }

    return {
      ...shared,
      formName,
      label: scope.label,
      hint: scope.hint,
      sources: scope.sources ?? [],
      stateField,
      fieldError: (name) => entity.fieldErrors[formName ?? ""]?.[name],
      validateForm: scope.fields
        ? () =>
            validateFields({
              entity,
              api,
              formName,
              fields: scope.fields,
              stateField,
            })
        : undefined,
      triggerAction: (message, actionFormName, action) =>
        runAction({
          entity,
          api,
          result,
          context,
          defaults,
          store,
          callTool,
          message,
          formName: actionFormName ?? formName,
          fields:
            actionFormName && actionFormName !== formName ? [] : scope.fields,
          action,
        }),
      renderNode: (value, nextScope) =>
        renderNode(value, nextScope ? { ...scope, ...nextScope } : scope),
    }
  }

  /** Renders whatever a prop holds: a component, a list, text, or nothing. */
  function renderNode(value, scope = {}) {
    if (value == null || value === false) return nothing
    if (Array.isArray(value))
      return value.map((item) => renderNode(item, scope))
    if (typeof value !== "object") return String(value)
    if (value.type !== "element") return nothing

    const definition = library.components[value.typeName]
    if (!definition) return nothing

    try {
      return definition.component({
        ...contextFor(scope),
        props: value.props,
        statementId: value.statementId,
      })
    } catch (error) {
      console.error(`[openui] ${value.typeName} failed to render:`, error)
      return nothing
    }
  }

  return renderNode(root)
}

/**
 * Checks a form's fields against their rules, and records what fails so the
 * fields can say so.
 * @returns {boolean} whether every field passed
 */
function validateFields({ entity, api, formName, fields, stateField }) {
  const errors = {}
  for (const field of fields) {
    if (!field?.name || !field.rules) continue
    const message = validate(
      stateField(field.name, field.value).value ?? field.defaultValue,
      parseStructuredRules(field.rules),
    )
    if (message) errors[field.name] = message
  }
  api.notify(`#${entity.id}:fieldErrorsChange`, {
    formName: formName ?? "",
    errors,
  })
  return !Object.keys(errors).length
}

/**
 * Runs what a component triggers: an action plan's steps in order, or a
 * plain message back to the assistant.
 *
 * Steps that change values become `valueChange` and `valuesReset` events on
 * the entity. `@Run` fetches a query again, or calls a mutation's tool and
 * stops the action if it fails. Steps meant for the app (back to the
 * assistant, open a URL, a custom action) are announced as `openuiAction`,
 * for whatever type talks to the model to handle. Each step sees what the
 * steps before it did, as it would with a synchronous store.
 */
async function runAction({
  entity,
  api,
  result,
  context,
  defaults,
  store,
  callTool,
  message,
  formName,
  fields = [],
  action,
}) {
  const pendingValues = {}
  const pendingRefs = {}
  const stepContext = {
    ...context,
    getState: (name) =>
      Object.hasOwn(pendingValues, name)
        ? pendingValues[name]
        : context.getState(name),
    resolveRef: (name) =>
      Object.hasOwn(pendingRefs, name)
        ? pendingRefs[name]
        : context.resolveRef(name),
  }

  const announce = (event) => {
    const values = api.getEntity?.(entity.id)?.values ?? entity.values
    const valueOf = (name) =>
      Object.hasOwn(pendingValues, name)
        ? pendingValues[name]
        : Object.hasOwn(values, name)
          ? values[name]
          : defaults[name]
    const bound = Object.fromEntries(
      fields
        .filter((field) => field?.value?.__reactive === "assign")
        .map((field) => [field.name, valueOf(field.value.target)]),
    )
    api.notify("openuiAction", {
      id: entity.id,
      humanFriendlyMessage: "",
      params: {},
      formName,
      formState: formName
        ? { [formName]: { ...bound, ...values[formName] } }
        : { ...defaults, ...values, ...pendingValues },
      ...event,
    })
  }

  if (!action) {
    announce({
      type: BuiltinActionType.ContinueConversation,
      humanFriendlyMessage: message,
    })
    return
  }

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
        pendingValues[step.target] = value
        store.set(step.target, value)
        break
      }
      case ACTION_STEPS.Reset:
        for (const target of step.targets) {
          pendingValues[target] = defaults[target]
        }
        api.notify(`#${entity.id}:valuesReset`, step.targets)
        break
      case ACTION_STEPS.Run:
        if (step.refType === "query") {
          api.notify(`#${entity.id}:queriesRun`, [step.statementId])
          break
        }
        if (
          !(await runMutation({
            entity,
            api,
            result,
            stepContext,
            pendingRefs,
            callTool,
            statementId: step.statementId,
          }))
        ) {
          return
        }
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
    }
  }
}

/**
 * Calls a mutation's tool with its arguments as they stand now, reporting
 * the call as events on the entity.
 * @returns {Promise<boolean>} whether it succeeded, so the action can go on
 */
async function runMutation({
  entity,
  api,
  result,
  stepContext,
  pendingRefs,
  callTool,
  statementId,
}) {
  const node = result.mutationStatements.find(
    (mutation) => mutation.statementId === statementId,
  )
  if (!node || !callTool) {
    console.warn(
      `[openui] @Run(${statementId}) skipped: ${node ? "no toolProvider was given" : "no such mutation"}`,
    )
    return false
  }
  if (entity.mutations[statementId]?.status === "loading") return false

  const tool = evaluate(node.toolAST, stepContext)
  const args = node.argsAST ? evaluate(node.argsAST, stepContext) : {}
  api.notify(`#${entity.id}:mutationStart`, { statementId })

  try {
    const data = await callTool(tool, args ?? {})
    pendingRefs[statementId] = { status: "success", data, error: null }
    api.notify(`#${entity.id}:mutationSuccess`, { statementId, data })
    return true
  } catch (error) {
    console.error(`[openui] Mutation "${tool}" failed:`, error)
    api.notify(`#${entity.id}:mutationError`, {
      statementId,
      error: error instanceof Error ? error.message : String(error),
    })
    return false
  }
}
