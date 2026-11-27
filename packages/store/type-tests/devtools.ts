import { createDevtools } from "../types/client/devtools"
import { createStore } from "../types/store"

const devtools = createDevtools({
  name: "My App",
  blacklist: ["update"],
  filter: (event) => event.type !== "mouseMove",
})
const store = createStore({ entities: {}, middlewares: [devtools.middleware] })

devtools.connect(store)
devtools.send({ type: "update" }, store.getState())
devtools.disconnect()

// @ts-expect-error - not an option
createDevtools({ nope: true })
