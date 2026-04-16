import { createStore } from "@inglorious/store"

import { types } from "../types/index.js"
import { entities } from "./entities.js"

export const store = createStore({ types, entities })
