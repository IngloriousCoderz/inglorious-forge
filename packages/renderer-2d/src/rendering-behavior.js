import { trackMouse } from "@inglorious/engine/behaviors/input/mouse.js"
import { trackTouch } from "@inglorious/engine/behaviors/input/touch.js"

import { createCoordinateConverter } from "./coordinates.js"

const ORIGIN = 0
const HALF = 2

export function rendering(canvas) {
  canvas.style.touchAction = "none"

  const ctx = canvas.getContext("2d")

  let _onMouseMove = null
  let _onClick = null
  let _onWheel = null

  let _onTouchStart = null
  let _onTouchMove = null
  let _onTouchEnd = null

  return {
    init(entity, event, api) {
      const game = api.getEntity("game")
      const [gameWidth, gameHeight] = game.size

      const canvasWidth = canvas.width
      const canvasHeight = canvas.height
      const dpi = window.devicePixelRatio

      canvas.width = canvasWidth * dpi
      canvas.height = canvasHeight * dpi

      const scaleX = canvasWidth / gameWidth
      const scaleY = canvasHeight / gameHeight
      const scale = Math.min(scaleX, scaleY)
      const scaledGameWidth = gameWidth * scale
      const scaledGameHeight = gameHeight * scale

      const offsetX = (canvas.width - scaledGameWidth * dpi) / HALF
      const offsetY = (canvas.height - scaledGameHeight * dpi) / HALF

      ctx.clearRect(ORIGIN, ORIGIN, canvas.width, canvas.height)
      ctx.fillStyle = "black"
      ctx.fillRect(ORIGIN, ORIGIN, canvas.width, canvas.height)

      ctx.translate(offsetX, offsetY)
      ctx.scale(scale * dpi, scale * dpi)

      if (game.pixelated) {
        canvas.style.imageRendering = "pixelated"
        ctx.textRendering = "geometricPrecision"
        ctx.imageSmoothingEnabled = false
      }

      const toGamePosition = createCoordinateConverter(canvas, api)

      const { onMouseMove, onClick, onWheel } = trackMouse(
        canvas,
        api,
        toGamePosition,
      )
      _onMouseMove = onMouseMove
      _onClick = onClick
      _onWheel = onWheel

      canvas.addEventListener("mousemove", _onMouseMove)
      canvas.addEventListener("click", _onClick)
      canvas.addEventListener("wheel", _onWheel)

      const { onTouchStart, onTouchMove, onTouchEnd } = trackTouch(
        canvas,
        api,
        toGamePosition,
      )
      _onTouchStart = onTouchStart
      _onTouchMove = onTouchMove
      _onTouchEnd = onTouchEnd

      canvas.addEventListener("touchstart", _onTouchStart)
      canvas.addEventListener("touchmove", _onTouchMove)
      canvas.addEventListener("touchend", _onTouchEnd)
    },

    destroy() {
      if (_onMouseMove) {
        canvas.removeEventListener("mousemove", _onMouseMove)
      }
      if (_onClick) {
        canvas.removeEventListener("click", _onClick)
      }
      if (_onWheel) {
        canvas.removeEventListener("wheel", _onWheel)
      }

      if (_onTouchStart) {
        canvas.removeEventListener("touchstart", _onTouchStart)
      }
      if (_onTouchMove) {
        canvas.removeEventListener("touchmove", _onTouchMove)
      }
      if (_onTouchEnd) {
        canvas.removeEventListener("touchend", _onTouchEnd)
      }
    },
  }
}
