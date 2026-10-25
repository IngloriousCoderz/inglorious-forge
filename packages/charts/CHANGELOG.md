# @inglorious/charts

## 11.1.4

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.7.2

## 11.1.3

### Patch Changes

- @inglorious/web@6.7.1

## 11.1.2

### Patch Changes

- Types follow the store's: an entity drawn by a library type extends its entity interface, such as `interface AppRouterEntity extends RouterEntity { type: "Router" }`, and the type registers under any name with no cast.

  - `@inglorious/web`'s `Api` is the store's, which loading web's types gives a `render`. `RouterEntity`, `FormEntity` and the sensor entities take `id?: string` and any `type`. `@inglorious/web/test` has types, and the `lit-html` directives (`classMap`, `repeat`, …) are typed rather than `any`.
  - `I18nEntity`, `DataGridProps` and `VirtualListEntity` take `id?: string`; `ButtonProps`' `type` is optional. Component types (`RouterType`, `I18nType`, `LogoType`, …) are type aliases, which fit a store's `types`.
  - `withRealtime` accepts the type the store composes.
  - `@inglorious/react-store`'s `useEntity("form")` gives that entity's own type, and `useSelector` reads the app's state.

- Updated dependencies
  - @inglorious/web@6.7.0

## 11.1.1

### Patch Changes

- @inglorious/web@6.6.2

## 11.1.0

### Minor Changes

- - Config mode takes `xTickFormatter`, `yTickFormatter` and `tooltipFormatter`. They are functions, so they are passed at render time rather than stored in the entity: a type wrapping `Chart` adds them in its own `render`.
  - `Tooltip` takes a `formatter(value, name)` for the value it shows. A pie slice keeps its percentage after the formatted value.

### Patch Changes

- @inglorious/web@6.6.1

## 11.0.0

### Major Changes

- Charts follow the store's rules: rendering only reads, and every change of state is an event.

  **Breaking changes, and how to migrate:**

  - **Primitives are named exports.** `Chart.Line(...)` becomes `Line(...)`, imported with `import { Chart, Line, XAxis } from "@inglorious/charts"`; the same for `CartesianGrid`, `XAxis`, `YAxis`, `Area`, `Bar`, `Pie`, `Dots`, `Tooltip`, `Legend` and `Brush`. `Chart` keeps its event handlers and `render`, so in TypeScript it fits the store's `types` without a cast.
  - **A brush needs an entity.** Pass `entity: "<id>"` and `api` to a composition with a `Brush`, or render the chart with `api.render(id)`. Dragging the brush dispatches `brushChange` to it; nothing is written while rendering anymore.
  - **Tooltips are state.** Hovering a datum dispatches `tooltipShow`, leaving it `tooltipHide`, and the tooltip is drawn from `entity.tooltip`. Charts without an entity show the browser's own tooltips, from SVG `<title>`s.
  - **`withRealtime` follows data the app pushes, instead of making it up.** Push points with `api.notify("#id:streamPush", value)`, a number or a whole data point. It no longer runs a timer, generates random values or seeds data; the `streamTick` event and the `intervalMs`, `min`, `max`, `variation` and `currentValue` options are gone. `realtime.paused` is now `realtime.isPaused`. While paused the chart does not change: pushed points wait in `realtime.pending` and are added on play.

  **New:**

  - `tickFormatter` on `XAxis` and `YAxis`.
  - `XAxis` shows only as many labels as fit without overlapping, keeping the last, as Recharts does; the vertical grid lines follow them. `interval` and `minTickGap` tune it, and `interval: 0` shows every label.
  - Text, axes, grid, brush and tooltip are drawn with the `--iw-chart-*` custom properties, which `theme.css` maps to an Inglorious UI theme, so charts follow a dark theme.
  - A pie's tooltip shows the slice's value and share.
  - `hasDots` on line and area entities: line charts draw dots by default and can turn them off, area charts can turn them on.

### Patch Changes

- Rendering fixes:

  - Pie and donut charts honor `dataKey` and `nameKey`: rows keep their own fields instead of being rebuilt as `{ label, value }`, which turned every slice into "Slice N" with a value of 0.
  - A missing value leaves a gap in a line or area, and no dot, instead of being drawn as 0.
  - Rows that share an x label, such as two "Mon", are drawn at their own positions instead of on top of each other.
  - A chart rendered without `width` and `height` uses the defaults everywhere, instead of producing `NaN` coordinates.
  - Bars stay within their categories: with many of them, they get thinner instead of overlapping, as a 6-pixel minimum width made them do.
  - The legend shows each series in the color it is drawn with, including a `stroke` or `fill` set on its primitive.
  - The chart's accessible name is `ariaLabel`, or its type ("line chart"), instead of its internal id.
  - The undocumented `showTooltip` prop, an alias of `hasTooltip`, is removed.

- Ship TypeScript declarations for `Chart`, its primitives and their props, chart entities and data, `streamSlide`, and `withRealtime` from `@inglorious/charts/realtime`.

## 10.0.7

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.6.1

## 10.0.6

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.6.0

## 10.0.5

### Patch Changes

- @inglorious/web@6.5.2

## 10.0.4

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.5.1

## 10.0.3

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.5.0

## 10.0.2

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.4.2

## 10.0.1

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.4.1

## 10.0.0

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.4.0

## 9.0.0

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.3.0

## 8.0.0

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.2.0

## 7.0.3

### Patch Changes

- Fix chart dots not showing correctly

## 7.0.2

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.1.2

## 7.0.1

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.1.1

## 7.0.0

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.1.0
