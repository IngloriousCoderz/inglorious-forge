import { Engine } from "@inglorious/engine/core/engine.js"
import { createRenderer } from "@inglorious/renderer-2d/index.js"

import game from "./game.ijs"

const FONTS = [16, 32].map((size) => `${size}px 'Breakout'`)

window.addEventListener("load", async () => {
  // The font is drawn onto the canvas, so it has to be ready before the first frame.
  await Promise.all(FONTS.map((font) => document.fonts.load(font).catch(noop)))

  const canvas = document.getElementById("canvas")
  const engine = new Engine(createRenderer(canvas), game)

  await engine.init()
  engine.start()
})

function noop() {}
