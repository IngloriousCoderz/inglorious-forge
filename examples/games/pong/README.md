# Inglorious Pong

A modern implementation of the classic arcade game, Pong.

![Gameplay Screenshot](https://raw.githubusercontent.com/IngloriousCoderz/inglorious-forge/main/examples/games/pong/public/screenshot.png)

While the core gameplay remains faithful to the original, this port serves as a demonstration of the [**Inglorious Engine**](https://www.npmjs.com/package/@inglorious/engine). It was an exercise in applying modern architectural patterns and tooling to a classic game.

## Running it

```sh
pnpm install
pnpm dev
```

## Checking it

```sh
npx vite-node smoke.js
```

Sixteen headless checks walk the serve, the play, a wall, a point and the end of the game,
and report `all checks passed`.

## What this port is

Pong was written by hand against the engine, and is deliberately the simplest of the
three games here — one ball, two paddles, four states. It is the reference for how little
a game has to say.

The original:

- **Lecture:** [CS50's Intro to Game Development — Lecture 1: Pong](https://www.youtube.com/watch?v=jZqYXSmgDuM)
- **Source (Lua / LÖVE 2D):** [games50/pong](https://github.com/games50/pong)

|                | Lua original                                                            | This port                                                                             |
| -------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Entities       | classes with `Push`                                                     | config objects                                                                        |
| Paddles        | one `Paddle` class, two instances                                       | one behaviour, parameterised by player                                                |
| Input          | `love.keyboard` polled per paddle                                       | one mapping table; each paddle says which of its own actions feed the shared movement |
| Ball direction | a `Ball` class with `dx`/`dy` and a `Paddle:collide` branch per side    | an angle and a speed, `fromAngle(orientation) * maxSpeed`                             |
| Rendering      | `love.graphics` calls                                                   | declarative rectangles and text                                                       |
| Touch          | a `Paddle`/`Ball` branch on whether input came from a mouse or a finger | one `entityTouchMove` per paddle, and a touch shape per entity                        |

### The three that mattered most

**Both paddles are one behaviour.** The keyboard is what keeps the players apart — `W`
and `S` for one, the arrows for the other — and the shared movement code only ever hears
`moveUp` and `moveDown`. Each paddle names which of its own actions feed them, so there
is one paddle and two bindings rather than two paddle classes.

**Direction is an angle, not two axes.** The original stores `dx` and `dy` and branches
on which side of the paddle was hit, which is four cases and a normalisation to get right.
Here it is one angle that the paddle sets, and the velocity is derived from it every
frame. Choosing the serve angle and choosing the deflection angle are then the same
operation.

**Touch is a shape, not a branch.** Whether input came from a mouse or a finger is
declared per entity, so the touch handler does not have to ask.

## Deliberate departures

- **The ball is not clamped at a wall.** It is reflected while still inside, so putting
  it back is never needed. The harness asserts the heading reverses rather than the
  position, which is the mechanism that actually exists.
- **Numbers stay in place.** `10`, `200`, `HEIGHT - 50` sit where they are used rather
  than behind a name each; the lint rule against them is off for games, because in a game
  the surrounding position usually says what the number is.

## Layout

|                        |                                            |
| ---------------------- | ------------------------------------------ |
| `src/game.ijs`         | the config: types, entities, input, sounds |
| `src/types/game.ijs`   | the states: start, serve, play, game over  |
| `src/types/ball.ijs`   | serving, walls, paddles, scoring           |
| `src/types/paddle.ijs` | one paddle, bound to a player              |
| `src/types/score.ijs`  | the score, and the win                     |
