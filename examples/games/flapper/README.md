# Inglorious Flapper

A Flappy Bird clone.

![Gameplay Screenshot](https://raw.githubusercontent.com/IngloriousCoderz/inglorious-forge/main/examples/games/flapper/public/screenshot.png)

## About This Project

This project is a port of a Flappy Bird clone originally created with Lua and the LÖVE 2D framework. The original version was developed as part of the second lecture in Harvard's CS50's Introduction to Game Development.

- **Original Course Lecture:** [CS50's Intro to Game Development - Lecture 2: Flappy Bird](https://www.youtube.com/watch?v=3IdOCxHGMIo)
- **Original Source Code (Lua/LÖVE 2D):** [games50/fifty-bird](https://github.com/games50/fifty-bird), specifically the `2025/x/bird-12` revision

While the core gameplay remains faithful to the original, this port serves as a demonstration of the [**Inglorious Engine**](https://www.npmjs.com/package/@inglorious/engine). It was an exercise in applying modern architectural patterns and tooling to a classic game.

## Key Features & Architectural Highlights

### 1. The state machine is the game

The Lua original had a hand-written `StateMachine` with a class per state. Here the same four states — `title`, `countdown`, `play` and `score` — are declared with the engine's [`fsm`](../../packages/engine/src/behaviors/fsm.js) behavior. Transitions, and the work that goes with them, live next to the state they belong to:

```ijs
export const Game = fsm({
  [GAME_STATE.play]: {
    press(entity, targetId, api) {
      if (targetId !== entity.id) return
      api.notify("birdFlap")
    },
    pipeScored(entity, _, api) {
      entity.score++
      api.notify("soundPlay", "score")
    },
    birdHit(entity, _, api) {
      entity.state = GAME_STATE.score
      api.notify("pause")
    },
  },
})
```

### 2. Everything is an entity

There is no `Bird` class and no `PipePair` table. The bird, the scrolling background and ground, the score and every message are plain entities described in [`src/game.ijs`](./src/game.ijs), with their logic in small types under [`src/types`](./src/types). The bird is not even told which state the game is in to know whether gravity applies: only the `play` state forwards a `birdFlap`.

### 3. Pooled entities

Pipe pairs are spawned every couple of seconds and recycled once they leave the screen, through the engine's entity pool rather than a hand-kept array. `api.findCollision` sees pooled entities as well, so the bird collides with them exactly like with any other entity.

### 4. Input is a single action

The Lua original read the keyboard and the mouse separately. Here the keyboard, the gamepad and the pointer all feed the engine's `controls` behavior, and every one of them maps to the same `press` action. Which meaning `press` gets — start the game, restart it, or flap the bird — is decided by the state machine.

### 5. Simplified vector math with IngloriousScript

Vector calculations for movement and collision are simplified through the use of the **IngloriousScript** language, which keeps the physics readable:

```ijs
entity.velocity[Z] += BIRD_GRAVITY * dt
entity.position[Z] += entity.velocity[Z] * dt
```

## Differences from the original

- The title reads _Inglorious Flapper_ rather than _Fifty Bird_.
- `Space`, a click and a tap all do the same thing, so the game is playable with a mouse, a keyboard, a gamepad or on a phone.
- The countdown cannot be skipped.
- The music track of the original is not bundled. Add an entry to the `audio` entity in [`src/game.ijs`](./src/game.ijs) with `{ url, loop: true }` and notify `soundPlay` with its name to bring your own.

## Getting Started

1.  Clone the repository:
    ```bash
    git clone https://github.com/IngloriousCoderz/inglorious-forge.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd inglorious-forge/examples/games/flapper
    ```
3.  Install dependencies:
    ```bash
    pnpm install
    ```
4.  Run the game:
    ```bash
    pnpm dev
    ```

## How to Play

- **Flap:** `Space`, click, tap or the gamepad.
- **Start and restart:** the same inputs, from the title and game over screens.
- **Objective:** fly through as many gaps as you can. Touching a pipe or the ground ends the run.

Press `D` to toggle the Redux devtools and `C` to toggle the collision shapes.

## License

**MIT License - Free and open source**

Created by [Matteo Antony Mistretta](https://github.com/IngloriousCoderz)

You're free to use, modify, and distribute this software. See [LICENSE](./LICENSE) for details.
