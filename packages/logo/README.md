# @inglorious/logo

The Inglorious Logo component — a small, dependency-light package that provides the 3D logo render and interactive handlers for Inglorious Web.

---

## Install

Add the package to your project:

```bash
pnpm add @inglorious/logo
```

---

## Usage

Import the package and its stylesheet, and (optionally) the types for TypeScript.

Then, register the `logo` type in your store, create an entity of that type, and use `api.render(entityId)` inside your templates (see the [`web-logo`](https://github.com/IngloriousCoderz/inglorious-forge/tree/main/examples/apps/web-logo) demo app).

```js
import { createStore } from "@inglorious/web"
import { logo } from "@inglorious/logo"
import "@inglorious/logo/style.css"

const entities = {
  logo: {
    type: "Logo",
    size: 256,
    faces: [
      { image: "I", reverse: false, eye: true },
      { image: "W", reverse: false, eye: false },
    ],
    isInteractive: false,
    isScrollPrevented: true,
  },
}

const store = createStore({
  types: { logo },
  entities,
})

// app render function receives `api` from mount()
const app = {
  render(api) {
    return api.render("logo")
  },
}

// TypeScript: import the entity type if you want to annotate entity shapes
// import type { LogoEntity } from "@inglorious/logo"
```

---

## License

**MIT License - Free and open source**

Created by [Matteo Antony Mistretta](https://github.com/IngloriousCoderz)

You're free to use, modify, and distribute this software. See [LICENSE](./LICENSE) for details.

---

## Contributing

Contributions welcome! Please read our [Contributing Guidelines](../../CONTRIBUTING.md) first.
