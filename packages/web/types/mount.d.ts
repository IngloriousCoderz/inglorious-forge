import type { TemplateResult } from "lit-html"
import type { BaseEntity, Store, Api as StoreApi } from "@inglorious/store"

export type Api = StoreApi & {
  /**
   * Renders an entity or a type component by its ID.
   * @param id The ID of the entity or type to render.
   * @returns The rendered template or an empty string if not found.
   */
  render: (id: string) => TemplateResult | string
}

/**
 * Mounts a lit-html template to the DOM and subscribes to a store for re-rendering.
 * @param store The application state store.
 * @param renderFn The root render function that receives the API and returns a template.
 * @param element The DOM element to mount the template to.
 * @returns An unsubscribe function.
 */
export function mount<Entity = BaseEntity, State = BaseState>(
  store: Store<Entity, State>,
  renderFn: (api: Api) => TemplateResult | null,
  element: HTMLElement | DocumentFragment,
): () => void
