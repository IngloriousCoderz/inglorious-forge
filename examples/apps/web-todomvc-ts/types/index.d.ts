import "./vite-end"

import type { BaseEntity, EntitiesState } from "@inglorious/store"
import type { Api, TemplateResult } from "@inglorious/web"

export type Filter = "all" | "active" | "completed"

// Define the task structure
export interface Task {
  id: number
  text: string
  completed?: boolean
}

// Define your entity types
export interface FormEntity extends BaseEntity {
  type: "Form"
  value: string
}

export interface ListEntity extends BaseEntity {
  type: "List"
  tasks: Task[]
}

export interface FooterEntity extends BaseEntity {
  type: "Footer"
  activeFilter: Filter
}

// Union type of all entities
export type AppEntity = FormEntity | ListEntity | FooterEntity

// State type with known entity IDs
export interface AppState extends EntitiesState<AppEntity> {
  form: FormEntity
  list: ListEntity
  footer: FooterEntity
}

export type AppApi = Api<AppEntity, AppState>

// Each type's events and their payloads. Declare types with `type`, not
// `interface`: an interface does not fit the store's `types`.
export type FormType = {
  create: (entity: FormEntity) => void
  inputChange: (entity: FormEntity, value: string) => void
  formSubmit: (entity: FormEntity) => void
  render: (entity: FormEntity, api: AppApi) => TemplateResult | null
}

export type ListType = {
  create: (entity: ListEntity) => void
  formSubmit: (entity: ListEntity, value: string) => void
  toggleClick: (entity: ListEntity, id: number) => void
  deleteClick: (entity: ListEntity, id: number) => void
  clearClick: (entity: ListEntity) => void
  render: (entity: ListEntity, api: AppApi) => TemplateResult | null
}

export type FooterType = {
  create: (entity: FooterEntity) => void
  filterClick: (entity: FooterEntity, id: Filter) => void
  clearClick: (entity: FooterEntity) => void
  render: (entity: FooterEntity, api: AppApi) => TemplateResult | null
}
