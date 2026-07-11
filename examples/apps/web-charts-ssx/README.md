# web-charts-ssx

A demo showing that [@inglorious/charts](../../../packages/charts) render on the
server (SSG/SSR) and rehydrate on the client with [@inglorious/ssx](../../../packages/ssx).

## Why It Works

Inglorious Charts are pure functions of state that produce plain **SVG** — no
local state, no lifecycle hooks, no DOM measurement at render time. Chart
geometry is derived entirely from `entity.width` / `entity.height` and the data,
so the exact same SVG is produced on the server and on the client. Every
browser-only API (`getBoundingClientRect`, etc.) lives inside client-only event
handlers (tooltips, brush), never during render.

That means:

1. `ssx build` pre-renders each chart to static SVG in `dist/`
2. The browser shows the chart immediately (no client render needed for first paint)
3. `lit-html` hydration attaches the interactive handlers (hover tooltips) in place

## What's Included

- Line, Area, and Bar charts (config style, via `api.render(id)`)
- Bar chart in composition style (`Chart.render({ children: [...] })`)
- Pie and Donut charts

## Quick Start

```bash
cd examples/apps/web-charts-ssx
pnpm install
pnpm dev      # dev server at http://localhost:3000
```

Then:

```bash
pnpm build    # pre-render the static site into dist/
pnpm preview  # serve the production build
```

## Verifying SSG

After `pnpm build`, open `dist/index.html` and confirm the `<svg>` markup for
every chart — including the `<title>` hover tooltips — is present in the initial
HTML. No JavaScript is required for the charts to appear.

## Notes

- SVG `<title>` tooltips are emitted via `unsafeSVG` — `@lit-labs/ssr` can't bind inside a raw-text element.
- Chart data is deterministic (no `Math.random`, no function-valued props) so the
  server-rendered SVG matches what the client hydrates exactly.
