---
title: Testing
description: Recommended testing strategy for @inglorious/charts.
---

# Testing

## Unit tests first

`@inglorious/charts` already has Vitest coverage for:

- chart renderers
- components (grid, legend, tooltip, axes, brush)
- data and layout utilities

See `/packages/charts/src/**/*.test.js`.

## Add e2e where needed

Use Playwright only for browser-specific assertions:

- tooltip positioning in real layout
- pointer interactions and hover behavior
- visual layering regressions

For most chart logic, unit tests are enough and faster.
