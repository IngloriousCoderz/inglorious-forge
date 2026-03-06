import { extractDataKeysFromChildren } from "../utils/extract-data-keys.js"
import {
  attachInstancePascalAliases,
  createDeclarativeChildren,
  createInstanceRenderAliases,
} from "./declarative-children.js"
import { renderWithEntityTypeMethod } from "./render-dispatch.js"

export function createChartInstance(entity, api, isInline = false) {
  let currentEntity = entity

  const buildChartRenderFactory =
    (chartType, renderMethod, useStandardSignature = false) =>
    (firstArg = {}, secondArg = []) => {
      const isLegacySignature = !useStandardSignature && Array.isArray(firstArg)
      const config = isLegacySignature ? secondArg || {} : firstArg
      const children = isLegacySignature ? firstArg : secondArg

      if (isInline) {
        const resolvedData = config.data ?? currentEntity.data
        currentEntity = {
          ...currentEntity,
          type: config.type || chartType,
          ...(resolvedData ? { data: resolvedData } : null),
          width: config.width || currentEntity.width,
          height: config.height || currentEntity.height,
        }
      }

      const finalConfig = {
        ...config,
        data:
          config.data ||
          (!isInline && currentEntity.data ? currentEntity.data : undefined),
        dataKeys:
          chartType !== "pie"
            ? config.dataKeys || extractDataKeysFromChildren(children)
            : undefined,
      }

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

  const declarativeChildren = createDeclarativeChildren()

  const instance = {
    LineChart: buildChartRenderFactory("line", "renderLineChart", true),
    AreaChart: buildChartRenderFactory("area", "renderAreaChart", true),
    BarChart: buildChartRenderFactory("bar", "renderBarChart", true),
    PieChart: buildChartRenderFactory("pie", "renderPieChart", true),

    ...declarativeChildren,

    renderLineChart: buildChartRenderFactory("line", "renderLineChart", false),
    renderAreaChart: buildChartRenderFactory("area", "renderAreaChart", false),
    renderBarChart: buildChartRenderFactory("bar", "renderBarChart", false),
    renderPieChart: buildChartRenderFactory("pie", "renderPieChart", false),

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

  const preserveShowTooltip =
    tempEntity?.showTooltip !== undefined ? tempEntity.showTooltip : undefined

  initializeEntity(entity)

  if (preserveShowTooltip !== undefined) {
    entity.showTooltip = preserveShowTooltip
  }

  return createChartInstance(entity, api, true)
}
