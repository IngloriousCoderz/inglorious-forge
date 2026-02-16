# @inglorious/motion

CSS-first motion primitives for `@inglorious/web` using type composition.

## Install

```bash
pnpm add @inglorious/motion @inglorious/web
```

## API

### `withMotion(config)`

Composes a type with a motion lifecycle driven by WAAPI.

- Adds `motionVariantChange(entity, variant)` handler.
- Adds `removeWithMotion(entity, payload, api)` handler (plays exit variant, then removes entity).
- Wraps your render with a motion host and applies lifecycle classes:
  - `${classPrefix}--start`
  - `${classPrefix}--active`
  - `${classPrefix}--end`
  - `${classPrefix}--variant-<name>`

## Example

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
        <button @click=${() => api.notify(`#${entity.id}:removeWithMotion`)}>
          Remove
        </button>
      </article>
    `
  },
}

const motionCard = [
  card,
  withMotion({
    initial: "visible",
    variants: {
      visible: {
        frames: [
          { opacity: 0, transform: "translateY(12px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        options: { duration: 220, easing: "ease-out" },
      },
      hidden: {
        frames: [{ opacity: 1 }, { opacity: 0.2 }],
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
