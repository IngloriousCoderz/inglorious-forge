import { extractDataKeysFromChildren } from "../utils/extract-data-keys.js"
import { CHART_TYPE_METHODS } from "./chart-type-methods.js"
import {
  attachInstancePascalAliases,
  createDeclarativeChildren,
  createInstanceRenderAliases,
} from "./declarative-children.js"
import { renderWithEntityTypeMethod } from "./render-dispatch.js"

export function createChartInstance(entity, api, isInline = false) {
  let currentEntity = entity

  const readCurrentEntity = () => currentEntity
  const writeCurrentEntity = (nextEntity) => {
    currentEntity = nextEntity
  }

  const buildChartRenderMethod = isInline
    ? createInlineMethodBuilder({
      readCurrentEntity,
      writeCurrentEntity,
      api,
    })
    : createEntityMethodBuilder({ readCurrentEntity, api })

  const declarativeChildren = createDeclarativeChildren()
  const standardChartMethods = buildChartMethodMap(buildChartRenderMethod, true)
  const compatibilityChartMethods = buildChartMethodMap(
    buildChartRenderMethod,
    false,
  )

  const instance = {
    ...standardChartMethods,

    ...declarativeChildren,

    ...compatibilityChartMethods,

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

  const protectedProps = ["showTooltip", "width", "height", "type", "data"]
  const preserved = protectedProps.reduce((acc, prop) => {
    if (entity[prop] !== undefined) acc[prop] = entity[prop]
    return acc
  }, {})

  initializeEntity(entity)
  Object.assign(entity, preserved)

  return createChartInstance(entity, api, true)
}

function buildChartMethodMap(buildChartRenderFactory, useStandardSignature) {
  return Object.fromEntries(
    CHART_TYPE_METHODS.map(({ type, suffix }) => {
      const methodName = `render${suffix}Chart`
      const exposedName = useStandardSignature ? `${suffix}Chart` : methodName
      return [exposedName, buildChartRenderFactory(type, methodName, useStandardSignature)]
    }),
  )
}

function createEntityMethodBuilder({ readCurrentEntity, api }) {
  return (chartType, renderMethod, useStandardSignature = false) =>
    (firstArg = {}, secondArg = []) => {
      const { config, children } = resolveRenderArgs(
        firstArg,
        secondArg,
        useStandardSignature,
      )

      const currentEntity = readCurrentEntity()
      const finalConfig = buildFinalConfig({
        chartType,
        config,
        children,
        dataFromEntity: currentEntity.data,
        shouldFallbackToEntityData: true,
      })

      return renderWithEntityTypeMethod(
        currentEntity,
        renderMethod,
        {
          children: Array.isArray(children) ? children : [children],
          config: finalConfig,
        },
        api,
      )
    }
}

function createInlineMethodBuilder({ readCurrentEntity, writeCurrentEntity, api }) {
  return (chartType, renderMethod, useStandardSignature = false) =>
    (firstArg = {}, secondArg = []) => {
      const { config, children } = resolveRenderArgs(
        firstArg,
        secondArg,
        useStandardSignature,
      )

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

      return renderWithEntityTypeMethod(
        nextEntity,
        renderMethod,
        {
          children: Array.isArray(children) ? children : [children],
          config: finalConfig,
        },
        api,
      )
    }
}

function resolveRenderArgs(firstArg, secondArg, useStandardSignature) {
  const isLegacySignature = !useStandardSignature && Array.isArray(firstArg)
  return {
    config: isLegacySignature ? secondArg || {} : firstArg,
    children: isLegacySignature ? firstArg : secondArg,
  }
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
    data: config.data || (shouldFallbackToEntityData ? dataFromEntity : undefined),
    dataKeys:
      chartType !== "pie"
        ? config.dataKeys || extractDataKeysFromChildren(children)
        : undefined,
  }
}
