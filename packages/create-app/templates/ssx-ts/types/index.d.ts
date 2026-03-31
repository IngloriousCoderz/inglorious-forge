import { BaseEntity, EntitiesState } from "@inglorious/store"

// Define your entity types
export interface AboutEntity extends BaseEntity {
  type: "About"
  id?: string
  name: string
}

// Union type of all entities
export type AppEntity = AboutEntity

// State type with known entity IDs
export interface AppState extends EntitiesState<AppEntity> {
  about: AboutEntity
}

// Types configuration
export interface AppTypes {
  About: {
    click: (entity: AboutEntity) => void
  }
}
