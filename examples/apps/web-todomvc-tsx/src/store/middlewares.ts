// import { multiplayerMiddleware } from "@inglorious/store/client/multiplayer-middleware"
import type { Middleware } from "@inglorious/store"
import { createDevtools } from "@inglorious/store/client/devtools"

import type { AppEntity, AppState } from "../../types"

export const middlewares: Middleware<AppEntity, AppState>[] = [
  // multiplayerMiddleware({ blacklist: ["inputChange", "filterClick"] }),
]

if (import.meta.env.DEV) {
  middlewares.push(createDevtools<AppEntity, AppState>().middleware)
}
