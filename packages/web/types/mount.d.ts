import type { TemplateResult } from "lit-html"
import type {
  AnyTypeDefinition,
  BaseEntity,
  EntitiesState,
  Store,
  Api as StoreApi,
} from "@inglorious/store"

// `mount` gives the store's api a `render`, so loading these types gives the
// store's `Api` one too. There is a single `Api`: the one handlers receive,
// and the one components take.
declare module "@inglorious/store" {
  interface Api<
    TEntity extends BaseEntity = BaseEntity,
    TState extends EntitiesState<TEntity> = EntitiesState<TEntity>,
  > {
    /**
     * Renders an entity or a type component by its ID.
     * @param id The ID of the entity or type to render. None, such as the route
     *   of an unmatched path, renders nothing.
     * @param typeName Optional type name to lazy-register.
     * @param type Optional type definition to register when typeName is provided.
     * @returns The rendered template or an empty string if not found.
     */
    render: {
      (id: string | undefined): TemplateResult | string
      (
        id: string,
        typeName: string,
        type: AnyTypeDefinition,
      ): TemplateResult | string
    }
  }
}

export type Api<
  TEntity extends BaseEntity = BaseEntity,
  TState extends EntitiesState<TEntity> = EntitiesState<TEntity>,
> = StoreApi<TEntity, TState>

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
>(
  store: Store<TEntity, TState>,
  renderFn: (api: Api<TEntity, TState>) => TemplateResult | null,
  element: HTMLElement | DocumentFragment,
  options?: MountOptions<TEntity, TState>,
): () => void
