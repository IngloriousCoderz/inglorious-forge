// import { multiplayerMiddleware } from "@inglorious/store/client/multiplayer-middleware"
import { createDevtools } from "@inglorious/web"

export const middlewares = [
  // multiplayerMiddleware({ blacklist: ["inputChange", "filterClick"] }),
]

if (import.meta.env.DEV) {
  middlewares.push(createDevtools().middleware)
}
