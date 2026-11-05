import { createStore } from "@inglorious/store"

import type { AppEntity, AppEvents, AppState } from "../../types"
import { Footer } from "../components/footer/footer"
import { Form } from "../components/form/form"
import { List } from "../components/list/list"
import { middlewares } from "./middlewares"

export const store = createStore<AppEntity, AppState, AppEvents>({
  types: { Form, List, Footer },
  middlewares,
  autoCreateEntities: true,
})
