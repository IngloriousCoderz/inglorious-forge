import type { TemplateResult } from "@inglorious/web"
import type {
  ActionEvent,
  ActionPlan,
  DefinedComponent,
  Library,
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
  PromptOptions,
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
  /** Renders a prop that holds components, a list of them, or text. */
  renderNode: (value: unknown) => RenderedNode
  /** The statement the component came from (`header` in `header = ...`), absent for inline ones. */
  statementId?: string
  /** True while the answer is still arriving: actions should wait for it. */
  isStreaming: boolean
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

export interface OpenUIOptions {
  /** The components the model may use, from `createLibrary` or `uiLibrary`. */
  library: Library<AnyInglorousComponent>
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
  render(entity: OpenUIEntity, api: unknown): TemplateResult | symbol
}

/** Creates the type that renders OpenUI Lang answers with `library`. */
export function createOpenUI(options: OpenUIOptions): OpenUIType

/** Inglorious UI as an OpenUI library, with OpenUI's standard component names. */
export declare const uiLibrary: Library<AnyInglorousComponent>

/** Example answers for `uiLibrary.prompt({ examples: uiExamples })`; small models need them. */
export declare const uiExamples: string[]
