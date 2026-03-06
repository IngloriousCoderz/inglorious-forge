import { svg } from "@inglorious/web"

export function renderByChartType(typeKey) {
  const firstCharIndex = 0
  const restStartIndex = 1
  const firstChar = typeKey.charAt(firstCharIndex)
  const rest = typeKey.slice(restStartIndex)
  const methodName = `render${firstChar.toUpperCase() + rest}Chart`

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

export function renderEmptyTemplate() {
  return svg``
}
