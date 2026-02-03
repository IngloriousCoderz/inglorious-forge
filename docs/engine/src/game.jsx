import "../public/style.css"

import { Engine } from "@inglorious/engine/core/engine"
import { createRenderer } from "@inglorious/renderer-2d"
import { useEffect, useRef } from "react"

export default function Game({ config }) {
  const canvas = useRef()

  useEffect(() => {
    if (!canvas.current) return

    let engine
    startEngine().then((e) => (engine = e))

    async function startEngine(engine) {
      const renderer = createRenderer(canvas.current)
      engine = new Engine(renderer, config)
      await engine.init()
      engine.start()
      return engine
    }

    return () => {
      engine.stop()
    }
  }, [canvas, config])

  return <canvas width="800" height="600" ref={canvas} />
}
