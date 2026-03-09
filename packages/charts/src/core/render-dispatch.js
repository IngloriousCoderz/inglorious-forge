import { svg } from "@inglorious/web"

const FIRST_CHAR_INDEX = 0
const REST_START_INDEX = 1

export function renderByChartType(typeKey) {
  const methodName = `render${capitalize(typeKey)}Chart`

  return function renderUsingType(entity, params, api) {
    if (!entity) return renderEmptyTemplate()
    const chartType = api.getType(typeKey)
    return chartType?.[methodName]
      ? chartType[methodName](entity, params, api)
      : renderEmptyTemplate()
  }
}

export function buildComponentRenderer(
  methodName,
  typeOverride = null,
  preferChartTypeProp = false,
) {
  return function renderComponent(entity, props = {}, api) {
    if (!entity) return renderEmptyTemplate()
    const { config = {}, chartType = null } = props
    const resolvedTypeName =
      typeOverride || (preferChartTypeProp ? chartType : null) || entity.type
    const type = api.getType(resolvedTypeName)
    return type?.[methodName]
      ? type[methodName](entity, { config }, api)
      : renderEmptyTemplate()
  }
}

export function renderWithEntityTypeMethod(entity, methodName, params, api) {
  const type = api.getType(entity.type)
  return type?.[methodName]
    ? type[methodName](entity, params, api)
    : renderEmptyTemplate()
}

export function createTypeDispatcher(api) {
  return function dispatchByEntityType(entity, methodName, params) {
    return renderWithEntityTypeMethod(entity, methodName, params, api)
  }
}

export function renderEmptyTemplate() {
  return svg``
}

function capitalize(value) {
  return value
    ? value[FIRST_CHAR_INDEX].toUpperCase() + value.slice(REST_START_INDEX)
    : ""
}
