import { createStore } from "@inglorious/store"

import { entities } from "./entities"
import { middlewares } from "./middlewares"
import { Form } from "../form/form"
import { List } from "../list/list"
import { Footer } from "../footer/footer"
import { createReactStore } from "@inglorious/react-store"

export const store = createStore({
  types: { Form, List, Footer },
  entities,
  middlewares,
})

export const { Provider, useSelector, useEntity, useNotify } =
  createReactStore(store)
