# @inglorious/engine - Complete Reference

## Installation

```bash
npm install @inglorious/engine
```

## Core Concepts

Functional game engine built on entity-based state management. Uses the same entity model as `@inglorious/store` but optimized for game development with frame-based updates.

**Architecture:**

- Single immutable state object (source of truth)
- Event-driven updates via event queue
- Frame-based `update` event with `deltaTime`
- Renderer agnostic (Canvas2D, React, HTML)

## Basic Setup

```javascript
import { Engine } from "@inglorious/engine/core/engine"
import { createRenderer } from "@inglorious/renderer-2d"

const game = {
  types: {
    player: {
      update(entity, deltaTime) {
        entity.position.x += entity.velocity.x * deltaTime
        entity.position.y += entity.velocity.y * deltaTime
      },
    },
  },
  entities: {
    player1: {
      type: "player",
      position: { x: 0, y: 0 },
      velocity: { x: 100, y: 0 },
    },
  },
}

const canvas = document.getElementById("canvas")
const renderer = createRenderer(canvas)
const engine = new Engine(renderer, game)

await engine.init()
engine.start()
```

## Event System

### Core Engine Events

The engine has built-in single-word events:

- `update` - Fired every frame, carries `deltaTime`
- `add` - Add new entity (triggers `create` lifecycle)
- `remove` - Remove entity (triggers `destroy` lifecycle)

### Custom Events

Use multi-word `camelCase` names for custom events to avoid conflicts:

```javascript
const types = {
  player: {
    playerJump(entity) {
      /* ... */
    },
    itemCollect(entity, itemId) {
      /* ... */
    },
    enemyDestroy(entity, enemyId) {
      /* ... */
    },
  },
}
```

### Event Queue

Events are queued and processed once per frame:

```javascript
const types = {
  enemy: {
    takeDamage(entity, damage) {
      entity.health -= damage
      if (entity.health <= 0) {
        // This event is queued, processed next frame
        api.notify("enemyDestroyed", entity.id)
      }
    },
  },
}
```

## Update Loop

The `update` event is fired every frame with `deltaTime`:

```javascript
const types = {
  player: {
    update(entity, deltaTime) {
      // Movement based on time, not frame rate
      entity.position.x += entity.velocity.x * deltaTime
      entity.position.y += entity.velocity.y * deltaTime

      // Boundary checking
      if (entity.position.x > 800) {
        entity.position.x = 0
      }
    },
  },
}
```

**Rules:**

- Always use `deltaTime` for time-based calculations
- Never assume fixed frame rate
- `deltaTime` is in seconds (typically 0.016 for 60fps)

## Entity Lifecycle

```javascript
const types = {
  bullet: {
    create(entity) {
      entity.createdAt = Date.now()
      entity.lifetime = 2000 // 2 seconds
    },

    update(entity, deltaTime) {
      entity.lifetime -= deltaTime * 1000
      if (entity.lifetime <= 0) {
        api.notify("remove", { id: entity.id })
      }
    },

    destroy(entity) {
      // Cleanup: remove from pools, cancel timers, etc.
      console.log(`Bullet ${entity.id} destroyed`)
    },
  },
}
```

## Behavior Composition

Build complex behaviors by composing functions:

```javascript
const movable = {
  update(entity, deltaTime) {
    entity.position.x += entity.velocity.x * deltaTime
    entity.position.y += entity.velocity.y * deltaTime
  },
}

const collidable = {
  checkCollision(entity, other) {
    // Collision detection logic
  },
}

const controllable = {
  handleInput(entity, input) {
    if (input.key === "ArrowLeft") {
      entity.velocity.x = -100
    }
  },
}

// Compose behaviors
const types = {
  player: [movable, collidable, controllable],
}
```

## Renderers

### 2D Canvas Renderer

```javascript
import { createRenderer } from "@inglorious/renderer-2d"

const canvas = document.getElementById("canvas")
const renderer = createRenderer(canvas)

// renderer returns { types, entities, systems } to pass to Engine
const engine = new Engine(renderer, game)
```

**Note:** `createRenderer(canvas)` returns a configuration object with `types`, `entities`, and `systems` that must be passed to the Engine constructor along with your game configuration.

## Entity Pooling

For performance-critical scenarios (bullet hell, particles):

