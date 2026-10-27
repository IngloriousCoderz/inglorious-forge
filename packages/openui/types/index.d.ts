import type { TemplateResult } from "@inglorious/web"
import type {
  ActionEvent,
  ActionPlan,
  DefinedComponent,
  Library,
  McpClientLike,
  StateField,
  ValidationError,
} from "@openuidev/lang-core"

export {
  action,
  buildMessage,
  BuiltinActionType,
  createLibrary,
  createParser,
  createStreamingParser,
  defineAction,
  defineFunction,
  generateSystemPrompt,
  mergeStatements,
  parseMessage,
} from "@openuidev/lang-core"
export type {
  ActionEvent,
  ActionPlan,
  ComponentGroup,
  DefinedComponent,
  ElementNode,
  Library,
  LibraryDefinition,
  ParseResult,
  McpClientLike,
  PromptOptions,
  ToolSpec,
  ValidationError,
} from "@openuidev/lang-core"

/** What a component renders: a template, or nothing. */
export type RenderedNode = TemplateResult | string | symbol | unknown[]

/**
 * What a library component receives when it renders.
 */
export interface RenderContext<Props = Record<string, unknown>> {
  /** The component's props, evaluated: `$variables` and expressions already resolved. */
  props: Props
  /**
   * Renders a prop that holds components, a list of them, or text. `scope`
   * reaches the components inside, as a Form's name reaches its fields.
   */
  renderNode: (value: unknown, scope?: RenderScope) => RenderedNode
  /** The statement the component came from (`header` in `header = ...`), absent for inline ones. */
  statementId?: string
  /** True while the answer is still arriving: actions should wait for it. */
  isStreaming: boolean
  /** True while any of the answer's queries is fetching. */
  isLoading: boolean
  /** The icon the app gave for `name`, or null. */
  iconFor: (name: string) => IconData | null
  /**
   * Runs an action plan, or sends `message` back to the assistant when there
   * is none. Steps that change values update the entity; the rest are
   * announced as `openuiAction`.
   */
  triggerAction: (
    message: string,
    formName?: string,
    action?: ActionPlan | Record<string, unknown>,
  ) => void
  /**
   * A field's value and setter. Bound to a `$variable` when `bindingValue` is
   * a binding (see `reactive`), kept under `name` otherwise.
   */
  stateField: <T = unknown>(
    name: string,
    bindingValue: unknown,
  ) => StateField<T>
  /**
   * State only the screen needs, such as the open tab, under `key`. It is
   * kept apart from the values, so it never goes to the model.
   */
  viewState: <T = unknown>(
    key: string,
    fallback: T,
  ) => { value: T; setValue: (value: T) => void }
  /** The Form the component is in, whose name its fields' values go under. */
  formName?: string
  /** The label and hint a FormControl gives the field inside it. */
  label?: string
  hint?: string
  /** What failed the last time the field's form was checked. */
  fieldError: (name: string) => string | undefined
  /** In a Form: checks its fields' rules, records what fails, and says whether all passed. */
  validateForm?: () => boolean
}

/** What a component hands down to the components it renders. */
export interface RenderScope {
  formName?: string
  /** The fields a Form checks: their names, rules and bindings. */
  fields?: { name: string; rules?: unknown; value?: unknown }[]
  label?: string
  hint?: string
}

/** A component for the library: its props schema, and a render function of them. */
export type InglorousComponent<Props = Record<string, unknown>> = (
  context: RenderContext<Props>,
) => RenderedNode | null

/** `defineComponent` from OpenUI, typed for Inglorious render functions. */
export function defineComponent<
  T extends import("zod").ZodObject,
  C extends InglorousComponent<import("zod").infer<T>>,
>(config: {
  name: string
  props: T
  description: string
  component: C
}): DefinedComponent<T, C>

/** Marks a prop schema as bindable to a `$variable`, as `Input`'s `value` is. */
export function reactive<T>(schema: T): T

/**
 * A component of any props. `never`, because a function taking specific
 * props can stand in for one called with props it cannot know in advance.
 */
export type AnyInglorousComponent = InglorousComponent<never>

/**
 * Runs the tools an answer's `Query` and `Mutation` calls name: a map of
 * async functions by tool name, or an MCP client, whose results are unwrapped
 * from MCP's content blocks.
 */
export type ToolProvider =
  | Record<string, (args: Record<string, unknown>) => Promise<unknown>>
  | McpClientLike

