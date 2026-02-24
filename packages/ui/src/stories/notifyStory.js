import { augmentType } from "@inglorious/store/types"
import { createMockApi, render } from "@inglorious/web/test"

export const notifyActionArgType = {
  onNotify: {
    action: "api.notify",
    control: false,
    table: { disable: true },
  },
}

export function makeStoryRender(typeDefinition, id, options = {}) {
  const { resolveByEntityType = false } = options
  const type = augmentType(typeDefinition)

  return (args) => {
    const container = document.createElement("div")
    const { onNotify, ...entityArgs } = args
    const entity = { id, ...entityArgs }
    const api = createInstrumentedApi(entity, onNotify)

    if (resolveByEntityType && entity.type) {
      const getType = api.getType?.bind(api)
      api.getType = (typeName) =>
        typeName === entity.type ? type : getType?.(typeName)
    }

    render(type.render(entity, api), container)
    return container
  }
}

function createInstrumentedApi(entityOrState, onNotify) {
  const api = createMockApi(entityOrState)
  const originalNotify = api.notify.bind(api)

  api.notify = (type, payload) => {
    onNotify?.({ type, payload })
    return originalNotify(type, payload)
  }

  return api
}
