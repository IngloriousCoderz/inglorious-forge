---
title: What is Inglorious Charts?
description: Overview of @inglorious/charts and its design goals.
---

# What is Inglorious Charts?

`@inglorious/charts` is a charting package for `@inglorious/web`.

It focuses on:

- Declarative chart rendering with SVG
- Entity-based data flow
- Event-driven interactions (tooltip, brush)
- Predictable behavior through pure utilities

## Two usage styles

### Config-first

Register chart types (`lineChart`, `areaChart`, etc.) and render entities directly with `api.render(id)`.

### Composition

Use the exported `chart` helper (`chart.renderLineChart`, `chart.XAxis`, `chart.Tooltip`, etc.) for finer control.

Both styles can coexist in the same app.
