import { createStore } from "@inglorious/web"

import { footer } from "../footer/footer"
import { form } from "../form/form"
import { list } from "../list/list"
import { middlewares } from "./middlewares"

export const store = createStore({
  types: { form, list, footer },
  middlewares,
  autoCreateEntities: true,
})
