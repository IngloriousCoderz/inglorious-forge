# Inglorious Forge

A collection of small, focused JavaScript tools — forged one piece at a time.

Inglorious Forge is a monorepo that groups together several related projects: a lightweight state manager, a minimal web framework, a static site generator, utilities, a realtime server, scaffolding tools, and other experimental parts that grew naturally out of building games and applications.

These tools share the same philosophy:

- Prefer **plain JavaScript** over custom languages and DSLs
- Keep modules **simple**, **transparent**, and **modular**
- Avoid build-time magic when possible
- Let developers understand what happens under the hood
- Keep the surface area small and predictable
- Favor composition over hierarchy

There is no ambition to replace mainstream frameworks. These libraries exist because they were useful in real projects and might be useful to others who appreciate a simple, direct style of building.

---

## Packages

### Core Libraries

#### `@inglorious/utils`

Shared utility functions used across packages.

#### `@inglorious/store`

An entity-based state manager with event-driven updates and predictable data flow.
Used by both the web framework and the game engine.

#### `@inglorious/react-store`

Official React bindings for `@inglorious/store`. Provides hooks and a Provider component to connect React components to the store.

### Web Framework

#### `@inglorious/web`

A small but **complete** web framework built around `lit-html` and the entity store. No components, no lifecycles — just functions that return templates.

It ships with:

- a client-side **router** with lazy routes and type-composition guards
- declarative **forms** with sync/async validation and array fields
- **async helpers** (via `@inglorious/store/async`) for thunks, requests, and optimistic updates
- a **testing utilities** entry point (`@inglorious/web/test`) that re-exports `trigger` from `@inglorious/store` and `render` from `lit-html`, so you can unit-test handlers and templates with zero setup

