---
title: What is Inglorious Motion?
description: Why @inglorious/motion exists and how it fits Inglorious Web.
---

# What is Inglorious Motion?

`@inglorious/motion` is a small motion layer for `@inglorious/web`.

It is built around the same principles as Inglorious Web:

- Entity-based state
- Event-driven updates
- Type composition over framework magic
- Predictable behavior before visual complexity

Instead of introducing a component runtime, `@inglorious/motion` adds motion handlers and a motion host to your existing type.

## Core idea

You compose your type with `withMotion(config)`, then trigger motion through events:

```js
api.notify(`#${entity.id}:motionVariantChange`, "hidden")
api.notify(`#${entity.id}:removeWithMotion`, "exit")
```

## What it covers

- Variant animations (`visible`, `hidden`, `exit`, etc.)
- Presence orchestration (`sync` / `wait`)
- Layout FLIP transitions (`layout: true`)
- Shared layout transitions (`motionLayoutId`)

## What it intentionally does not do

- No React-like component lifecycle API
- No implicit unmount interception
- No custom animation scheduler replacing the browser

The package stays small and delegates the heavy lifting to native WAAPI and CSS.
