// import { multiplayerMiddleware } from "@inglorious/store/client/multiplayer-middleware"
import { createDevtools } from "@inglorious/store/client/devtools"

export const middlewares = [
  // multiplayerMiddleware({ blacklist: ["inputChange", "filterClick"] }),
]

if (import.meta.env.DEV) {
  middlewares.push(createDevtools().middleware)
}