UI primitives (controls, data display such as tables and virtual lists, navigation, feedback, layout, surfaces) live in **[Inglorious UI](https://inglorious.dev/ui)**.

#### `@inglorious/ui`

A design system for Inglorious Web with render-function components and customizable themes. Includes tables, virtualized lists, comboboxes, and the rest of the data-display, controls, navigation, feedback, layout, and surfaces families.

#### `@inglorious/ssx`

**Static Site Xecution** - Build blazing-fast static sites with `@inglorious/web`. Complete with server-side rendering, client-side hydration, and zero-config routing.

#### `@inglorious/vite-plugin-jsx`

A Vite plugin that compiles standard JSX / TSX into highly-optimized `lit-html` templates for `@inglorious/web`.

#### `@inglorious/vite-plugin-vue`

A Vite plugin that compiles a subset of Vue Single-File Component templates into `lit-html` render functions for `@inglorious/web`. Template-only — no Vue runtime, no reactivity.

#### `@inglorious/jsx`

JSX runtime helpers used by `@inglorious/vite-plugin-jsx`.

#### `@inglorious/charts`

A declarative SVG charting library for `@inglorious/web`, inspired by Recharts. Composable chart primitives built with the same entity/type model.

#### `@inglorious/motion`

CSS-first motion primitives for `@inglorious/web`, implemented via type composition. Animate entities without leaving the store-driven model.

#### `@inglorious/ag-grid`

Direct AG Grid integration for `@inglorious/web` — no adapter required.

### Game Engine

#### `@inglorious/engine`

A modular game engine built on top of the same entity model as the store.
Designed for building 2D games with a focus on simplicity and composability.

#### `@inglorious/renderer-2d`

A 2D renderer for the Inglorious Engine using the HTML5 Canvas Context2D API.

#### `@inglorious/renderer-react-dom`

A React DOM renderer for the Inglorious Engine, allowing React components to be used as renderers.

### Tools & Utilities

#### `@inglorious/create-app`

A scaffolding tool that creates web application project templates:

- minimal (no bundler)
- JS (Vite)
- TS (Vite + TypeScript)

#### `@inglorious/create-game`

A scaffolding tool that creates game project templates configured with the Inglorious Engine.

#### `@inglorious/babel-plugin-inglorious-script`

A Babel plugin for a small scripting language originally designed for in-game logic.

#### `@inglorious/babel-preset-inglorious-script`

A Babel preset that bundles the Inglorious Script plugin with other useful transformations.

#### `@inglorious/eslint-config`

Shared ESLint configuration with presets for different environments (Node, Browser, React, TypeScript, Tailwind).

#### `@inglorious/server`

A simple server for realtime state synchronization using WebSockets.

#### `@inglorious/editor`

The official graphical user interface for the Inglorious Engine. Still experimental.

---

## Getting Started

### Documentation

Documentation lives in the [docs/](docs/) directory and is split per package:

- **`docs/engine`** — interactive **Storybook** for the game engine: cameras, collision detection, pooling, entity systems, players, AI, audio, input, multiplayer, and recipes
- **`docs/web`**, **`docs/store`**, **`docs/charts`**, **`docs/motion`** — **VitePress** sites with guides, API reference, and recipes
- **`docs/forge`** — landing page for the whole monorepo

The Storybook docs feature live, interactive examples; the VitePress sites focus on conceptual guides and API reference.

### Benchmarks

The [benchmarks/](benchmarks/) directory contains apples-to-apples benchmarks comparing Inglorious Web with React, Vue, and Svelte across three workloads (live dashboard, deep tree sparse-update, charts). For context and a full breakdown of the results, see the article **[You probably don't need to think about UI optimization](https://dev.to/iceonfire/you-probably-dont-need-to-think-about-ui-optimization-honest-benchmarks-2m5g)** and the broader series on [dev.to/iceonfire](https://dev.to/iceonfire).

### Examples

The [examples/](examples/) directory contains several example projects:

**Web Applications (using `@inglorious/web`):**

- TodoMVC implementations (plain JS, TS, JSX, TSX, client-server)
- Form example with validation, arrays, and field helpers
- Router example with entity-based client-side routing
- Web Components interop (Material Web, Shoelace) — including an SSX variant
- Logo and motion playgrounds

**UI Examples (using `@inglorious/ui`):**

- Data grid (sorting, filtering, pagination)
- Virtualized list
- Combobox (single selection, multi, remote options)

**React Examples (using `@inglorious/react-store`):**

- React TodoMVC implementations showing store integration with React hooks
- Demonstrates the bindings between `@inglorious/store` and React components

**Games (using `@inglorious/engine`):**

- Minimal game template
- Pong implementation
- Flapper game

**IngloriousScript:**

- IJS - IngloriousScript examples
- ITS - IngloriousScript with TypeScript examples

IngloriousScript is a superset of JavaScript that adds vector operators for more intuitive 2D game development.

---

## Project Setup

This is a monorepo using **pnpm workspaces** and **Turbo** for build orchestration.

### Requirements

- Node.js >= 22
- pnpm >= 10.24.0

### Available Commands

```bash
pnpm install          # Install dependencies
pnpm run dev          # Start development servers for all packages
pnpm run build        # Build all packages
pnpm run lint         # Lint all packages
pnpm run test         # Run tests in all packages
pnpm run format       # Format code with Prettier
```

This project started with building a game engine.

Along the way, it became clear that many of the patterns — especially the entity/event model — also worked well for standard web apps.

Instead of starting from a large framework and restricting it to an engine, the approach here was the opposite:

**Start from a small, generic core and expand outward only when necessary.**

Every package in this repository exists because it solved a real problem in one of the author’s projects. None of it was designed as a product first.

If you enjoy simple tools that do one thing at a time and don’t require buying into a large ecosystem, this may fit your style.

If you prefer large, batteries-included frameworks or strongly opinionated architectures, this probably won’t.

Both approaches are valid.

---

## Philosophy

Some guiding principles:

- **Clarity over cleverness**
- **Plain JavaScript first**
- **Minimal abstractions**
- **Small, focused modules**
- **Let users opt into complexity only when needed**

There is no attempt to chase trends or build hype.

This is just an experiment in how far simplicity and consistency can go.

---

## Status

These libraries are used in personal and experimental projects, but they are still evolving.

Documentation is improving gradually.

Breaking changes may happen between minor versions until things stabilize.

If you try them and find sharp edges, please open an issue.

---

## License

**MIT License - Free and open source**

Created by [Matteo Antony Mistretta](https://github.com/IngloriousCoderz)

You're free to use, modify, and distribute this software. See [LICENSE](./LICENSE) for details.

---

## Contributing

We welcome contributions from the community! Whether you're fixing a bug, adding a feature, or improving the documentation, your help is appreciated. Please read our [Contributing Guidelines](./CONTRIBUTING.md) for details on how to get started.
