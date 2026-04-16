import { createDevtools } from "@inglorious/store/client/devtools"

export const middlewares = []

if (window.process.env === "development") {
  middlewares.push(createDevtools().middleware)
}
