import { svg } from "@inglorious/web"

import {
  buildComposedChildren,
  renderComposedChart,
} from "../cartesian/composed.js"
import * as handlers from "../handlers.js"
import { ensureChartRuntimeIdWithKey } from "../utils/runtime-id.js"

const FIRST_CHAR_INDEX = 0
const REST_START_INDEX = 1
const inlineEntityCache = new WeakMap()
const inlineEntityKeyCache = new Map()

function renderByChartType(typeKey) {
  const methodName = `render${capitalize(typeKey)}Chart`

  return function renderUsingType(firstArg, secondArg, thirdArg) {
    const { entity, params, api } = normalizeRenderArgs(
      typeKey,
      firstArg,
      secondArg,
      thirdArg,
    )

    if (!entity || !api) return renderEmptyTemplate()
    const chartType = api.getType(typeKey)
    return chartType?.[methodName]
      ? chartType[methodName](entity, params, api)
      : renderEmptyTemplate()
  }
}

export function renderChart() {
  return function renderGeneric(firstArg, secondArg, thirdArg) {
    const { entity, params, api } = normalizeRenderArgs(
      null,
      firstArg,
      secondArg,
      thirdArg,
    )

    if (!api) return renderEmptyTemplate()

    const inferredType = inferChartType(entity, params)
    if (!inferredType) return renderEmptyTemplate()

    if (inferredType === "composed") {
      const normalized = normalizeRenderArgs(
        inferredType,
        firstArg,
        secondArg,
        thirdArg,
      )
      const composedEntity = {
        ...normalized.entity,
        ...normalized.params.config,
      }
      return renderComposedChart(
        composedEntity,
        {
          children: buildComposedChildren(composedEntity),
          config: normalized.params.config,
        },
        api,
      )
    }

    if (isCartesianType(inferredType)) {
      const normalized = normalizeRenderArgs(
        inferredType,
        firstArg,
        secondArg,
        thirdArg,
      )
      return renderComposedChart(normalized.entity, normalized.params, api)
    }

    return renderByChartType(inferredType)(firstArg, secondArg, thirdArg)
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
    if (type?.[methodName]) {
      return type[methodName](entity, { config }, api)
    }

    if (isCartesianType(entity.type)) {
      const composedType = api.getType("composed")
      if (composedType?.[methodName]) {
        return composedType[methodName](entity, { config }, api)
      }
    }

    return renderEmptyTemplate()
  }
}

function renderEmptyTemplate() {
  return svg``
}

function capitalize(value) {
  return value
    ? value[FIRST_CHAR_INDEX].toUpperCase() + value.slice(REST_START_INDEX)
    : ""
}

function normalizeRenderArgs(typeKey, firstArg, secondArg, thirdArg) {
  const { entity, api, params } = parseRenderArgs(firstArg, secondArg, thirdArg)

  if (!api) {
    return { entity: null, params, api: null }
  }

  if (!typeKey) {
    return { entity, params, api }
  }

  return normalizeInlineEntity(typeKey, entity, params, api)
}

function parseRenderArgs(firstArg, secondArg, thirdArg) {
  let entity = null
  let api = null
  let paramsSource = null

  if (isApiLike(secondArg) && thirdArg === undefined) {
    api = secondArg
    paramsSource = firstArg
  } else {
    entity = firstArg
    paramsSource = secondArg
    api = thirdArg
  }

  return { entity, api, params: parseRenderParams(paramsSource) }
}

function parseRenderParams(paramsSource) {
  if (Array.isArray(paramsSource)) {
    return { children: paramsSource, config: {} }
  }

  if (!paramsSource || typeof paramsSource !== "object") {
    return { children: [], config: {} }
  }

  const { children, config, ...rest } = paramsSource

  if (config && typeof config === "object") {
    return {
      children: Array.isArray(children)
        ? children
        : children == null
          ? []
          : [children],
      config: { ...config },
    }
  }

  return {
    children: Array.isArray(children)
      ? children
      : children == null
        ? []
        : [children],
    config: rest,
  }
}

