import { createMockApi, render } from "@inglorious/web/test"

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

    const api = createInstrumentedApi({ [entity.id]: entity }, onNotify)
    api.getType = (typeName) => types[typeName]

    const type = api.getType(entity.type)
    type.create?.(entity)
    render(type.render(entity, api), container)
    type.mount?.(entity, container)
    return container
  }
}

function createInstrumentedApi(entities, onNotify) {
  const api = createMockApi(entities)
  const originalNotify = api.notify.bind(api)

  api.notify = (type, payload) => {
    onNotify?.({ type, payload })
    return originalNotify(type, payload)
  }

  return api
}
