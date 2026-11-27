import { createStore } from "@inglorious/store"

import { Footer } from "@/components/footer/footer"
import { Form } from "@/components/form/form"
import { List } from "@/components/list/list"
import type { AppEntity, AppEvents, AppState } from "#types"

import { middlewares } from "./middlewares"

export const store = createStore<AppEntity, AppState, AppEvents>({
  types: { Form, List, Footer },
  middlewares,
  autoCreateEntities: true,
})
