---
title: Engine Integration
description: Mix game logic and UI in the same app with Inglorious Engine
---

# Engine Integration

Inglorious Web shares its architecture with [Inglorious Engine](https://npmjs.com/@inglorious/engine), a game framework. You can mix game logic and UI in the same app.

## Shared Architecture

Both use the same **@inglorious/store** with entities, types, and events:

```javascript
// Same store for both game and UI
const store = createStore({
  types: {
    // Game entities
    Player: {
      /* game logic */
    },
    Enemy: {
      /* game logic */
    },

    // UI entities
    Hud: {
      render(entity, api) {
        /* ... */
      },
    },
    Inventory: {
      render(entity, api) {
        /* ... */
      },
    },
  },
})
```

## Use Cases

### Game with UI

A canvas-based game with HTML5 UI for menus, HUD, inventory:

```javascript
import { createStore } from "@inglorious/store"
import { createEngine } from "@inglorious/engine"
import { mount, html } from "@inglorious/web"

const store = createStore({
  types: {
    // Game world
    Player: {
      /* physics, movement */
    },
    Camera: {
      /* camera logic */
    }, // UI overlays
    Hud: {
      render(entity, api) {
        const player = api.getEntity("player")
        return html`
          <div class="hud">
            <div>HP: ${player.health}</div>
            <div>Ammo: ${player.ammo}</div>
          </div>
        `
      },
    },
  },
})

// Start game loop
const engine = createEngine(store)
engine.start()

// Mount UI on top
mount(store, (api) => api.render("hud"), document.getElementById("ui"))
```

### Interactive Data Visualization

Combine 3D visualization with Inglorious Web UI:

```javascript
const store = createStore({
  types: {
    // Data visualization entities
    Scene: {
      /* Three.js scene management */
    },
    Camera: {
      /* camera control */
    }, // UI controls
    ControlPanel: {
      render(entity, api) {
        return html`
          <div class="controls">
            <button @click=${() => api.notify("#scene:rotate", 45)}>
              Rotate
            </button>
          </div>
        `
      },
    },
  },
})
```

## Patterns

### Updating UI from Game State

```javascript
// Game updates entity state
const Player = {
  damageTaken(entity, amount) {
    entity.health -= amount
    // Health is reactive - UI updates automatically
  },
}

// UI reads game state
const Hud = {
  render(entity, api) {
    const player = api.getEntity("player")
    return html`<h1>HP: ${player.health}</h1>`
  },
}
```

### Game Events from UI

```javascript
// UI triggers game events
const Menu = {
  render(entity, api) {
    return html`
      <button @click=${() => api.notify("#game:start")}>Start Game</button>
    `
  },
}

// Game responds
const Game = {
  start(entity, api) {
    entity.isRunning = true
    api.notify("gameStarted")
  },
}
```

### Shared Input Handling

```javascript
// Single input system for game and UI
document.addEventListener("keydown", (e) => {
  store.notify("keyPress", { key: e.key })
})

// Both game and UI handle it
const Player = {
  keyPress(entity, { key }) {
    if (key === "w") entity.y -= 5
  },
}

const MenuPage = {
  keyPress(entity, { key }) {
    if (key === "Escape") entity.visible = false
  },
}
```

## Performance Considerations

### Decoupling Updates

Keep game loop and UI rendering separate for best performance:

```javascript
const engine = createEngine(store)

// Game loop runs at ~60fps
engine.start()

// UI updates reactively when state changes
mount(store, renderUI, uiContainer)

// Game updates: ~ expensive
// UI re-render: ~cheap (only changed parts via lit-html)
```

### Batching Events

Events are automatically batched, so multiple game updates in one frame batch together:

```javascript
// Game frame
player.update() // Updates state
enemies.update() // Updates state
camera.update() // Updates state

// Single re-render for all three at frame boundary
```

## Example: Simple Game with HUD

```javascript
import { createStore } from "@inglorious/store"
import { createEngine } from "@inglorious/engine"
import { mount, html } from "@inglorious/web"

const store = createStore({
  types: {
    Player: {
      update(entity) {
        // Move player
        entity.x += entity.vx
        entity.y += entity.vy

        // Clamp to screen
        entity.x = Math.max(0, Math.min(400, entity.x))
      },

      render(entity, api) {
        // Render to canvas
        return null // Game doesn't render to DOM
      },
    },

    Input: {
      keydown(entity, { key }) {
        if (key === "ArrowUp") entity.keys.up = true
        if (key === "ArrowLeft") entity.keys.left = true
      },

      keyup(entity, { key }) {
        if (key === "ArrowUp") entity.keys.up = false
        if (key === "ArrowLeft") entity.keys.left = false
      },

      update(entity, payload, api) {
        const player = api.getEntity("player")
        player.vx = 0
        player.vy = 0

        if (entity.keys.up) player.vy = -2
        if (entity.keys.left) player.vx = -2
      },
    },

    Hud: {
      render(entity, api) {
        const player = api.getEntity("player")
        return html`
          <div class="hud">
            <p>X: ${Math.round(player.x)} Y: ${Math.round(player.y)}</p>
          </div>
        `
      },
    },
  },

  entities: {
    player: {
      type: "Player",
      x: 200,
      y: 200,
      vx: 0,
      vy: 0,
    },
    input: {
      type: "Input",
      keys: { up: false, left: false },
    },
    hud: {
      type: "Hud",
    },
  },
})

// Input handling
document.addEventListener("keydown", (e) => {
  store.notify("#input:keydown", { key: e.key })
})

document.addEventListener("keyup", (e) => {
  store.notify("#input:keyup", { key: e.key })
})

// Game loop
const engine = createEngine(store)
engine.on("update", () => {
  store.notify("#input:update")
  store.notify("#player:update")
})

engine.start()

// Mount UI
mount(store, (api) => api.render("hud"), document.getElementById("ui"))
```

## Debugging

Redux DevTools shows both game and UI events:

```
← gameStart
← player:update
← hud:render (implicit)
← player:takeDamage
← hud:render (implicit)
← game:gameOver
```

Time-travel debugging works for both game and UI!

## Limitations

- Both must use @inglorious/store (no mixing with other state managers)
- Game loop is separate from render loop (intentional for performance)
- Canvas rendering is manual (use Engine rendering)

## Next Steps

- **[Inglorious Engine Docs](https://npmjs.com/@inglorious/engine)** — Full Engine documentation
- **[Type Composition](./type-composition.md)** — Shared patterns between Engine and Web

Happy game developing! 🎮
