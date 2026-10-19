import "./vite-end"

import type { BaseEntity, EntitiesState, EntityType } from "@inglorious/store"
import type { Api, TemplateResult } from "@inglorious/web"

// Define your entity types
export interface MessageEntity extends BaseEntity {
  type: "Message"
  who: string
  isUpperCase?: boolean
}

// Union type of all entities
export type AppEntity = MessageEntity

// State type with known entity IDs
export interface AppState extends EntitiesState<AppEntity> {
  message1: MessageEntity
  message2: MessageEntity
  message3: MessageEntity
}

export type AppApi = Api<AppEntity, AppState>

// Each type's events and their payloads. Declare types with `type`, not
// `interface`: an interface does not fit the store's `types`.
export type MessageType = {
  click: (entity: MessageEntity) => void
  render: (entity: MessageEntity, api: AppApi) => TemplateResult
}

// A shorthand for a type: `{ ... } satisfies AppType<MessageEntity>` infers
// its handlers' parameters, but neither lists its events nor types payloads.
export type AppType<TEntity extends AppEntity> = EntityType<TEntity, AppApi>
