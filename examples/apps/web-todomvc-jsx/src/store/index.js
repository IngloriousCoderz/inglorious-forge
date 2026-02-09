import { createStore } from "@inglorious/web"

import { footer } from "@/components/footer"
import { form } from "@/components/form"
import { list } from "@/components/list"

import { middlewares } from "./middlewares"

export const store = createStore({
  types: { form, list, footer },
  middlewares,
  autoCreateEntities: true,
})
