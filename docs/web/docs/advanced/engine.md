---
title: Engine Integration
description: Game logic and UI on one store, with Inglorious Engine
---

# Engine Integration

[Inglorious Engine](https://inglorious.dev/engine/) runs a game on the same store as a web app: entities, types and events. A game's HUD and menus can be Inglorious Web types reading the game's entities, mounted beside the canvas.

The engine creates the store from the game's configuration and drives it with a loop that notifies `update` with the elapsed time each frame. A renderer is a configuration too: `createRenderer(canvas)` from `@inglorious/renderer-2d` adds the types and system that draw on the canvas. Inglorious Web mounts onto the engine's store:

```javascript
import { Engine } from "@inglorious/engine/core/engine.js"
import { createRenderer } from "@inglorious/renderer-2d/index.js"
import { html, mount } from "@inglorious/web"

const game = {
  types: {
    Player: {
      update(entity, dt) {
        entity.position[0] += entity.velocity[0] * dt
      },
    },
    Hud: {
      render(entity, api) {
        return html`<div class="hud">
          HP: ${api.getEntity("player").health}
        </div>`
      },
    },
  },
  entities: {
    player: {
      type: "Player",
      position: [0, 0, 0],
      velocity: [10, 0, 0],
      health: 100,
    },
    hud: { type: "Hud" },
  },
}

const engine = new Engine(createRenderer(canvas), game)
await engine.init()
engine.start()

mount(engine._store, (api) => api.render("hud"), document.getElementById("ui"))
```

The engine's store runs in `manual` update mode: input events queue during a frame and are applied with the next `update`, and the HUD renders once per frame with the rest. A menu notifies the game as any handler would (`api.notify("#game:start")`), and the game's events reach the UI's types.

The engine adds `update(dt)`, `pause` and `resume`, input types for keyboard, mouse, touch and gamepads, behaviors for movement, physics, collision, sprites and audio, and runs the store with `copy-on-dispatch`, which scales to thousands of entities changing per frame. The [engine documentation](https://inglorious.dev/engine/) has the games to read.
