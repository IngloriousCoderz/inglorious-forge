# 🔧 @inglorious/vite-plugin-hmr

> **Keep your Inglorious Web state while you develop.**

`@inglorious/vite-plugin-hmr` preserves an Inglorious Web store when Vite
reloads the module that mounts your app. Editing views, components, and other
application code therefore keeps the current UI state instead of resetting it.

## Installation

```bash
npm install -D @inglorious/vite-plugin-hmr
```

The plugin supports Vite `7.1.3` and later.

## Usage

Add `hmr()` to your Vite development configuration:

```js
import { defineConfig } from "vite"
import { hmr } from "@inglorious/vite-plugin-hmr"

export default defineConfig({
  plugins: [hmr()],
})
```

The application entrypoint should mount the store at the top level:

```js
import { mount } from "@inglorious/web"

import { app } from "./app"
import { store } from "./store"

mount(store, app.render, document.getElementById("root"))
```

The plugin is active only during `vite`'s development server. It preserves the
store snapshot through a hot update and hydrates the existing DOM instead of
mounting a second application instance.

## Seed data

When the store uses an imported `entities` object, changes to that file start
the app with fresh seed data instead of restoring the previous snapshot:

```js
import { createStore } from "@inglorious/store"

import { entities } from "./entities"

export const store = createStore({ entities })
```

If the seed file cannot be resolved statically, the plugin falls back to the
store module. Inline seed objects are therefore treated as part of that module.

## Requirements and limitations

- The plugin recognizes a named `mount` import from `@inglorious/web`.
- The `mount(...)` call must be a top-level expression in a JavaScript or
  TypeScript module.
- The store argument must be an imported identifier so the plugin can resolve
  its module.
- The plugin preserves state for normal Vite HMR updates; a full page reload
  still resets the application.
