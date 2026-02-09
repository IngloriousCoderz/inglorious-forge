---
name: inglorious-forge
description: Ecosystem for web apps and 2D games. Entity-based state (@inglorious/store), lit-html rendering (@inglorious/web), and functional engine (@inglorious/engine).
---

# Inglorious Forge

Simple, modular JavaScript tools. No proxies, no signals, plain JS focus.

## Core Principles

- Pure functions
- Separation of data and behavior
- Simplicity

## 🛠 Modules & Skills

### [@inglorious/utils](skills/utils/SKILL.md)

**The Enabler.** Pure functions for common problems.

- **Math:** Vector operations, trigonometry, random numbers.
- **Physics:** Velocity, acceleration, friction.
- **Functions:** Composition, piping.
- **Data Structures:** Trees, heaps, grids.
- **Algorithms:** Decision trees, pathfinding.

### [@inglorious/store](skills/store/SKILL.md)

**The Brain.** Redux-compatible, ECS-inspired state management.

- **Entity-Based:** Entities hold data, types hold behavior.
- **Event-Driven:** Handlers triggered by notified events.
- **Event Queue:** Determinism ensured by queuing events.
- **Test Utilities:** Easy unit testing.
- **Middleware:** Enhance store capabilities.
- **Multiplayer:** Special middleware for collaborative apps and multiplayer games.
- **Compatible With `react-redux`:** Redux-compatible API.
- **Redux DevTools Integration:** Drop-in replacement for Redux.

### [@inglorious/server](skills/server/SKILL.md)

**The Orchestrator.** Real-time server for Inglorious apps and games.

- **Based on Inglorious Store:** Uses same state manager as clients.
- **Real-time Communication:** Synchronizes entities and events through WebSockets.

### [@inglorious/react-store](skills/react-store/SKILL.md)

**The Diplomat.** Seamlessly wires Inglorious Store to React apps.

- **Simplified Provider:** No need to pass the store
- **Simplified API:** `useEntity` instead of `useSelector`, `useNotify` instead of `useDispatch`.

### [@inglorious/web](skills/web/SKILL.md)

**The Designer.** Inglorious Store as state manager, lit-html as renderer.

- **Types Can Render:** `render(entity, api)`
- **Whole-tree Re-rendering:** Leverages lit-html’s surgical DOM updates.
- **Test Utilities:** Easy unit testing and component testing.
- **Components:** Built-in form, table, list, select, and router.

### [@inglorious/charts](skills/charts/SKILL.md)

**The Data Scientist.** Declarative SVG charts.

- **Recharts-inspired:** Declarative, composable, performant, SSR-friendly charts.
- **Configuration-based:** Customize charts through entity properties.
- **Composition API:** Ability to compose charts as primitives.

### [@inglorious/ssx](skills/ssx/SKILL.md)

**The SEO Expert.** SSG with hydration and file-based routing.

- **Dev Server:** Hot Module Replacement (HMR).
- **Optimized Build:** Uses Vite for building and bundling.
- **Markdown Support:** With code highlight, LaTeX math and Mermaid charts.
- **SEO Tools:** Sitemaps, manifests, metadata.
- **Fast Hydration:** Uses [`@lit-labs/ssr`](https://lit.dev/docs/ssr/overview/) to rewire event listeners on the client.

### [@inglorious/engine](skills/engine/SKILL.md)

**The Player.** Functional 2D game engine.

- **Game Loop:** Frame-based `update(entity, dt)` handlers.
- **Entity Pool:** Special middleware for frequent updates.
- **IngloriousScript:** Optional native vector math operators via Babel.

---

## 🚀 Build & Integration

- **[JSX Vite Plugin](skills/vite-plugin-jsx/SKILL.md):** Allows using JSX syntax instead of `lit-html` templates.
- **[Vue Vite Plugin](skills/vite-plugin-vue/SKILL.md):** Allows using Vue-like template syntax instead of `lit-html`.
- **[Create App](skills/create-app/SKILL.md):** Easy scaffolding of Inglorious Web apps.
- **[Create Game](skills/create-game/SKILL.md):** Easy scaffolding of Inglorious Engine games.
