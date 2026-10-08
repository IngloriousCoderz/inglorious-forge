# Inglorious Engine

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A JavaScript game engine written with global state, immutability, and pure functions in mind. Have fun(ctional programming) with it!

## Quick Start

The fastest way to start a new Inglorious Engine project is by using the official scaffolding tool.

Run the following command in your terminal and follow the prompts to create a new game from a variety of templates (including plain JavaScript, TypeScript, and IngloriousScript):

```bash
# with npm
npm create @inglorious/game@latest

# with pnpm
pnpm create @inglorious/game
```

This will set up a complete project with a development server ready to go.

## Features

- **Functional & Data-Oriented**: Uses a single, immutable state object as the source of truth, inspired by functional programming principles.
- **Composable by Design**: Build complex behaviors by composing pure functions and decorators, offering a powerful alternative to inheritance.
- **Renderer Agnostic**: The engine is headless. You can use any rendering technology you like, from Canvas2D and HTML to React components.
- **Zero Build Step Option**: Write plain JavaScript and run it directly in the browser. No complex build configurations required.
- **Pausing without permission checks**: `notify("pause")` halts the world, so nothing that moves has to ask whether it is allowed to.
- **A way out that works anywhere**: `notify("quit")` ends the game, from any state, without a handler of its own.
- **Sprites in one call**: `crop()` points an entity at a frame of a sheet without you having to remember which half of the crop lives where. See [renderer-2d](https://github.com/iceonfire/inglorious-forge/tree/main/packages/renderer-2d).
- **Screens that share a world**: `scenes()` puts a state's entities up and takes the last state's down, leaving whatever the two have in common standing.
- **A mistyped type is an error**: the engine refuses a configuration whose entity names a type nothing declared, and says which type was nearly meant.

### Scenes

A state machine says when it moves; `scenes()` says what each state is made of. Pair them
and each screen is a description of what should be standing there:

```javascript
import { fsm } from "@inglorious/engine/behaviors/fsm.js"
import { scenes } from "@inglorious/engine/behaviors/scenes.js"

const SCENES = {
  title: () => [createTitleEntity(), createMenuEntity()],
  play: () => [createPaddleEntity(), createBallEntity()],
}

const types = {
  Game: [
    scenes(SCENES),
    fsm({
      title: {
        start(entity) {
          entity.state = "play"
        },
      },
    }),
  ],
}

const entities = { game: { type: "Game", state: "title" } }
```

Only the difference between two states is touched. Anything they share stays standing as it
is — which is what carries a paddle, a ball and a level from the serve into the play without
rebuilding them, and so without losing where the paddle had slid to or what had already been
knocked out. Without it, every move between two states that share a world rebuilds it.

A state is also handed the entity asking for it, so anything worth making only once — a
level, say — can be held on the entity and left alone the second time round.

### Collision

Give an entity a `collisions` block and it is solid:

```javascript
entities: {
  brick: {
    type: "Brick",
    size: [32, 16, 0],
    collisions: { hitbox: { shape: "rectangle" } },
  },
}
```

Or, for the shape almost everything solid wants, say so in one word:

```javascript
entities: {
  brick: { type: "Brick", size: [32, 16, 0], solid: true },
}
```

`solid: true` means "collide with a rectangle the size of `size`". It is asked for rather
than assumed from the presence of a `size`, because plenty of things have a size and are
not in the way: a line of text, a frame counter, anything measured in pixels rather than
in space. Making `size` imply solidity would quietly turn all of those into walls.

A declared `collisions` block still wins, so an entity can be solid and still have a hit
box smaller than itself, or shaped like a point or a circle.

A block may also carry its own `size` and `offset`, so the shape can be measured from a
different place than the sprite is drawn from:

All nine anchors are exported by name from `@inglorious/engine/physics/anchor.js` --
`TOP_LEFT`, `TOP_CENTER`, `TOP_RIGHT`, `LEFT`, `CENTER`, `RIGHT`, `BOTTOM_LEFT`,
`BOTTOM_CENTER` and `BOTTOM_RIGHT`. Write those rather than the numbers: an anchor
counts from the low end of every axis, so `[0, 1]` is `TOP_LEFT` and not
`BOTTOM_LEFT`, and getting it backwards changes where things are drawn _and_ where
they collide.

```javascript
import { TOP_LEFT } from "@inglorious/engine/physics/anchor.js"

ball: {
  type: "Ball",
  position: v(100, 100, 0),
  size: v(16, 16, 0),
  anchor: TOP_LEFT, // the sprite is drawn from its top left corner
  collisions: {
    // ...but the circle is measured from its middle, so it is pushed there
    hitbox: { shape: "circle", radius: 8, offset: v(8, 8, 0) },
  },
}
```

Useful whenever the two shapes disagree about where they are measured from — a square
sprite from a corner against a circle collision from its centre. `entity.offset` shifts
both at once, which is the difference between moving the thing and moving its outline.

### Pausing

`api.notify("pause")` stops the store handing out `update` events, and `notify("resume")` starts it again:

```javascript
fsm({
  play: {
    togglePause(entity, _, api) {
      api.notify("soundPlay", "pause")
      api.notify(entity.paused ? "resume" : "pause")
    },
  },
})
```

The game entity already keeps a readable `paused` flag, which is what that handler reads. Because `update` is never called while halted, a moving entity needs no pause check of its own:

```javascript
update(entity, dt) {
  // Never runs while paused, so nothing here has to know about pausing.
  entity.position[0] += entity.velocity[0] * dt
}
```

Everything else keeps flowing, so the thing that takes the pause back off still receives its events. A type that must keep updating declares it, which is for overlays and pause menus rather than gameplay:

```javascript
const Paused = [
  { updatesWhilePaused: true },
  { render: renderText },
  { update },
]
```

The default is to **stop**. Anything that keeps going has to say so, so forgetting a flag pauses the thing you meant to pause rather than freezing the menu. See the [store's built-in events](https://github.com/iceonfire/inglorious-forge/tree/main/packages/store#built-in-events) for the full behaviour.

## Documentation

The best way to get started is with the official documentation, which includes a **[Quick Start Guide](https://inglorious-engine.vercel.app/?path=/docs/quick-start--docs)**.

Full documentation is available at: **[https://inglorious-engine.vercel.app/](https://inglorious-engine.vercel.app/)**

## Why Functional Programming?

What makes this engine different from all the others is that, instead of Object Oriented Programming (OOP), which seems the most obvious choice for a game engine, this one is based on Functional Programming (FP).

FP has many advantages:

1. **Single Source of Truth**: Your entire game state is a single, plain JavaScript object. This gives you complete control over your game's world at any moment, rather than having state scattered across countless objects. This is the core idea behind the Data-Driven Programming (DDP) paradigm that many modern engines are now adopting, and with this engine, you get that benefit naturally.

2. **Efficient Immutability**: A common misconception is that creating a new state on every change is slow. This engine uses structural sharing (via Mutative), meaning only the parts of the state that actually change are copied. The rest of the state tree is shared by reference, making updates extremely fast. This provides a huge benefit:
   - **Optimized Rendering**: Detecting changes becomes trivial and fast. A simple reference check (`prevState === nextState`) is all that's needed to determine if data has changed, enabling highly performant UIs (especially with libraries like React). This is much faster than the deep, recursive comparisons required in mutable systems.

3. **Pure Functions**: Game logic is built with pure functions — functions that return a value based only on their inputs, with no side effects. This makes your game logic predictable, easy to test in isolation, and highly reusable, freeing you from the complexity of class methods with hidden side effects.

4. **Composition over Inheritance**: Instead of complex class hierarchies, you build entities by composing functions. Think of it as a pipeline of operations applied to your data. This is a more flexible and powerful alternative to inheritance. You can mix and match behaviors (e.g., `canBeControlledByPlayer`, `canBeHurt`, `canShoot`) on the fly, avoiding the rigidity and common problems of deep inheritance chains.

5. **Dynamic by Nature**: JavaScript objects are dynamic. You can add or remove properties from an entity at any time without being constrained by a rigid class definition. This is perfect for game development, where an entity's state can change unpredictably (e.g., gaining a temporary power-up). This flexibility allows for more emergent game mechanics.

6. **Unparalleled Debugging and Tooling**: Because the entire game state is a single, serializable object, you can unlock powerful development patterns that are difficult to achieve in traditional OOP engines.
   - **Time-Travel Debugging**: Save the state at any frame. You can step backward and forward through state changes to find exactly when a bug was introduced.
   - **Hot-Reloading**: Modify your game's logic and instantly see the results without restarting. The engine can reload the code and re-apply it to the current state, dramatically speeding up iteration.
   - **Simplified Persistence**: Saving and loading a game is as simple as serializing and deserializing a single JSON object.
   - **Simplified Networking**: For multiplayer games, you don't need to synchronize complex objects. You just send small, serializable `event` objects over the network. Each client processes the same event with the same pure event handler, guaranteeing their game states stay in sync.

7. **Leverage the Full JavaScript Ecosystem**: As a pure JavaScript engine, you have immediate access to the world's largest software repository: npm. Need advanced physics, complex AI, or a specific UI library? Integrate it with a simple `npm install`. You aren't limited to the built-in features or proprietary plugin ecosystem of a monolithic engine like Godot or Unity.

## Architecture: State Management

The engine's state management is inspired by Redux, but it's specifically tailored for the demands of game development. If you're familiar with Redux, you'll recognize the core pattern: the UI (or game view) is a projection of the state, and the only way to change the state is to dispatch an action.

However, there are several key differences that make it unique:

1.  **Events, not Actions**: In Redux, you "dispatch actions." Here, we "notify of events." This is a deliberate semantic choice. An event handler is a function that reacts to a specific occurrence in the game world (e.g., `playerMove`, `enemyDestroy`). The naming convention is similar to standard JavaScript event handlers like `onClick`, where the handler name describes the event it's listening for.

2.  **Asynchronous Event Queue**: Unlike Redux's synchronous dispatch, events are not processed immediately. They are added to a central event queue. The engine's main loop processes this queue once per frame. This approach has several advantages:
    - It decouples game logic from state updates.
    - It ensures state changes happen at a predictable point in the game loop, preventing race conditions or cascading updates within a single frame.
    - It allows for event batching and provides a solid foundation for networking and time-travel debugging.

3.  **Core Engine Events & Naming Convention**: The engine has a few built-in, **single-word** events that drive its core functionality. To avoid conflicts, you should use **multi-word `camelCase`** names for your own custom game events (`playerJump`, `itemCollect`). This convention is similar to how custom HTML elements require a hyphen to distinguish them from standard elements. Key engine events include:
    - `update`: Fired on every frame, typically carrying the `deltaTime` since the last frame. This is where you'll put most of your continuous game logic (like movement).
    - `add`: Used to add a new entity to the game state.
    - `remove`: Used to remove an entity from the game state.

4.  **Ergonomic Immutability with Mutative**: The state is immutable, but to make this easy to work with, we use Mutative. Inside your event handlers, you can write code that looks like it's mutating the state directly. Mutative handles the magic behind the scenes, producing a new, updated state with structural sharing, giving you the performance benefits of immutability with the developer experience of mutable code.

5.  **Composable Handlers via Function Piping**: Instead of large, monolithic "reducers," you build event handlers by composing smaller, pure functions. The engine encourages a pipeline pattern where an event and the current state are passed through a series of decorators or transformations. This makes your logic highly modular, reusable, and easy to test in isolation.

6.  **Handlers Can Issue New Events (Controlled Side-Effects)**: In a strict Redux pattern, reducers must be pure. We relax this rule for a pragmatic reason: event handlers in this engine **can notify of new events**. This allows you to create powerful, reactive chains of logic. For example, an `enemy:take_damage` handler might check the enemy's health and, if it drops to zero, notify of a new `enemy:destroyed` event.
    - **How it works**: Any event notified from within a handler is simply added to the end of the main event queue. It will be processed in a subsequent pass of the game loop, not immediately. This prevents synchronous, cascading updates within a single frame and makes the flow of logic easier to trace.

    - **A Word of Caution**: This power comes with responsibility. It is possible to create infinite loops (e.g., event A's handler notifies of event B, and event B's handler notifies of event A). Developers should be mindful of this when designing their event chains.

## Frequently Unsolicited Complaints (FUCs)

A few... recurring themes have popped up in discussions about the engine. Let's address them head-on.

**"You just hate OOP."**

Not at all! OOP is a powerful paradigm, and parts of this engine use it — the `Engine` itself is a class, for example. My main reservation is with deep **inheritance** hierarchies, which can become rigid and fragile. This engine's architecture strongly favors **composition over inheritance** by design, which I believe is a more flexible way to build complex and dynamic behaviors in games.

**"This was made by a vibecoder who doesn't get cache optimization."**

This engine is the product of countless hours of coding, smartly paired with AI assistance. If you're not leveraging AI in your workflow today, you're the one missing out.

Now, let's talk performance. The critique often has two parts: garbage collection (GC) pressure from immutability, and cache performance compared to modern engines.

1.  **Garbage Collection**: The concern is that creating new objects on every state change will flood the GC. This is mitigated by **structural sharing** (via Mutative). We don't deep-clone the state; only the changed data paths create new objects. For the most extreme cases (e.g., a bullet hell), the engine provides a dedicated **entity pooling system** as a pragmatic escape hatch, eliminating GC pressure in performance hotspots.

2.  **Cache Performance & ECS**: The other critique is that modern engines like Unity or Godot use an Entity-Component-System (ECS) architecture to avoid deep object graphs (`player.inventory.getItem()`) and achieve better cache performance. **This is absolutely correct!** Those engines solve this problem very well.

This engine achieves a similar architectural goal — separating data from behavior — but through a functional paradigm that is native to JavaScript. Instead of fighting with OOP class hierarchies, you get a data-centric, ECS-like pattern by default. Centralizing state in a single object leverages the JS engine's highly optimized property access, which, while not the same as a C++ SoA layout, is a massive improvement over the pointer-chasing that plagues naive OOP designs.

**"JavaScript isn't a 'real' functional language."**

You're right, it's not Haskell. JavaScript is a multi-paradigm language, and that's one of its strengths! This engine leverages its first-class functions, closures, and native support for data structures (objects and arrays) to enable a functional _style_. We get many of the benefits—pure functions, immutability (with help), and composition—without needing to be dogmatic about it.

**"Data-Driven Programming is not the same as Data-Oriented Design."**

This is a frequent point of confusion, so let's clarify. The engine uses [Data-Driven _Programming_](https://en.wikipedia.org/wiki/Data-driven_programming), but it's important to distinguish it from [Data-Oriented _Design_](https://en.wikipedia.org/wiki/Data-oriented_design).

- **Data-Driven Programming (DDP)**: This is the architectural paradigm the engine is built on. It's about separating the data (your entities) from the logic that operates on it (your systems and event handlers). Your entire game state lives in one place, and your logic is a collection of pure functions that transform that data.

- **Data-Oriented Design (DOD)**: This is a lower-level implementation strategy focused on CPU cache performance, common in ECS architectures. It involves organizing data in contiguous memory blocks (e.g., an array of all positions, an array of all velocities) to minimize cache misses during iteration.

This engine does **not** implement a strict DOD memory layout. However, by centralizing all entities into a single, flat object, we get a pragmatic, "almost-DOD" benefit. We leverage the JavaScript engine's highly optimized internal object layout, which is significantly more cache-friendly than chasing pointers through a deeply nested OOP graph.

**"Functional programming is just painful to read and write."**

This is a common fear, especially for developers coming from a pure OOP background. The goal here isn't to force you to write Lisp in JavaScript. Instead, the API is intentionally designed to feel familiar and ergonomic:

- **`types` are your "classes"**: They act as blueprints for your game objects.
- **`entities` are your "instances"**: They are the concrete things in your game, created from a `type`.
- **Composition feels like inheritance**: You can "extend" a type (which is just an array of behaviors) by adding behaviors to it, like `[baseType, someBehavior]`, and you "extend" a behavior by creating a function that composes new event handlers onto a base type, like `(type) => ({ eventName(...args) { type.eventName?.(...args) } })`. You get the code reuse you expect, but with the power and flexibility of composition.
- **Immutable updates feel mutable**: Thanks to Mutative, you don't have to write complex functional updates. Inside your event handlers, you can write simple, direct code like `entity.health -= 10`, and the engine handles creating the new immutable state for you.

The engine provides the benefits of FP (predictability, testability) without the steep learning curve. You get to think in terms of familiar concepts while the engine handles the functional magic for you.

**"But I like my operators!"**

We do too! That's why the engine includes **IngloriousScript**, an optional Babel plugin that overloads standard JavaScript operators for intuitive vector math.

```javascript
// Without IngloriousScript
const newPosition = mod(add(position, scale(velocity, dt)), worldSize)

// With IngloriousScript
const newPosition = (position + velocity * dt) % worldSize
```

It supports vector-vector, vector-scalar, and scalar-vector operations for `+`, `-`, `*`, `/`, `%`, and `**`, making your game logic clean, readable, and expressive.

**"A good OOP developer just uses composition anyway. You don't need a new engine for that."**

True, disciplined developers favor composition in any paradigm. The difference is that in many traditional OOP engines, inheritance is often presented as the default, easy path. This engine is designed so that **composition is the path of least resistance**. The architecture doesn't just allow for composition; it's built on it. You don't need discipline to avoid inheritance pitfalls when the framework naturally guides you to a better pattern.

**"This is fine for toy projects, but immutability will never scale."**

This critique usually misunderstands how modern immutability works. The engine uses structural sharing (via Mutative), which means we're not deep-copying the entire game state on every change. It's incredibly efficient.

That said, we're pragmatic. For performance-critical scenarios like a bullet hell with thousands of short-lived objects, we provide an **entity pooling** system as an escape hatch. But for 99% of game logic, we believe the massive benefits of a predictable, testable, and debuggable state (hello, time-travel debugging!) are a worthwhile trade-off for a negligible performance cost.

**"My favorite OOP engine can do all this too!"**

You're right. Modern engines like Unity (with DOTS) and Godot offer powerful, composition-based, ECS-like architectures out of the box. They are fantastic tools that have evolved to embrace these patterns.

To provide these features, however, they had to implement them within the constraints of a fundamentally object-oriented foundation. This sometimes results in systems that feel like they are working around the core OOP paradigm — almost to the point where it doesn't feel like OOP anymore.

The difference with this engine is that it was designed with functional and data-oriented principles from the very beginning. Composition, event-driven architecture, and data-centric patterns aren't features layered on top; they are the fundamental, native way of building things. The entire engine speaks one language, making these good practices the most natural and intuitive way to build your game.

**"You'll never compete with Unity/Godot/Unreal."**

You're absolutely right. And we're not trying to.

This engine isn't for developers who want a massive, all-in-one, GUI-driven editor. It's for JavaScript developers who want to build games with the tools and ecosystem they already know and love. It's for those who are curious about applying functional programming principles to game development and who value architectural flexibility over a monolithic, proprietary feature set. It's a different tool for a different kind of developer.

**"Why not just use an existing engine?"**

Because building things is fun! This project is as much an exploration of software architecture as it is a tool for making games. It's for developers who are curious about functional programming and want to see how its principles can be applied to game development in a JavaScript environment.

## Dependencies

The core engine relies on a few key, lightweight packages:

- [mutative](https://www.npmjs.com/package/mutative): For enabling ergonomic immutable updates with structural sharing.
- [@inglorious/utils](https://www.npmjs.com/package/@inglorious/utils): A collection of small, pure utility functions for things like vector math and data manipulation.
- [@inglorious/store](https://www.npmjs.com/package/@inglorious/store): The environment-agnostic core state management library.

## Quick Start Example

## Usage without a Build Step

If you prefer to avoid a build step, you can run the engine directly in the browser. The example below demonstrates how to set up a minimal game using ES modules, an `importmap`, and the 2D canvas renderer.

```html
<!DOCTYPE html>
<html lang="en">
  <body>
    <canvas id="canvas" width="800" height="600"></canvas>

    <script type="text/javascript">
      window.process = { env: "development" }
    </script>

    <script type="importmap">
      {
        "imports": {
          "mutative": "https://unpkg.com/mutative@latest/dist/mutative.esm.mjs",
          "@inglorious/utils/": "https://unpkg.com/@inglorious%2Futils@latest/src/",
          "@inglorious/store/": "https://unpkg.com/@inglorious%2Fstore@latest/src/",
          "@inglorious/engine/": "https://unpkg.com/@inglorious%2Fengine@latest/src/",
          "@inglorious/renderer-2d/": "https://unpkg.com/@inglorious%2Frenderer-2d@latest/src/",
          "game": "/game.js"
        }
      }
    </script>

    <script
      type="module"
      src="https://unpkg.com/@inglorious%2Fengine@latest/src/main.js"
    ></script>
  </body>
</html>
```

---

## License

**MIT License - Free and open source**

Created by [Matteo Antony Mistretta](https://github.com/IngloriousCoderz)

You're free to use, modify, and distribute this software. See [LICENSE](./LICENSE) for details.

---

## Contributing

We welcome contributions from the community! Whether you're fixing a bug, adding a feature, or improving the documentation, your help is appreciated. Please read our [Contributing Guidelines](./CONTRIBUTING.md) for details on how to get started.
