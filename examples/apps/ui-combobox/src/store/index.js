import { combobox } from "@inglorious/ui/combobox"
import { createStore } from "@inglorious/web"

import { remoteCombobox } from "../remote-combobox.js"
import { entities } from "./entities.js"
import { middlewares } from "./middlewares.js"

export const store = createStore({
  types: { combobox, remoteCombobox },
  entities,
  middlewares,
})
