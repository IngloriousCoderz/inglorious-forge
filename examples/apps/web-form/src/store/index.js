import { createStore } from "@inglorious/web"

import { UserForm } from "../user-form/user-form"
import { entities } from "./entities"
import { middlewares } from "./middlewares"

export const store = createStore({
  types: { UserForm },
  entities,
  middlewares,
})
