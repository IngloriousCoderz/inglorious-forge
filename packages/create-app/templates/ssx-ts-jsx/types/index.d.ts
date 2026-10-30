/// <reference types="@inglorious/jsx/jsx-runtime" />

import type { BaseEntity, EntitiesState, EntityType } from "@inglorious/store"
import type { Api, TemplateResult } from "@inglorious/web"

export interface AboutEntity extends BaseEntity {
  type: "About"
  name: string
}

export type AppEntity = AboutEntity

export interface AppState extends EntitiesState<AppEntity> {
  about: AboutEntity
}

export type AppApi = Api<AppEntity, AppState>

export type AboutType = {
  click: (entity: AboutEntity) => void
  render: (entity: AboutEntity, api: AppApi) => TemplateResult
}

export type AppType<TEntity extends AppEntity> = EntityType<TEntity, AppApi>
