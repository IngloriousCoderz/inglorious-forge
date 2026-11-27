import type { BaseEntity, Stored } from "@inglorious/store"
import type { nothing, TemplateResult } from "lit-html"

import type { Api } from "../mount"

/** What a type's `render` is, or a `render` of any entity when it has none. */
type RenderOf<TType> = TType extends {
  render?: infer TRender
}
  ? unknown extends TRender
    ? (entity: Stored<BaseEntity>, api: Api) => unknown
    : NonNullable<TRender>
  : never

/**
 * Renders the type as it does, and `fallback`'s template when that throws.
 * The fallback receives what was thrown, which need not be an `Error`.
 */
export declare function withErrorBoundary<
  TEntity extends BaseEntity = BaseEntity,
  TApi extends Api = Api,
>(
  fallback?: (
    error: unknown,
    entity: Stored<TEntity>,
    api: TApi,
  ) => TemplateResult | string | typeof nothing,
): <TType extends object>(type: TType) => { render: RenderOf<TType> }
