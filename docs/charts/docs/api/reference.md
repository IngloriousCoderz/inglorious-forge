---
title: API Reference
description: Public API of @inglorious/charts.
---

# API Reference

## Exports

```js
import { Chart, streamSlide } from "@inglorious/charts"
```

## `Chart`

Um único objeto para **modo config** (`api.render(entityId)`) e **composição** (`Chart.render` com `children`).

- Registre o mesmo objeto para cada tipo de entidade no store (`line: Chart`, `area: Chart`, …). O campo `type` da entidade (`"line"`, `"area"`, …) orienta defaults e primitivas.
- **`Chart.render(props, api)`**: com `props.children`, roda composição (`createFrameFromRender`); sem `children`, trata `props` como snapshot de entidade (`createFrameFromEntity`).

### Factories (composição)

- `Chart.CartesianGrid(config)`
- `Chart.XAxis(config)`
- `Chart.YAxis(config)`
- `Chart.Line(config)`
- `Chart.Area(config)`
- `Chart.Bar(config)`
- `Chart.Pie(config)`
- `Chart.Dots(config)`
- `Chart.Tooltip(config)`
- `Chart.Legend(config)`
- `Chart.Brush(config)`

### Exemplo (composição)

```js
Chart.render(
  {
    entity: "salesLine",
    width: 800,
    height: 400,
    dataKeys: ["value"],
    children: [
      Chart.CartesianGrid(),
      Chart.XAxis({ dataKey: "name" }),
      Chart.YAxis(),
      Chart.Line({ dataKey: "value" }),
      Chart.Tooltip({}),
    ],
  },
  api,
)
```

## `streamSlide`

Utilitário para janela deslizante em dados realtime (veja o entry `realtime` do pacote se usar `withRealtime`).

## Eventos

Handlers principais: `dataUpdate`, `sizeUpdate`, `tooltipShow`, `tooltipMove`, `tooltipHide`, `brushChange` — via `api.notify(...)`.
