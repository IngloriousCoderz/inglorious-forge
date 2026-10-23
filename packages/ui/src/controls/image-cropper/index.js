import * as handlers from "./handlers.js"
import { ImageCropper as renderers } from "./template.js"

export { cropImage, decodeImage } from "./image.js"

export const ImageCropper = {
  ...handlers,
  ...renderers,
  render(entity, api) {
    const id = entity.id
    const props = {
      ...entity,
      onImageError: () => api.notify(`#${id}:imageError`),
      onImageLoad: (size) => api.notify(`#${id}:imageLoad`, size),
      onRectChange: (rect) => api.notify(`#${id}:rectChange`, rect),
    }

    return this.renderImageCropper(props)
  },
}
