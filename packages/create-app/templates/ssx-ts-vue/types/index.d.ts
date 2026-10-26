import type { BaseEntity, EntitiesState, EntityType } from "@inglorious/store"
import type { Api } from "@inglorious/web"

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

// A type for one of the app's entities. For rigour, declare a type alias
// listing its events and payloads; this shorthand infers its handlers'
// parameters with `{ ... } satisfies AppType<AboutEntity>`.
export type AppType<TEntity extends AppEntity> = EntityType<TEntity, AppApi>