function normalizeInlineEntity(typeKey, entity, params, api) {
  let resolvedEntity = entity

  if (!resolvedEntity) {
    resolvedEntity = getInlineEntity(typeKey, params.config)
  }

  hydrateEntityFromConfig(typeKey, resolvedEntity, params.config)

  if (api.getEntity) {
    const existingEntity = resolvedEntity?.id
      ? api.getEntity(resolvedEntity.id)
      : undefined
    if (existingEntity) {
      resolvedEntity =
        params.config?.data !== undefined
          ? { ...existingEntity, data: params.config.data }
          : existingEntity
    }
  }

  return { entity: resolvedEntity, params, api }
}

function inferChartType(entity, params) {
  const configType = normalizeChartType(params?.config?.type)
  if (configType) return configType

  const entityType = normalizeChartType(entity?.type)
  if (entityType) return entityType

  const children = params?.children
  if (Array.isArray(children)) {
    if (children.some((child) => child?.type === "Bar")) return "bar"
    if (children.some((child) => child?.type === "Area")) return "area"
    if (children.some((child) => child?.type === "Line")) return "line"
    if (children.some((child) => child?.type === "Pie")) return "pie"
  }

  return null
}

function normalizeChartType(type) {
  if (!type || typeof type !== "string") return null
  const lowered = type.toLowerCase()
  if (lowered === "donut") return "pie"
  if (lowered === "line") return "line"
  if (lowered === "area") return "area"
  if (lowered === "bar") return "bar"
  if (lowered === "pie") return "pie"
  if (lowered === "composed") return "composed"
  return null
}

function isCartesianType(type) {
  return type === "line" || type === "area" || type === "bar"
}

function isApiLike(value) {
  return value && typeof value.getType === "function"
}

// normalizeRenderArgs replaces normalizeRenderByTypeArgs,
// normalizeRenderChartArgs and normalizeChartParams.

function buildInlineEntity(typeKey, config = {}) {
  const entity = {
    type: typeKey,
    data: config.data ?? [],
    __inline: true,
  }

  if (config.id != null) entity.id = config.id
  if (config.width != null) entity.width = config.width
  if (config.height != null) entity.height = config.height
  if (config.showTooltip != null) entity.showTooltip = config.showTooltip

  handlers.create(entity)

  if (config.padding != null) entity.padding = config.padding
  if (config.showTooltip != null) entity.showTooltip = config.showTooltip

  ensureEntityIdentity(entity, config)

  return entity
}

function getInlineEntity(typeKey, config = {}) {
  const runtimeKey = config.key ?? config.data

  if (runtimeKey && typeof runtimeKey === "object") {
    const cached = inlineEntityCache.get(runtimeKey)
    if (cached) return cached
    const entity = buildInlineEntity(typeKey, config)
    inlineEntityCache.set(runtimeKey, entity)
    return entity
  }

  if (runtimeKey != null) {
    const cacheKey = `${typeKey}:${String(runtimeKey)}`
    const cached = inlineEntityKeyCache.get(cacheKey)
    if (cached) return cached
    const entity = buildInlineEntity(typeKey, config)
    inlineEntityKeyCache.set(cacheKey, entity)
    return entity
  }

  return buildInlineEntity(typeKey, config)
}

function hydrateEntityFromConfig(typeKey, entity, config = {}) {
  if (!entity || typeof entity !== "object") return
  if (Object.isFrozen(entity)) return

  entity.type ||= typeKey

  if (entity.data === undefined && config.data !== undefined) {
    entity.data = config.data
  }

  ensureEntityIdentity(entity, config)
}

function ensureEntityIdentity(entity, config = {}) {
  if (!entity || typeof entity !== "object") return
  if (Object.isFrozen(entity)) return

  if (config.id != null && (entity.id === undefined || entity.id === null)) {
    entity.id = config.id
  }

  const runtimeKey = config.key ?? config.data
  const runtimeId = ensureChartRuntimeIdWithKey(entity, runtimeKey)

  if (entity.id === undefined || entity.id === null || entity.id === "") {
    entity.id = runtimeId
  }
}
