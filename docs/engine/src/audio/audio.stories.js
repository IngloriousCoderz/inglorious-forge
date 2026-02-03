import RendererChooser from "../renderer-chooser.jsx"
import audio from "./audio.js"

export default {
  title: "Engine/Audio",
  component: RendererChooser,
}

export const Audio = {
  args: { config: audio },
}
