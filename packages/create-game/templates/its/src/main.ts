import { Engine } from "@inglorious/engine/core/engine.js"
import { createRenderer } from "@inglorious/renderer-2d/index.js"

import game from "./game.its"

const canvas = document.querySelector<HTMLCanvasElement>("#canvas")!
const engine = new Engine(createRenderer(canvas), game)
await engine.init()
engine.start()
