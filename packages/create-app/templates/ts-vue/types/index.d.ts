import "./vite-end"

import type { BaseEntity, EntitiesState, EntityType } from "@inglorious/store"
import type { Api } from "@inglorious/web"

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

// A type for one of the app's entities. For rigour, declare a type alias
// listing its events and payloads; this shorthand infers its handlers'
// parameters with `{ ... } satisfies AppType<MessageEntity>`.
export type AppType<TEntity extends AppEntity> = EntityType<TEntity, AppApi>
