import { Engine } from "@inglorious/engine/core/engine"
import { createRenderer } from "@inglorious/renderer-2d"

import game from "./game.js"

const canvas = document.getElementById("canvas")
const renderer = createRenderer(canvas)
const engine = new Engine(renderer, game)
await engine.init()
engine.start()
