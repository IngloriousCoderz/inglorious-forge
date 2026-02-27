import { createStore, mount } from "@inglorious/web"

export const notifyActionArgType = {
  onNotify: {
    action: "api.notify",
    control: false,
    table: { disable: true },
  },
}

export function makeStoryRender(types) {
  return (args) => {
    const container = document.createElement("div")
    const { onNotify, ...entity } = args

    const store = createStore({ types, entities: { [entity.id]: entity } })
    const originalNotify = store._api.notify
    store._api.notify = (type, payload) => {
      onNotify?.({ type, payload })
      return originalNotify(type, payload)
    }

    mount(store, (api) => api.render(entity.id), container)
    return container
  }
}
