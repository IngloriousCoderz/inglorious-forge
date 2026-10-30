import "./vite-end"

import type { BaseEntity, EntitiesState, EntityType } from "@inglorious/store"
import type { Api, TemplateResult } from "@inglorious/web"

export interface MessageEntity extends BaseEntity {
  type: "Message"
  who: string
  isUpperCase?: boolean
}

export type AppEntity = MessageEntity

export interface AppState extends EntitiesState<AppEntity> {
  message1: MessageEntity
  message2: MessageEntity
  message3: MessageEntity
}

export type AppApi = Api<AppEntity, AppState>

export type MessageType = {
  click: (entity: MessageEntity) => void
  render: (entity: MessageEntity, api: AppApi) => TemplateResult
}

export type AppType<TEntity extends AppEntity> = EntityType<TEntity, AppApi>
