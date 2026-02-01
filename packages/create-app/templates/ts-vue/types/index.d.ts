import "./vite-end"

import { Api, BaseEntity, EntitiesState, TemplateResult } from "@inglorious/web"

// Define your entity types
export interface MessageEntity extends BaseEntity {
  type: "message"
  id?: string
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

// Types configuration
export interface MessageType {
  click: (entity: MessageEntity) => void
  render: (entity: MessageEntity, api: Api) => TemplateResult | null
}
