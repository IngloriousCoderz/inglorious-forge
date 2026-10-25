import { createDevtools } from "@inglorious/store/client/devtools"

export const middlewares = []

// Every system operation is a serializable event, so the Redux DevTools can log,
// replay and time-travel through a whole shift at the till.
if (import.meta.env.DEV) {
  middlewares.push(createDevtools().middleware)
}
