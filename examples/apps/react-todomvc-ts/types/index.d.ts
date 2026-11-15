import type { BaseEntity, EntitiesState, EventsOf } from "@inglorious/store"

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

export type AppTypes = {
  Form: {
    inputChange: (entity: FormEntity, value: string) => void
    formSubmit: (entity: FormEntity) => void
  }

  List: {
    formSubmit: (entity: ListEntity, value: string) => void
    taskToggle: (entity: ListEntity, id: number) => void
    taskDelete: (entity: ListEntity, id: number) => void
    completedClear: (entity: ListEntity) => void
  }

  Footer: {
    filterChange: (entity: FooterEntity, id: Filter) => void
    completedClear: (entity: FooterEntity) => void
  }
}

/** Every event the types answer, so that `notify` checks each one's name and payload. */
export type AppEvents = EventsOf<AppTypes[keyof AppTypes]>
