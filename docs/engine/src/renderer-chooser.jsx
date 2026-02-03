import ReactGame from "@inglorious/renderer-react-dom/game/index.jsx"

import CanvasGame from "./game.jsx"

export default function RendererChooser({ renderer = "canvas", ...props }) {
  return renderer === "canvas" ? (
    <CanvasGame {...props} />
  ) : (
    <ReactGame {...props} />
  )
}
