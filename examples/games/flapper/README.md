# Inglorious Flapper

A Flappy Bird clone.

![Gameplay Screenshot](https://raw.githubusercontent.com/IngloriousCoderz/inglorious-forge/main/examples/games/flapper/public/screenshot.png)

While the core gameplay remains faithful to the original, this port serves as a demonstration of the [**Inglorious Engine**](https://www.npmjs.com/package/@inglorious/engine). It was an exercise in applying modern architectural patterns and tooling to a classic game.

## Running it

```sh
pnpm install
pnpm dev
```

## Checking it

```sh
pnpm test
```

Ten headless checks: the title, the countdown, the play and the end of an unplayed game.

## About this port

Flapper is CS50's second lecture game: a bird that falls, a flap that pushes it up, and
pipes with a gap that has to be threaded.

- **Lecture:** [CS50's Intro to Game Development — Lecture 2: Flappy Bird](https://www.youtube.com/watch?v=3IdOCxHGMIo)
- **Original source (Lua / LÖVE 2D):** [games50/fifty-bird](https://github.com/games50/fifty-bird)

|          | Lua original                                  | This port                                                    |
| -------- | --------------------------------------------- | ------------------------------------------------------------ |
| Entities | classes with `Push`                           | config objects                                               |
| States   | one object, `enter`/`exit`/`update` per state | a map of states, composed with the machine                   |
| Keys     | read inside each state                        | one mapping table, beside the states                         |
| The gap  | a pipe class holding its own gap position     | a value on the game, lowered by a random amount per pipe     |
| Text     | drawn from whichever state is current         | one line per message, blank when its state is not the one up |
| Touch    | `mousepressed` and `touchpressed` branches    | one `press` action either way                                |

### The three that mattered most

**States are a table.** Title, countdown, play and game over are four entries, and what
each answers to is declared next to it. Adding a state means adding a key.

**One action for every way of pressing.** Keyboard, mouse and touch all notify the same
`press`, so the game has no idea which was used. The message above the title reads "Press
Enter" or "Tap to Play" from what the game knows about itself.

**The gap belongs to the game, not the pipe.** Each pipe is one of a pair and the gap
between them is a single number, so what lowers it is one function rather than something
both pipes of a pair have to agree about.

## Deliberate departures

- **Numbers stay in place.** As in the other games, the lint rule against magic numbers
  is off here: in a game the surrounding position usually says what a number is.

## Layout

|                      |                                                            |
| -------------------- | ---------------------------------------------------------- |
| `src/game.ijs`       | the config: types, entities, images, input, state mappings |
| `src/types/game.ijs` | what each state does                                       |
| `src/types/bird.ijs` | falling, flapping, scoring                                 |
| `src/types/pipe.ijs` | where the next pair goes and how wide the gap is           |
| `src/types/text.ijs` | the messages, one per state                                |
