import { createStore, type TypesConfig } from "@inglorious/web"

import { footer } from "../components/footer/footer"
import { form } from "../components/form/form"
import { list } from "../components/list/list"
import { middlewares } from "./middlewares"

export const store = createStore({
  types: { form, list, footer } as unknown as TypesConfig,
  middlewares,
  autoCreateEntities: true,
})
