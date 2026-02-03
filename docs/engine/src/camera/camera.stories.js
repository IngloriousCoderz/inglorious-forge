import RendererChooser from "../renderer-chooser.jsx"
import camera from "./camera.js"

export default {
  title: "Engine/Camera",
  component: RendererChooser,
}

export const Default = {
  args: { config: camera },
}
