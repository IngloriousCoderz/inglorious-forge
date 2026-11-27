# Inglorious Game (TypeScript)

> Running on StackBlitz with the latest published packages, and the Inglorious agent skills installed for coding agents. To start a project of your own, run `pnpm create @inglorious/game --template=ts`.

A game made with the [Inglorious Engine](https://inglorious-engine.vercel.app/), scaffolded by [@inglorious/create-game](https://www.npmjs.com/package/@inglorious/create-game).

It starts as a small, complete game: collect coins before the time runs out. Every coin is worth as many points as your level, and every 5 points takes you up a level. Move with the arrow keys, WASD, a gamepad or a finger; press Space, the gamepad's A button or tap to play again.

## Getting started

```sh
npm install
npm run dev
```

| Command              | What it does                                  |
| -------------------- | --------------------------------------------- |
| `npm run dev`        | Runs the game, reloading on every save        |
| `npm run test`       | Runs the tests in `test/` once                |
| `npm run test:watch` | Runs the tests again on every save            |
| `npm run build`      | Builds the game into `dist/`, ready to deploy |
| `npm run preview`    | Serves the build                              |
| `npm run typecheck`  | Checks the types                              |

With `devMode: true` on the `game` entity, the [Redux DevTools](https://github.com/reduxjs/redux-devtools) show every event and entity.

## How it works

- `src/game.ts` is the whole game: `types` say how each kind of thing behaves, `entities` are the things in the game.
- A type is a set of event handlers. `update` runs every frame with the seconds since the last one; any other name answers an event sent with `api.notify(name, payload)`, like `coinCollect`.
- Types compose: the player is its own handlers plus `modernControls()` (moves with the input) and `clamped()` (stays on screen).
- `createControlEntities` maps keys, gamepad buttons and taps to the event names the types listen for.
- `test/game.test.ts` drives the game frame by frame with `createGame`: press keys, advance time, check entities.

Ideas to make it yours: add an enemy that chases the player, a power-up that slows time, achievements for streaks, a leaderboard.

## Learn more

- [Engine documentation](https://inglorious-engine.vercel.app/)
- [Example games](https://github.com/IngloriousCoderz/inglorious-forge/tree/main/examples/games)
