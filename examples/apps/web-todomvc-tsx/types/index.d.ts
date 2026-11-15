import "./vite-env"

import type { BaseEntity, EntitiesState, EventsOf } from "@inglorious/store"
import type { Api, TemplateResult } from "@inglorious/web"

export type Filter = "all" | "active" | "completed"

export interface Task {
  id: number
  text: string
  completed?: boolean
}

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

export type AppEntity = FormEntity | ListEntity | FooterEntity

export interface AppState extends EntitiesState<AppEntity> {
  form: FormEntity
  list: ListEntity
  footer: FooterEntity
}

/** Every event the types below answer, so that `notify` checks each one's name and payload. */
export type AppEvents = EventsOf<FormType | ListType | FooterType>

export type AppApi = Api<AppEntity, AppState, AppEvents>

export type FormType = {
  create: (entity: FormEntity) => void
  inputChange: (entity: FormEntity, value: string) => void
  formSubmit: (entity: FormEntity) => void
  render: (entity: FormEntity, api: AppApi) => TemplateResult | null
}

export type ListType = {
  create: (entity: ListEntity) => void
  formSubmit: (entity: ListEntity, value: string) => void
  taskToggle: (entity: ListEntity, id: number) => void
  taskDelete: (entity: ListEntity, id: number) => void
  completedClear: (entity: ListEntity) => void
  render: (entity: ListEntity, api: AppApi) => TemplateResult | null
}

export type FooterType = {
  create: (entity: FooterEntity) => void
  filterChange: (entity: FooterEntity, id: Filter) => void
  completedClear: (entity: FooterEntity) => void
  render: (entity: FooterEntity, api: AppApi) => TemplateResult | null
}
