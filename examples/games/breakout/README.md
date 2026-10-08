# Inglorious Breakout

A port of CS50's Breakout, brought to the web on the [Inglorious Engine](https://www.npmjs.com/package/@inglorious/engine).

![Gameplay Screenshot](https://raw.githubusercontent.com/IngloriousCoderz/inglorious-forge/main/examples/games/breakout/public/screenshot.png)

## The original

- **Lecture:** [CS50's Introduction to Game Development — Breakout](https://cs50.harvard.edu/games/)
- **Source (Lua / LÖVE 2D):** [games50/breakout](https://github.com/games50/breakout)

The reference is the final version of the course project, which by the end includes a
serve-and-wait state, levels rolled per row, a seeded table of high scores kept between
games, a name-entry screen, paddle selection, and a life recovered for every so many
points scored.

## Running it

```sh
pnpm install
pnpm dev
```

## Checking it

The game is covered by a headless harness that drives the store directly, with no canvas
and no browser:

```sh
pnpm test
```

It walks the states, breaks bricks, recovers lives, records scores and types names — 324 checks, run by `pnpm test` at the root.

## What changed, and why

The rules are the original's. The structure is not.

|                               | Lua original                                  | This port                                  |
| ----------------------------- | --------------------------------------------- | ------------------------------------------ |
| Entities                      | classes with constructors and `Push`          | config objects                             |
| State machine                 | one object, `enter`/`exit`/`update` per state | a map of states, composed with the machine |
| Keys per screen               | each state re-implements key reading          | one table of mappings, beside the states   |
| Passing state between screens | `params` threaded through every transition    | plain fields on the game entity            |
| Text                          | drawn inline at each call site                | declarative lines with named parameters    |
| Scoring                       | a score and a level on the serve screen       | fields the serve and the play both read    |
| Sprite slicing                | a quad table, and a `crop` per frame          | pixel arithmetic over a declared grid      |

### The three that mattered most

**State crossing screens is a field, not a parameter.** The original threads `level`,
`score`, `health`, `paddle` and — by the last version — `recoverPoints` through every
transition. Here they are properties of the game entity, which outlives every screen. A
life recovered on the last brick of a level is simply still in hand on the next serve.

**Keys are data.** The same four arrows mean opposite things on the paddle-select screen
and in play. Here that is two entries in a table rather than two hand-written readers.

**Entities are values.** Adding a field to a brick is one line, and a scene is an array
you can read top to bottom.

### Where the port is longer

The original's `Push` utility, its state machine, its class helper and its dependency
loader come to 281 lines that the engine absorbs. Against the game's own logic the port
is about a quarter longer, and most of the difference is text placement — the original
writes coordinates at the point of drawing, which costs it nothing, while here they are
named once and reused across the scenes that show them.

## Deliberate departures

- **A new game starts at zero.** The original seeds the first game at three thousand so
  it can beat the shipped table; at zero a first game cannot enter the table at all.
- **`recoverPoints` starts at three thousand**, not five, so the first life is reachable
  in a first game.
- **Levels start at one.** The reference's paddle-select screen says `level = 32`, which
  would skip levels 2 to 31 entirely.
- **A bar crossed at full health still doubles.** Faithful to the original, and worth
  knowing: hearing the recover sound does not mean a life was gained.
- **Text is aligned, not offset.** The original hangs its hearts a pixel above its score
  and prints its number half a font below its own label; here all three sit on one row.

## Layout

|                        |                                                             |
| ---------------------- | ----------------------------------------------------------- |
| `src/game.ijs`         | the config: types, entities, images, sounds, state mappings |
| `src/types/states.ijs` | what each state does                                        |
| `src/types/scene.ijs`  | what stands on screen in each state                         |
| `src/levelmaker.ijs`   | the random level                                            |
| `src/atlas.js`         | where each sprite is on its sheet                           |
| `src/high-scores.js`   | the table kept between games                                |
