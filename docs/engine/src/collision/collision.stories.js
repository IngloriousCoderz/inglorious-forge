import RendererChooser from "../renderer-chooser.jsx"
import circles from "./circles.js"
import platform from "./platform.js"
import tilemap from "./tilemap.js"

export default {
  title: "Engine/Collision Detection",
  component: RendererChooser,
}

export const Circles = {
  args: { config: circles },
}

export const Platform = {
  args: { config: platform },
}

export const Tilemap = {
  args: { config: tilemap },
}
