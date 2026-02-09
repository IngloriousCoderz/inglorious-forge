import "./vite-end"

import { Api, BaseEntity, EntitiesState, TemplateResult } from "@inglorious/web"

export type Filter = "all" | "active" | "completed"

// Define the task structure
export interface Task {
  id: number
  text: string
  completed?: boolean
}

// Define your entity types
export interface FormEntity extends BaseEntity {
  type: "form"
  value: string
}

export interface ListEntity extends BaseEntity {
  type: "list"
  tasks: Task[]
}

export interface FooterEntity extends BaseEntity {
  type: "footer"
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

// Types configuration
export interface FormType {
  create: (entity: FormEntity) => void
  inputChange: (entity: FormEntity, value: string) => void
  formSubmit: (entity: FormEntity) => void
  render: (entity: FormEntity, api: Api) => TemplateResult | null
}

export interface ListType {
  create: (entity: ListEntity) => void
  formSubmit: (entity: ListEntity, value: string) => void
  toggleClick: (entity: ListEntity, id: number) => void
  deleteClick: (entity: ListEntity, id: number) => void
  clearClick: (entity: ListEntity) => void
  render: (entity: ListEntity, api: Api) => TemplateResult | null
}

export interface FooterType {
  create: (entity: FooterEntity) => void
  filterClick: (entity: FooterEntity, id: Filter) => void
  clearClick: (entity: FooterEntity) => void
  render: (entity: FooterEntity, api: Api) => TemplateResult | null
}
