import { Engine } from "@inglorious/engine/core/engine.js"
import { createRenderer } from "@inglorious/renderer-2d/index.js"

import {
  FONT_FAMILY,
  FONT_SIZE_HUGE,
  FONT_SIZE_LARGE,
  FONT_SIZE_MEDIUM,
  FONT_SIZE_SMALL,
  FONT_SMALL_FAMILY,
} from "./constants.js"
import game from "./game.ijs"

const FONTS = [
  [FONT_SIZE_SMALL, FONT_SMALL_FAMILY],
  [FONT_SIZE_MEDIUM, FONT_FAMILY],
  [FONT_SIZE_LARGE, FONT_FAMILY],
  [FONT_SIZE_HUGE, FONT_FAMILY],
].map(([size, family]) => `${size}px ${family}`)

window.addEventListener("load", async () => {
  game.entities.game.isMobile = /Mobi/i.test(navigator.userAgent)

  // The pixel fonts are drawn on the canvas, so they have to be ready before
  // the first frame is painted.
  await Promise.all(FONTS.map((font) => document.fonts.load(font).catch(noop)))

  const canvas = document.getElementById("canvas")
  const renderer = createRenderer(canvas)
  const engine = new Engine(renderer, game)
  await engine.init()
  engine.start()

  const prompt = document.getElementById("fullscreen-prompt")
  if (game.entities.game.isMobile) prompt.style.display = "block"
  window.addEventListener("click", goFullscreen)
})

function noop() {}

async function goFullscreen() {
  const prompt = document.getElementById("fullscreen-prompt")
  prompt.style.display = "none"

  const element = document.documentElement

  await (element.requestFullscreen || element.webkitRequestFullscreen)?.call(
    element,
  )
  await screen.orientation?.lock("landscape")

  window.removeEventListener("click", goFullscreen)
}
