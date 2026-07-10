import { createDevtools } from "@inglorious/store/client/devtools"

export const middlewares = []

if (import.meta.env.DEV) {
  middlewares.push(createDevtools().middleware)
}