```javascript
import { createPool } from "@inglorious/engine"

const bulletPool = createPool({
  create: () => ({ type: "bullet", x: 0, y: 0, active: false }),
  reset: (entity) => {
    entity.active = false
    entity.x = 0
    entity.y = 0
  },
})

const types = {
  player: {
    shoot(entity) {
      const bullet = bulletPool.acquire()
      bullet.x = entity.position.x
      bullet.y = entity.position.y
      bullet.active = true
      api.notify("add", bullet)
    },
  },

  bullet: {
    update(entity, deltaTime) {
      entity.y -= 200 * deltaTime
      if (entity.y < 0) {
        bulletPool.release(entity)
        api.notify("remove", { id: entity.id })
      }
    },
  },
}
```

## IngloriousScript (Optional)

IngloriousScript adds vector operators for intuitive 2D math. Requires Babel configuration.

**WARNING:** Only use if `babel-plugin-inglorious-script` is configured.

```javascript
// Without IngloriousScript
import { add, scale, mod } from "@inglorious/utils"
const newPosition = mod(add(position, scale(velocity, dt)), worldSize)

// With IngloriousScript (requires babel-plugin-inglorious-script)
const newPosition = (position + velocity * dt) % worldSize
```

## Systems

Global logic that runs after all entity handlers:

```javascript
const systems = [
  {
    update(state, deltaTime) {
      // Collision detection across all entities
      const players = Object.values(state).filter((e) => e.type === "player")
      const enemies = Object.values(state).filter((e) => e.type === "enemy")

      players.forEach((player) => {
        enemies.forEach((enemy) => {
          if (checkCollision(player, enemy)) {
            api.notify("playerHit", { playerId: player.id, enemyId: enemy.id })
          }
        })
      })
    },
  },
]

const engine = new Engine({ types, entities, systems })
```

## API Reference

### `new Engine(renderer, game)`

```javascript
const renderer = createRenderer(canvas)
const game = {
  types: {
    /* entity behaviors */
  },
  entities: {
    /* initial entities */
  },
  systems: [
    /* optional: global handlers */
  ],
}

const engine = new Engine(renderer, game)
await engine.init()
engine.start()
```

**Parameters:**

- `renderer` - Renderer configuration from `createRenderer(canvas)` (contains `types`, `entities`, `systems`)
- `game` - Game configuration object with `types`, `entities`, and optional `systems`

### Engine Methods

- `engine.init()` - Initialize engine (async, must be called before start)
- `engine.start()` - Start the game loop
- `engine.stop()` - Stop the game loop
- `engine.getState()` - Get current state (read-only)

**Note:** Engine uses the store from `@inglorious/store` internally. Access the store via `engine._store` if needed.

### Handler API (`api` parameter)

- `getEntities()` - Read all state (read-only)
- `getEntity(id)` - Read entity (read-only)
- `notify(type, payload)` - Trigger events (queued)
- `getTypes()` - Access type definitions
- `getType(name)` - Access specific type

## Rules & Constraints

1. **ALWAYS use `deltaTime` in `update` handlers** - Never assume fixed frame rate
2. **Events are queued, not immediate** - Events triggered in handlers are processed next frame
3. **Entity mutations in handlers are safe** - Engine uses Mutative for immutability
4. **Use `api.notify()` for cross-entity communication** - Never mutate other entities directly
5. **Systems run after all entity handlers** - Use for global coordination
6. **Use entity pooling for high-frequency entities** - Bullets, particles, etc.

## Common Pitfalls

### ❌ Wrong: Fixed frame rate assumption

```javascript
const types = {
  player: {
    update(entity) {
      entity.position.x += 5 // Wrong - assumes 60fps
    },
  },
}
```

### ✅ Correct: Use deltaTime

```javascript
const types = {
  player: {
    update(entity, deltaTime) {
      entity.position.x += 300 * deltaTime // Correct - 300 pixels per second
    },
  },
}
```

### ❌ Wrong: Immediate event processing

```javascript
const types = {
  enemy: {
    takeDamage(entity, damage) {
      entity.health -= damage
      // Wrong - expects immediate processing
      if (entity.health <= 0) {
        api.notify("enemyDestroyed", entity.id)
        // This entity might still exist in other handlers this frame
      }
    },
  },
}
```

### ✅ Correct: Queue events for next frame

```javascript
const types = {
  enemy: {
    takeDamage(entity, damage) {
      entity.health -= damage
      // Correct - event queued for next frame
      if (entity.health <= 0) {
        api.notify("enemyDestroyed", entity.id)
      }
    },
    enemyDestroyed(entity) {
      // This runs next frame, after health check
      api.notify("remove", { id: entity.id })
    },
  },
}
```
