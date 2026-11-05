import type {
  BaseEntity,
  EntitiesState,
  EntityType,
  EventsOf,
} from "@inglorious/store"
import type { Api, TemplateResult } from "@inglorious/web"

export interface AboutEntity extends BaseEntity {
  type: "About"
  name: string
}

export type AppEntity = AboutEntity

export interface AppState extends EntitiesState<AppEntity> {
  about: AboutEntity
}

// The events the types below answer, so that `notify` checks them.
export type AppEvents = EventsOf<AboutType>

export type AppApi = Api<AppEntity, AppState, AppEvents>

export type AboutType = {
  click: (entity: AboutEntity) => void
  render: (entity: AboutEntity, api: AppApi) => TemplateResult
}

export type AppType<TEntity extends AppEntity> = EntityType<TEntity, AppApi>
