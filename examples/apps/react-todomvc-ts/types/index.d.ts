import type { BaseEntity, EntitiesState } from "@inglorious/store"

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
    toggleClick: (entity: ListEntity, id: number) => void
    deleteClick: (entity: ListEntity, id: number) => void
    clearClick: (entity: ListEntity) => void
  }

  Footer: {
    filterClick: (entity: FooterEntity, id: Filter) => void
    clearClick: (entity: FooterEntity) => void
  }
}
