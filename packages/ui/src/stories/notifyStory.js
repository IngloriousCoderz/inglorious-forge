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

export function makeStoryRender(config) {
  return (args) => {
    const container = document.createElement("div")

    if (typeof config === "function") {
      const renderFn = config
      render(renderFn(args), container)
      return container
    }

    const types = config
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
