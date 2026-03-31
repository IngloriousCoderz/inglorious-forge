import { createStore } from "@inglorious/web"

import { Footer } from "@/components/footer"
import { Form } from "@/components/form"
import { List } from "@/components/list"

import { middlewares } from "./middlewares"

export const store = createStore({
  types: { Form, List, Footer },
  middlewares,
  autoCreateEntities: true,
})
