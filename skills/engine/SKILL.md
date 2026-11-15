---
name: engine
description: "@inglorious/engine: 2D game loop on @inglorious/store - y-up coordinates, anchors, update/deltaTime, pause/quit, scenes and mappings, images, sprites, audio, particles, collision, pooling, IngloriousScript."
---

# @inglorious/engine

Testing: [engine-best-practices](../engine-best-practices/SKILL.md). Events, fsm, scenes, patch: [store](../store/SKILL.md).

```javascript
import { Engine } from "@inglorious/engine/core/engine";
import { createRenderer } from "@inglorious/renderer-2d";

const engine = new Engine(createRenderer(canvas), { types, entities, systems });
await engine.init();
engine.start(); // stop(), getState()
```

## Coordinates

- World is y-up: `position` `[x, y, z]`, `y = 0` is the floor, gravity subtracts. `z` is depth, also up. renderer-2d draws `canvasY = viewportHeight - y - z`. Keep 2D games at `z = 0`.
- `size` is `[width, height, depth]`.
- `anchor` places sprite, shapes and collisions together; counts from left/bottom; default center. Use the named ones, never number pairs:

```javascript
import { BOTTOM_LEFT, TOP_LEFT } from "@inglorious/engine/physics/anchor.js";
// TOP_LEFT, TOP_CENTER, TOP_RIGHT, LEFT, CENTER, RIGHT, BOTTOM_LEFT, BOTTOM_CENTER, BOTTOM_RIGHT
```

Set it on the entity, not on `image`. A collision shape may have its own `anchor`.

## Events

- Built-ins: `update` (deltaTime in seconds), `add`, `remove`, `pause`, `resume`, `quit`, `stateChange`, `spawn`, `despawn`.
- Game events are broadcast and name their subject: `playerJump`, `enemyDestroy`.
- Notified events are queued for the next pass. A pass sees the world as it was before it: be told a change and keep your own count (`remove` → `bricksLeft -= 1`), don't re-query.
- `create`/`destroy` reach only their entity; `add`/`remove` broadcast. Release in `destroy` whatever `create` took (DOM listeners).
- `stateChange` listeners check `entityId`.
- An entity whose `type` isn't declared is an error (with a suggestion).
- Always scale by `deltaTime`.

## Pause and quit

- `api.notify(game.paused ? "resume" : "pause")`, reading `paused` from the `game` entity. `update` stops; other events flow; `updatesWhilePaused: true` on overlays.
- `quit` needs no handler (map `Escape: "quit"`); a state may define its own `quit` to override. The frame finishes, then the loop stops for good. Not sent over multiplayer.

## Screens

```javascript
import { mappings } from "@inglorious/engine/behaviors/input/mappings.js";
import { fsm } from "@inglorious/store/fsm";
import { scenes } from "@inglorious/store/scenes";

const types = {
  Game: [
    scenes({
      menu: () => [createTitleEntity()],
      play: (entity) => [...createPlayScene((entity.world ??= createWorld()))],
    }),
    mappings({
      menu: { ArrowUp: "moveItemUp", Enter: "choose" },
      play: { ArrowLeft: "moveLeft", Btn14: "moveLeft", Axis0: "moveLeftRight", Space: "fire" },
      credits: {}, // deaf on purpose
    }),
    fsm({ menu: { choose: (entity) => { entity.state = "play"; } }, play: {} }),
  ],
};
```

- `scenes` only touches the difference between states (by id, `isDeepEqual`); shared entities survive. Hold expensive things on the entity.
- `mappings`: one table for keys, buttons and axes per state; unmapped states are deaf; applied on `create` and `stateChange` via `mappingChange`.
- Decorators replacing `create`/`stateChange` must call `type.create?.(...)` / `type.stateChange?.(...)`, or scenes break silently.

## Images and audio

```javascript
const entities = {
  images: { type: "Images", images: { breakout: { url: "/images/breakout.png" } } },
  audio: { type: "Audio", sounds: { paddleHit: { url: "/sounds/paddle-hit.wav" }, music: { url: "/sounds/music.mp3", loop: true, volume: 0.25 } } },
};
api.notify("soundPlay", "paddleHit");
api.notify("soundStop", "music");
```

- Declare assets in config, not the document (stories have no document). Preload with `<link rel="preload">` if wanted. An `image.src` on an entity loads on first draw.
- Frames: `image` `{ id, src, imageSize (whole sheet), tileSize (default whole), x, y (pixels), frameSize }`. Uniform grids: `renderSprite` with tile indices. Frame-by-number helpers belong in the game.
- Mirroring: `flippedHorizontally(16)`, `flippedVertically(4)` from `@inglorious/renderer-2d/image/flags.js`.
- `tint` (multiplied, cached) on images; `color` only for `renderText`/`renderRectangle`.
- Text: position is the line's top edge; `baseline: "middle"` etc.

## Particles

```javascript
import { emitBurst } from "@inglorious/engine/behaviors/particles.js";

emitBurst(api, {
  count: 64, position: v(100, 100, 0), spread: v(10, 10, 0), size: v(8, 8, 0),
  lifetime: [0.5, 1], tint: "rgb(99, 155, 255)", acceleration: [v(-15, -80, 0), v(15, 0, 0)],
  layer: LAYER_PARTICLE, image: { id: "particle", imageSize: [8, 8] },
});
```

Acceleration corners are y-up (negative falls). The particle type needs a renderer plus the `particle` behaviour.

## Collision and pooling

- `collisions: { hitbox: { shape: "rectangle" } }` or `solid: true` (a rectangle of `size`; never implied by `size`).
- `api.notify("spawn", { type: "Bullet", ... })` reuses pooled entities; `api.notify("despawn", entity)` recycles. Pooled entities aren't in `getState()`: use `api.findCollision(entity, entities?, group?)` and `store.extras.getAllActivePoolEntities()` (`getEntityPoolsStats()` in dev).

## Systems

`systems: [{ update(state, deltaTime, api) {...} }]` run after entity handlers.

## IngloriousScript

With `babel-plugin-inglorious-script` only: `(position + velocity * dt) % worldSize` instead of `mod(add(position, scale(velocity, dt)), worldSize)` from `@inglorious/utils/math/vector.js`.
