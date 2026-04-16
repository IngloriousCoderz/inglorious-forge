import { createStore } from "@inglorious/store"
import { Combobox } from "@inglorious/ui/combobox"

import { RemoteCombobox } from "../remote-combobox.js"
import { entities } from "./entities.js"
import { middlewares } from "./middlewares.js"

export const store = createStore({
  types: { Combobox, RemoteCombobox },
  entities,
  middlewares,
})
