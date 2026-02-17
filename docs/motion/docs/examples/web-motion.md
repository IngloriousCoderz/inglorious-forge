---
title: web-motion App
description: Features demonstrated by the web-motion example app.
---

# web-motion App

The [`/examples/apps/web-motion`](https://github.com/IngloriousCoderz/inglorious-forge/tree/main/examples/apps/web-motion) app demonstrates three core motion features:

## 1. Variants and presence

- Toggle variants with `motionVariantChange`
- Remove entities with `removeWithMotion`
- Serialize exits with `presence: { mode: "wait" }`

## 2. Layout FLIP

- Enable `layout: true`
- Animate reflow when cards expand/compact or reorder

## 3. Shared layout

- Assign `motionLayoutId` to related entities
- Animate transitions between compact/expanded states

## Run it locally

```bash
pnpm --filter web-motion dev
```

Use the app controls to trigger:

- variant changes
- toast add/remove
- layout mode changes
- shared element transitions
