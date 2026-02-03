import RendererChooser from "../renderer-chooser.jsx"
import image from "./image.js"
import lazyLoading from "./lazy-loading.js"
import sprite from "./sprite.js"
import tilemap from "./tilemap.js"

export default {
  title: "Engine/Image",
  component: RendererChooser,
}

export const Image = {
  args: { config: image },
}

export const Tilemap = {
  args: { config: tilemap },
}

export const Sprite = {
  args: { config: sprite },
}

export const LazyLoading = {
  args: { config: lazyLoading },
}
