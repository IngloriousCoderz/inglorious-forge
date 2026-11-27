# my-game

A game made with the [Inglorious Engine](https://inglorious-engine.vercel.app/), scaffolded by [@inglorious/create-game](https://www.npmjs.com/package/@inglorious/create-game).

It starts as a small, complete game: collect coins before the time runs out. Every coin is worth as many points as your level, and every 5 points takes you up a level. Move with the arrow keys, WASD, a gamepad or a finger; press Space, the gamepad's A button or tap to play again.

## Getting started

```sh
pnpm install
pnpm dev
```

| Command           | What it does                                  |
| ----------------- | --------------------------------------------- |
| `pnpm dev`        | Runs the game, reloading on every save        |
| `pnpm test`       | Runs the tests in `test/` once                |
| `pnpm test:watch` | Runs the tests again on every save            |
| `pnpm build`      | Builds the game into `dist/`, ready to deploy |
| `pnpm preview`    | Serves the build                              |
| `pnpm lint`       | Checks the code                               |
| `pnpm format`     | Formats the code                              |

With `devMode: true` on the `game` entity, the [Redux DevTools](https://github.com/reduxjs/redux-devtools) show every event and entity.

## How it works

- `src/game.its` puts the game together: `types` say how each kind of thing behaves, `entities` are the things in the game.
- Each type has its own file in `src/types/`, and its TypeScript types (the entity's fields and the handlers' signatures) in `types/`, imported from `#types`. The numbers they share are in `src/constants.ts`.
- A type is a set of event handlers. `update` runs every frame with the seconds since the last one; any other name answers an event sent with `api.notify(name, payload)`, like `coinCollect`.
- Types compose: the player is its own handlers plus `modernControls()` (moves with the input) and `clamped()` (stays on screen).
- `createControlEntities` maps keys, gamepad buttons and taps to the event names the types listen for.
- `test/game.test.js` drives the game frame by frame with `createGame`: press keys, advance time, check entities.

Ideas to make it yours: add an enemy that chases the player, a power-up that slows time, achievements for streaks, a leaderboard.

## Learn more

- [Engine documentation](https://inglorious-engine.vercel.app/)
- [Example games](https://github.com/IngloriousCoderz/inglorious-forge/tree/main/examples/games)

## IngloriousScript

`.its` files are TypeScript with vector math: `entity.position += entity.velocity * dt` adds and scales vectors made with `v(x, y, z)`, which needs no import. TypeScript doesn't know these operators, so a line that uses them starts with `// @ts-expect-error`. Babel strips the types without checking them, so `pnpm build` runs even with type errors. See [@inglorious/babel-plugin-inglorious-script](https://www.npmjs.com/package/@inglorious/babel-plugin-inglorious-script).
