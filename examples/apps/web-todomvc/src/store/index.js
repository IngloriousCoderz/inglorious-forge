import { createStore } from "@inglorious/web"

import { Footer } from "../footer/footer"
import { Form } from "../form/form"
import { List } from "../list/list"
import { entities } from "./entities"
import { middlewares } from "./middlewares"

export const store = createStore({
  types: { Form, List, Footer },
  entities,
  middlewares,
})
