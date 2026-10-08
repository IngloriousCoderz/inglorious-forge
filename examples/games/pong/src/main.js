import { Engine } from "@inglorious/engine/core/engine"
import { createRenderer } from "@inglorious/renderer-2d"

import game from "./game.ijs"

window.addEventListener("load", async () => {
  const isMobile = /Mobi/i.test(navigator.userAgent)
  game.entities.game.isMobile = isMobile

  const canvas = document.getElementById("canvas")
  const renderer = createRenderer(canvas)
  const engine = new Engine(renderer, game)
  await engine.init()
  engine.start()

  const prompt = document.getElementById("fullscreen-prompt")
  if (isMobile) prompt.style.display = "block"
  window.addEventListener("click", goFullscreen)
})

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
