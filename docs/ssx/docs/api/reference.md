---
title: "API Reference"
description: "The ssx commands and their programmatic equivalents."
---

# API Reference

Each command has a function of its own, to run SSX from code.

## CLI

SSX provides a simple CLI for building and developing:

### `ssx build`

Builds your static site:

```bash
pnpm ssx build [options]

Options:
  -c, --config <file>  Config file (default: "site.config.js")
  -r, --root <dir>     Source root directory (default: "src")
  -o, --out <dir>      Output directory (default: "dist")
  -i, --incremental    Enable incremental builds (default: true)
  -f, --force          Force clean build, ignore cache
```

### `ssx dev`

Starts the Vite development server on port 3000 with hot reload:

```bash
pnpm ssx dev [options]

Options:
  -c, --config <file>  Config file (default: "site.config.js")
  -r, --root <dir>     Source root directory (default: "src")
  -p, --port <port>    Dev server port (default: 3000)
```

### `ssx serve`

Serves the production build with static files and API routes. Pages that export `ssr` are not in the build: serve a site with them with `ssx ssr`.

```bash
pnpm ssx serve [options]

Options:
  -c, --config <file>  Config file (default: "site.config.js")
  -r, --root <dir>     Source root directory (default: ".")
  -o, --out <dir>      Output directory (default: "dist")
  -p, --port <port>    Server port (default: 3000)
```

### `ssx ssr`

Starts a server that renders every page on request, those that export `ssr` and static ones alike, and serves the API routes and assets. It renders from your sources through Vite, so it needs no `ssx build`:

```bash
pnpm ssx ssr [options]

Options:
  -c, --config <file>  Config file (default: "site.config.js")
  -r, --root <dir>     Root directory (default: ".")
  -p, --port <port>    Server port (default: 3000)
```

## Programmatic API

### Build API

```javascript
import { build } from "@inglorious/ssx/build"

await build({
  rootDir: "src",
  outDir: "dist",
  configFile: "site.config.js",
  incremental: true,
  force: false,
})
```

### Dev Server API

```javascript
import { dev } from "@inglorious/ssx/dev"

await dev({
  rootDir: "src",
  port: 3000,
  configFile: "site.config.js",
})
```

### SSR Server API

Renders every page on request, and serves the API routes:

```javascript
import { ssr } from "@inglorious/ssx/ssr"

const server = await ssr({
  rootDir: ".",
  port: 3000,
  configFile: "site.config.js",
})

server.close()
```

### Production Server API

```javascript
import { serve } from "@inglorious/ssx/serve"

await serve({
  rootDir: ".",
  outDir: "dist",
  port: 3000,
  configFile: "site.config.js",
})
```

---

<!-- ## Examples

Check out these example projects:

- **[Basic Blog](https://github.com/IngloriousCoderz/inglorious-forge/tree/main/examples/ssx-blog)** - Simple blog with posts
- **[Documentation Site](https://github.com/IngloriousCoderz/inglorious-forge/tree/main/examples/ssx-docs)** - Multi-page docs
- **[E-commerce](https://github.com/IngloriousCoderz/inglorious-forge/tree/main/examples/ssx-shop)** - Product catalog
- **[Portfolio](https://github.com/IngloriousCoderz/inglorious-forge/tree/main/examples/ssx-portfolio)** - Personal portfolio

--- -->
