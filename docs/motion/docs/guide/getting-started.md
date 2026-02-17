---
title: Getting Started
description: Install and use @inglorious/motion in an Inglorious Web app.
---

# Getting Started

## Install

```bash
pnpm add @inglorious/web @inglorious/motion
```

## Compose a type with motion

```js
import { html } from "@inglorious/web"
import { withMotion } from "@inglorious/motion"

const card = {
  render(entity, api) {
    return html`
      <article>
        <button
          @click=${() =>
            api.notify(`#${entity.id}:motionVariantChange`, "hidden")}
        >
          Hide
        </button>
        <button
          @click=${() => api.notify(`#${entity.id}:removeWithMotion`, "exit")}
        >
          Remove
        </button>
      </article>
    `
  },
}

export const motionCard = [
  card,
  withMotion({
    initial: "visible",
    layout: true,
    variants: {
      visible: {
        frames: [
          { opacity: 0, transform: "translateY(8px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        options: { duration: 220, easing: "ease-out" },
      },
      hidden: {
        frames: [{ opacity: 1 }, { opacity: 0.3 }],
        options: { duration: 180, easing: "ease-in" },
      },
      exit: {
        frames: [
          { opacity: 1, transform: "scale(1)" },
          { opacity: 0, transform: "scale(0.96)" },
        ],
        options: { duration: 160, easing: "ease-in" },
      },
    },
  }),
]
```

## Inglorious Motion lifecycle classes

The motion host receives classes with your configured prefix (default: `iw-motion`):

- `iw-motion--start`
- `iw-motion--active`
- `iw-motion--end`
- `iw-motion--variant-<name>`

Use these to style each phase with plain CSS.

## Demo app

See the full example app in `/examples/apps/web-motion`.
