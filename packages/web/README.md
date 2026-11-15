# @inglorious/web

[![NPM version](https://img.shields.io/npm/v/@inglorious/web.svg)](https://www.npmjs.com/package/@inglorious/web)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A web framework that renders the whole UI as a function of an [Inglorious Store](https://www.npmjs.com/package/@inglorious/store) of entities, and lets [lit-html](https://lit.dev/docs/libraries/standalone-templates/) update only the DOM that changed. Plain JavaScript: no compiler, no signals, no component state.

**[Documentation](https://inglorious.dev/web/)**

## Install

```bash
pnpm add @inglorious/store @inglorious/web
```

Or scaffold an app, with routing, UI, i18n, sign-in, push and native builds wired:

```bash
pnpm create @inglorious/app
```

## In a few lines

```javascript
import { createStore } from "@inglorious/store"
import { html, mount } from "@inglorious/web"

const types = {
  Counter: {
    increment(entity) {
      entity.value++
    },
    render(entity, api) {
      return html`<button @click=${() => api.notify(`#${entity.id}:increment`)}>
        Clicked ${entity.value} times
      </button>`
    },
  },
}

const store = createStore({
  types,
  entities: { counter: { type: "Counter", value: 0 } },
})

mount(store, (api) => api.render("counter"), document.getElementById("root"))
```

A type handles events and renders its entity. Every change is an event, applied in order; after each update the whole template reruns and lit-html patches what changed. Handlers are tested as functions, with `trigger` from `@inglorious/web/test`.

## What's in it

- [Router](https://inglorious.dev/web/featured/router): path routing, lazy pages, guards as behaviors, accessible navigation.
- [Form](https://inglorious.dev/web/featured/form): values, errors, touched state, array fields, validation.
- [Device](https://inglorious.dev/web/featured/device): sensors and features as entity types, with Capacitor plugins in a native app: compass, geolocation, element size, media queries, network status, page visibility, keyboard, share, haptics, local notifications, biometrics, storage.
- [Native app and PWA](https://inglorious.dev/web/featured/overview): app links, back button, system bars, store updates, live updates, PWA updates.
- [Sign-in](https://inglorious.dev/web/featured/sign-in), [analytics](https://inglorious.dev/web/featured/analytics) and [push](https://inglorious.dev/web/featured/push), each behind an adapter.
- [Decorators](https://inglorious.dev/web/advanced/decorators): `withDebounce`, `withThrottle`, `withLiveReload`, `withErrorBoundary`.
- [JSX](https://inglorious.dev/web/featured/jsx) and [Vue-like templates](https://inglorious.dev/web/featured/vue-templates), compiled to lit-html.
- [SSX](https://inglorious.dev/ssx/) for sites rendered at build time or on request, then hydrated.

UI components live in [Inglorious UI](https://inglorious.dev/ui).

## License

MIT © [Matteo Antony Mistretta](https://github.com/IngloriousCoderz)
