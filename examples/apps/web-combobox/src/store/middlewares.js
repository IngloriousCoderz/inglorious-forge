import { createDevtools } from "@inglorious/web"

export const middlewares = []

if (import.meta.env.DEV) {
  middlewares.push(createDevtools().middleware)
}
