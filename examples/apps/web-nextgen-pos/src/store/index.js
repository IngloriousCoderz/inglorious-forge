import { createStore } from "@inglorious/store"

import { entities } from "./entities.js"
import { middlewares } from "./middlewares.js"
import { types } from "./types.js"

export const store = createStore({ types, entities, middlewares })
