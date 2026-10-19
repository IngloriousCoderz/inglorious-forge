import type { BaseEntity, EntitiesState, EntityType } from "@inglorious/store"
import type { Api, TemplateResult } from "@inglorious/web"

// Define your entity types
export interface AboutEntity extends BaseEntity {
  type: "About"
  name: string
}

// Union type of all entities
export type AppEntity = AboutEntity

// State type with known entity IDs
export interface AppState extends EntitiesState<AppEntity> {
  about: AboutEntity
}

export type AppApi = Api<AppEntity, AppState>

// Each type's events and their payloads. Declare types with `type`, not
// `interface`: an interface does not fit the store's `types`.
export type AboutType = {
  click: (entity: AboutEntity) => void
  render: (entity: AboutEntity, api: AppApi) => TemplateResult
}

// A shorthand for a type: `{ ... } satisfies AppType<AboutEntity>` infers
// its handlers' parameters, but neither lists its events nor types payloads.
export type AppType<TEntity extends AppEntity> = EntityType<TEntity, AppApi>
