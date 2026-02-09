---
name: inglorious-forge
description: Ecosystem for web apps and 2D games. Entity-based state (@inglorious/store), lit-html rendering (@inglorious/web), and functional engine (@inglorious/engine).
---

# Inglorious Forge

Simple, modular JavaScript tools. No proxies, no signals, plain JS focus.

## Core Architecture (The Entity Pattern)
Every object is an entity with `type` + `id`. Behavior is defined in types:
- `api.notify("type:event", payload)`: Triggers updates.
- `api.select(selector)`: Reads state (New API).
- **Composition:** Types can be arrays `[behaviorA, behaviorB]` or decorators.

---

## 🛠 Modules & Skills

### [@inglorious/store](skills/store/SKILL.md)
**The Brain.** Redux-compatible, ECS-inspired state management.
- **Key Concept:** Immutable updates via Mutative in event handlers.
- **New API:** `api.select(thing)` replaces manual state passing.
- **Async:** `handleAsync` manages Start -> Run -> Success/Error lifecycles.

### [@inglorious/web](skills/web/SKILL.md)
**The View.** `lit-html` rendering without component overhead.
- **Key Concept:** Functions return templates; `api.render(id)` mounts entities.
- **Components:** Built-in form, table, list, and router.

### [@inglorious/engine](skills/engine/SKILL.md)
**The Action.** Functional 2D game engine.
- **Key Concept:** Frame-based `update(entity, dt)` handlers and entity pooling.
- **IngloriousScript:** Optional vector math operators via Babel.

### [@inglorious/charts](skills/charts/SKILL.md)
**The Data.** Declarative charts (Config-first or Composition mode).
- **CRITICAL:** Composition mode MUST use `ctx.displayData` for Zoom/Brush support.

### [@inglorious/ssx](skills/ssx/SKILL.md)
**The Web.** SSG with hydration and file-based routing.

---

## 🚀 Build & Integration
- **Vue Plugin:** Compiles Vue-like syntax to lit-html/store events.
- **React Store:** Official bindings (`useSelector`, `useNotify`).
- **CLI:** `create-app` and `create-game` for quick starts.

## ⚠️ Critical Rules (Quick Ref)
1. **Never mutate state outside handlers.** Use `api.notify()`.
2. **Handlers signature:** `(entity, payload, api)`.
3. **Async Run:** `run(payload, api)` does NOT receive `entity`.
4. **Select:** Use `api.select(selector)` for all state reads.