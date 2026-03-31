import { createStore, type TypesConfig } from "@inglorious/web"

import { Footer } from "../components/footer/footer"
import { Form } from "../components/form/form"
import { List } from "../components/list/list"
import { middlewares } from "./middlewares"

export const store = createStore({
  types: { Form, List, Footer } as unknown as TypesConfig,
  middlewares,
  autoCreateEntities: true,
})
