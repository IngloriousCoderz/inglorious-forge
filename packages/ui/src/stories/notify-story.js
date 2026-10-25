import { createStore } from "@inglorious/store"
import { mount } from "@inglorious/web"
import { render } from "@inglorious/web/test"

export const notifyActionArgType = {
  onNotify: {
    action: "api.notify",
    control: false,
    table: { disable: true },
  },
}

export function createRender(type) {
  return (args) => {
    const container = document.createElement("div")
    render(type.render(args), container)
    return container
  }
}

export function createEntityRender(types) {
  return (args) => {
    const { onNotify, ...entity } = args

    const store = createStore({
      types,
      entities: { [entity.id]: entity },
      autoCreateEntities: true,
    })
    const originalNotify = store._api.notify
    store._api.notify = (type, payload) => {
      onNotify?.({ type, payload })
      return originalNotify(type, payload)
    }

    const container = document.createElement("div")
    mount(store, (api) => api.render(entity.id), container)
    return container
  }
}
