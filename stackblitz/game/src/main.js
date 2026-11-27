import { Engine } from "@inglorious/engine/core/engine.js"
import { createRenderer } from "@inglorious/renderer-2d/index.js"

import game from "./game.js"

const canvas = document.getElementById("canvas")
const engine = new Engine(createRenderer(canvas), game)
await engine.init()
engine.start()
