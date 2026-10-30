import { Engine } from "@inglorious/engine/core/engine.js"
import { createRenderer } from "@inglorious/renderer-2d/index.js"

import game from "./game.ijs"

const FONTS = [16, 32].map((size) => `${size}px 'Breakout'`)

window.addEventListener("load", async () => {
  await Promise.all(FONTS.map((font) => document.fonts.load(font).catch(noop)))

  const canvas = document.getElementById("canvas")
  const engine = new Engine(createRenderer(canvas), game)

  await engine.init()
  engine.start()
})

function noop() {}
