import type { TemplateResult } from "lit-html"
import type {
  BaseEntity,
  EntitiesState,
  EntityType,
  Store,
  Api as StoreApi,
} from "@inglorious/store"

export type Api<
  TEntity extends BaseEntity = BaseEntity,
  TState extends EntitiesState<TEntity> = EntitiesState<TEntity>,
> = StoreApi<TEntity, TState> & {
  /**
   * Renders an entity or a type component by its ID.
   * @param id The ID of the entity or type to render.
   * @param typeName Optional type name to lazy-register.
   * @param type Optional type definition to register when typeName is provided.
   * @returns The rendered template or an empty string if not found.
   */
  render: {
    (id: string): TemplateResult | string
    (
      id: string,
      typeName: string,
      type: EntityType<TEntity>,
    ): TemplateResult | string
  }
}

/**
 * Mounts a lit-html template to the DOM and subscribes to a store for re-rendering.
 * @param store The application state store.
 * @param renderFn The root render function that receives the API and returns a template.
 * @param element The DOM element to mount the template to.
 * @returns An unsubscribe function.
 */
export function mount<
  TEntity extends BaseEntity = BaseEntity,
  TState extends EntitiesState<TEntity> = EntitiesState<TEntity>,
>(
  store: Store<TEntity, TState>,
  renderFn: (api: Api<TEntity, TState>) => TemplateResult | null,
  element: HTMLElement | DocumentFragment,
): () => void
