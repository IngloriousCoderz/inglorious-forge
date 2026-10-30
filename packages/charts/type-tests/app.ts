import {
  createStore,
  type EntitiesState,
  type EntityType,
} from "@inglorious/store"
import type { Api } from "@inglorious/web"

import {
  Chart,
  type ChartEntity,
  Line,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadialBar,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "../types"
import { withRealtime } from "../types/realtime"

interface SharesEntity extends ChartEntity {
  type: "Shares"
}
interface LiveEntity extends ChartEntity {
  type: "LiveLine"
}

type AppEntity = SharesEntity | LiveEntity

interface AppState extends EntitiesState<AppEntity> {
  shares: SharesEntity
  live: LiveEntity
}

type AppApi = Api<AppEntity, AppState>

const Shares = {
  ...Chart,
  render(entity, api) {
    // @ts-expect-error: the api is typed in render too: type is "Shares"
    const kind: number | undefined = api.getEntity("shares")?.type
    return Chart.render(
      {
        ...entity,
        yTickFormatter: (value) => `${value}%`,
        tooltipFormatter: (value, name) => `${name}: ${String(value)}%`,
      },
      api,
    )
  },
} satisfies EntityType<SharesEntity, AppApi>

export const store = createStore<AppEntity, AppState>({
  types: { Shares, LiveLine: [Chart, withRealtime] },
  entities: { shares: { type: "Shares", data: [] } },
})

declare const api: AppApi
export const composed = Chart.render(
  {
    entity: "shares",
    children: [
      YAxis({ tickFormatter: (value) => `${value}%` }),
      Line({ dataKey: "value" }),
      Tooltip({ formatter: (value) => String(value) }),
    ],
  },
  api,
)

// @ts-expect-error: tick formatters take numbers
YAxis({ tickFormatter: (value: string) => value })

export const sideways = Chart.render({
  type: "bar",
  orientation: "horizontal",
  data: [{ name: "A", value: 1 }],
})
export const scatter = Chart.render({
  data: [{ name: "A", points: [{ x: 1, y: 2, z: 3 }] }],
  children: [XAxis(), YAxis(), Scatter({ dataKey: "A", r: 6 })],
})
export const radar = Chart.render({
  data: [{ name: "Speed", ada: 8 }],
  children: [PolarGrid(), PolarAngleAxis(), Radar({ dataKey: "ada" })],
})
export const radial = Chart.render({
  data: [{ label: "Move", value: 50 }],
  children: [RadialBar({ innerRadius: "30%", hasLabel: true })],
})

// @ts-expect-error: bars run vertically or horizontally
Chart.render({ type: "bar", orientation: "diagonal" })
