import "./vite-env"

import type {
  BaseEntity,
  EntitiesState,
  EntityType,
  EventsOf,
} from "@inglorious/store"
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

// The events the types below answer, so that `notify` checks them.
export type AppEvents = EventsOf<MessageType>

export type AppApi = Api<AppEntity, AppState, AppEvents>

export type MessageType = {
  click: (entity: MessageEntity) => void
  render: (entity: MessageEntity, api: AppApi) => TemplateResult
}

export type AppType<TEntity extends AppEntity> = EntityType<TEntity, AppApi>
