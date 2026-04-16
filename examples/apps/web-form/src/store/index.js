import { createStore } from "@inglorious/store"

import { InvoiceForm } from "../invoice-form"
import { entities } from "./entities"
import { middlewares } from "./middlewares"

export const store = createStore({
  types: { InvoiceForm },
  entities,
  middlewares,
})