export interface OpenUIOptions {
  /** The components the model may use, from `createLibrary` or `uiLibrary`. */
  library: Library<AnyInglorousComponent>
  /** Runs the tools of `Query` and `Mutation`. Without it, queries show their defaults. */
  toolProvider?: ToolProvider
  /**
   * The icons `Icon("name")` draws: a map of names to Iconify icons, or a
   * whole Iconify collection such as `@iconify-json/lucide`'s. Without it,
   * icons are left out.
   */
  icons?: IconSource
}

/** An icon as Iconify gives it: its SVG body and size. */
export interface IconData {
  body: string
  width?: number
  height?: number
}

/** Icons by name, or an Iconify collection with its aliases. */
export type IconSource =
  | Record<string, IconData>
  | {
      prefix?: string
      width?: number
      height?: number
      icons: Record<string, IconData>
      aliases?: Record<string, { parent: string }>
    }

/** A `Query` as it stands: what it asked, and what came back. */
export interface QueryState {
  /** Its tool and arguments as one string: a change means fetching again. */
  key: string
  tool: string
  args: unknown
  status: "loading" | "success" | "error"
  /** The latest data, or the query's defaults until there is some. */
  data: unknown
  error: string | null
}

/** A `Mutation` as it stands, as the answer reads it: `refund.status`, `refund.data`. */
export interface MutationState {
  status: "idle" | "loading" | "success" | "error"
  data: unknown
  error: string | null
}

export interface OpenUIEntity {
  id?: string
  type: string
  /** The answer in OpenUI Lang, or as much of it as has arrived. */
  response?: string
  /** True from `streamStart` to `streamEnd`. */
  isStreaming?: boolean
  /** The values the answer's `$variables` and fields hold, where they differ from its defaults. */
  values?: Record<string, unknown>
  /** The answer's validation errors, once it is whole. Invalid components are left out. */
  errors?: ValidationError[]
  /** The answer's queries by statement name, once it is whole and a `toolProvider` is given. */
  queries?: Record<string, QueryState>
  /** The answer's mutations by statement name, once run. */
  mutations?: Record<string, MutationState>
  /** What failed when each form was last checked: by form name, then field name. */
  fieldErrors?: Record<string, Record<string, string>>
  /** State only the screen needs, such as open tabs. Never sent to the model. */
  view?: Record<string, unknown>
}

/** Announced, unscoped, for whatever talks to the model. */
export interface OpenUIActionEvent extends ActionEvent {
  /** The entity whose answer triggered it. */
  id: string
}

export type OpenUIType = {
  create(entity: OpenUIEntity): void
  destroy(entity: OpenUIEntity): void
  /** A new answer starts arriving; the last one's values are dropped. */
  streamStart(entity: OpenUIEntity): void
  /** The next piece of the answer. */
  chunk(entity: OpenUIEntity, text: string): void
  /** The answer is whole: buttons enable and errors are recorded. */
  streamEnd(entity: OpenUIEntity): void
  /** A whole answer at once, such as one restored from history. */
  responseChange(entity: OpenUIEntity, response: string): void
  valueChange(
    entity: OpenUIEntity,
    payload: { name: string; value: unknown },
  ): void
  /** Back to the defaults the answer declares. */
  valuesReset(entity: OpenUIEntity, names: string[]): void
  /** A field inside a Form: kept under the form's name, and its error cleared. */
  fieldChange(
    entity: OpenUIEntity,
    payload: { formName: string; name: string; value: unknown },
  ): void
  fieldErrorsChange(
    entity: OpenUIEntity,
    payload: { formName: string; errors: Record<string, string> },
  ): void
  viewChange(
    entity: OpenUIEntity,
    payload: { key: string; value: unknown },
  ): void
  /** Fetches queries again, as `@Run(query)` and refresh intervals do. */
  queriesRun(entity: OpenUIEntity, statementIds: string[]): void
  querySuccess(
    entity: OpenUIEntity,
    payload: { statementId: string; key: string; data: unknown },
  ): void
  queryError(
    entity: OpenUIEntity,
    payload: { statementId: string; key: string; error: string },
  ): void
  mutationStart(entity: OpenUIEntity, payload: { statementId: string }): void
  mutationSuccess(
    entity: OpenUIEntity,
    payload: { statementId: string; data: unknown },
  ): void
  mutationError(
    entity: OpenUIEntity,
    payload: { statementId: string; error: string },
  ): void
  render(entity: OpenUIEntity, api: unknown): TemplateResult | symbol
}

/** Creates the type that renders OpenUI Lang answers with `library`. */
export function createOpenUI(options: OpenUIOptions): OpenUIType

/** Inglorious UI as an OpenUI library, with OpenUI's standard component names. */
export declare const uiLibrary: Required<Library<AnyInglorousComponent>>

/** Example answers for `uiLibrary.prompt({ examples: uiExamples })`; small models need them. */
export declare const uiExamples: string[]
