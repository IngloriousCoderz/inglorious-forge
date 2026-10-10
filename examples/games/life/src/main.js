import { Engine } from "@inglorious/engine/core/engine"
import { createRenderer } from "@inglorious/renderer-2d"

import { createFoxesAndRabbits } from "./foxes-and-rabbits/index.js"
import { createGameOfLife } from "./game-of-life/index.js"

// The same game with different rules: ?world=game-of-life for Conway's, which is how you
// would link to one of them, and foxes and rabbits for anything else.
const WORLDS = {
  "game-of-life": createGameOfLife,
  "foxes-and-rabbits": createFoxesAndRabbits,
}

const requested = new URLSearchParams(window.location.search).get("world")
const createWorld = WORLDS[requested] || createFoxesAndRabbits

const canvas = document.getElementById("canvas")
const renderer = createRenderer(canvas)
const engine = new Engine(renderer, createWorld())
await engine.init()
engine.start()
