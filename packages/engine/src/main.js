import { createRenderer } from "@inglorious/renderer-2d/index.js"
import game from "game"

import { Engine } from "./core/engine.js"

window.addEventListener("load", async () => {
  const canvas = document.getElementById("canvas")
  const renderer = createRenderer(canvas)
  const engine = new Engine(renderer, game)
  await engine.init()
  engine.start()
})
