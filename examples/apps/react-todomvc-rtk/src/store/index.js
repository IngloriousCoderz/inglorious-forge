import { createStore } from "@inglorious/store"

import { Footer } from "../footer/footer"
import { Form } from "../form/form"
import { List } from "../list/list"
import { middlewares } from "./middlewares"

export const store = createStore({
  types: { Form, List, Footer },
  middlewares,
  autoCreateEntities: true,
})
