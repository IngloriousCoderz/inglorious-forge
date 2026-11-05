import type { nothing, TemplateResult } from "lit-html"
import type {
  AnyEvents,
  AnyTypeDefinition,
  Api,
  BaseEntity,
  EntitiesState,
  Store,
} from "@inglorious/store"

declare module "@inglorious/store" {
  interface Api<
    TEntity extends BaseEntity = BaseEntity,
    TState extends EntitiesState<TEntity> = EntitiesState<TEntity>,
    // Unused here, but every declaration of `Api` must take the same parameters.
    TEvents = AnyEvents,
  > {
    /**
     * Renders an entity or a type component by its ID.
     * @param id The ID of the entity or type to render. None, such as the route
     *   of an unmatched path, renders nothing.
     * @param typeName Optional type name to lazy-register.
     * @param type Optional type definition to register when typeName is provided.
     * @returns The rendered template, or `nothing` if not found.
     */
    render: {
      (id: string | undefined): TemplateResult | string | typeof nothing
      (
        id: string,
        typeName: string,
        type: AnyTypeDefinition,
      ): TemplateResult | string | typeof nothing
    }
  }
}

/**
 * The store's api, with `render` added above. It is the store's own interface,
 * re-exported rather than aliased: an interface is resolved lazily, so an app
 * can tell its api the events of types whose handlers take that same api.
 */
export type { Api }

/**
 * Root error-boundary options for `mount`.
 */
export interface MountOptions<
  TEntity extends BaseEntity = BaseEntity,
  TState extends EntitiesState<TEntity> = EntitiesState<TEntity>,
> {
  /**
   * Called when the root render function throws. Defaults to `console.error`.
   */
  onError?: (error: unknown, api: Api<TEntity, TState>) => void
  /**
   * Optional fallback template rendered in place of the failed root render.
   */
  fallback?: (
    error: unknown,
    api: Api<TEntity, TState>,
  ) => TemplateResult | null
  /**
   * Whether navigations are announced to screen readers and move focus to the top of the
   * new page. Only apps with the `Router` type navigate. Defaults to `true`.
   */
  hasAccessibleNavigation?: boolean
  /**
   * The name to announce for the current page, or `null` while it is not known yet.
   * Defaults to the document title.
   */
  getPageName?: () => string | null
}

/**
 * Mounts a lit-html template to the DOM and subscribes to a store for re-rendering.
 * @param store The application state store.
 * @param renderFn The root render function that receives the API and returns a template.
 * @param element The DOM element to mount the template to.
 * @param options Root error-boundary options (`onError`, `fallback`).
 * @returns An unsubscribe function.
 */
export function mount<
  TEntity extends BaseEntity = BaseEntity,
  TState extends EntitiesState<TEntity> = EntitiesState<TEntity>,
  TEvents = AnyEvents,
>(
  store: Store<TEntity, TState, TEvents>,
  renderFn: (api: Api<TEntity, TState, TEvents>) => TemplateResult | null,
  element: HTMLElement | DocumentFragment,
  options?: MountOptions<TEntity, TState>,
): () => void
