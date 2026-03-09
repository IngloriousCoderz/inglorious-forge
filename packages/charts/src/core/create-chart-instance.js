import { extractDataKeysFromChildren } from "../utils/extract-data-keys.js"
import { CHART_TYPE_METHODS } from "./chart-type-methods.js"
import {
  attachInstancePascalAliases,
  createDeclarativeChildren,
  createInstanceRenderAliases,
} from "./declarative-children.js"
import { renderWithEntityTypeMethod } from "./render-dispatch.js"

const INLINE_PROTECTED_PROPS = [
  "showTooltip",
  "width",
  "height",
  "type",
  "data",
]

export function createChartInstance(entity, api, isInline = false) {
  let currentEntity = entity

  const readCurrentEntity = () => currentEntity
  const writeCurrentEntity = (nextEntity) => {
    currentEntity = nextEntity
  }

  const buildRenderer = isInline
    ? createSelfManagedRenderer({
        readCurrentEntity,
        writeCurrentEntity,
        api,
      })
    : createStoreManagedRenderer({ readCurrentEntity, api })
  const legacyAdapter = wrapAsLegacyAdapter(buildRenderer)

  const declarativeChildren = createDeclarativeChildren()
  const standardMethods = mapCatalogToMethods(buildRenderer, "standard")
  const legacyMethods = mapCatalogToMethods(legacyAdapter, "legacy")

  const instance = {
    ...standardMethods,

    ...declarativeChildren,

    ...legacyMethods,

    ...createInstanceRenderAliases(declarativeChildren),
  }

  return attachInstancePascalAliases(instance)
}

export function createInlineChartInstance(api, tempEntity, initializeEntity) {
  const entity = tempEntity || {
    id: `__temp_${Date.now()}`,
    type: "line",
    data: [],
  }

  const preserved = pickDefinedProps(entity, INLINE_PROTECTED_PROPS)

  initializeEntity(entity)
  Object.assign(entity, preserved)

  return createChartInstance(entity, api, true)
}

function mapCatalogToMethods(buildRenderMethod, mode) {
  return Object.fromEntries(
    CHART_TYPE_METHODS.map(({ type, suffix }) => {
      const methodName = `render${suffix}Chart`
      const exposedName = mode === "standard" ? `${suffix}Chart` : methodName
      return [exposedName, buildRenderMethod(type, methodName)]
    }),
  )
}

function createStoreManagedRenderer({ readCurrentEntity, api }) {
  return (chartType, renderMethod) =>
    (config = {}, children = []) => {
      const currentEntity = readCurrentEntity()
      const finalConfig = buildFinalConfig({
        chartType,
        config,
        children,
        dataFromEntity: currentEntity.data,
        shouldFallbackToEntityData: true,
      })

      return dispatchRender({
        entity: currentEntity,
        renderMethod,
        children,
        finalConfig,
        api,
      })
    }
}

function createSelfManagedRenderer({
  readCurrentEntity,
  writeCurrentEntity,
  api,
}) {
  return (chartType, renderMethod) =>
    (config = {}, children = []) => {
      const currentEntity = readCurrentEntity()
      const nextEntity = buildInlineEntity(currentEntity, chartType, config)
      writeCurrentEntity(nextEntity)

      const finalConfig = buildFinalConfig({
        chartType,
        config,
        children,
        dataFromEntity: nextEntity.data,
        shouldFallbackToEntityData: false,
      })

      return dispatchRender({
        entity: nextEntity,
        renderMethod,
        children,
        finalConfig,
        api,
      })
    }
}

function wrapAsLegacyAdapter(buildStandardMethod) {
  return (chartType, renderMethod) =>
    (children = [], config = {}) =>
      buildStandardMethod(chartType, renderMethod)(config, children)
}

function buildInlineEntity(currentEntity, chartType, config) {
  const resolvedData = config.data ?? currentEntity.data
  return {
    ...currentEntity,
    type: config.type || chartType,
    ...(resolvedData ? { data: resolvedData } : null),
    width: config.width || currentEntity.width,
    height: config.height || currentEntity.height,
  }
}

function buildFinalConfig({
  chartType,
  config,
  children,
  dataFromEntity,
  shouldFallbackToEntityData,
}) {
  return {
    ...config,
    data:
      config.data || (shouldFallbackToEntityData ? dataFromEntity : undefined),
    dataKeys:
      chartType !== "pie"
        ? config.dataKeys || extractDataKeysFromChildren(children)
        : undefined,
  }
}

function dispatchRender({ entity, renderMethod, children, finalConfig, api }) {
  return renderWithEntityTypeMethod(
    entity,
    renderMethod,
    {
      children: Array.isArray(children) ? children : [children],
      config: finalConfig,
    },
    api,
  )
}

function pickDefinedProps(source, props) {
  return props.reduce((acc, prop) => {
    if (source[prop] !== undefined) acc[prop] = source[prop]
    return acc
  }, {})
}
