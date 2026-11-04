import * as handlers from "./handlers.js"
import { template } from "./template.js"

export { cropImage, decodeImage } from "./image.js"

export const ImageCropper = {
  ...handlers,
  ...template,
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
