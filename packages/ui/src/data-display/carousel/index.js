import * as handlers from "./handlers.js"
import { Carousel as renderers } from "./template.js"

export const Carousel = {
  ...handlers,
  ...renderers,
  render(entity, api) {
    const id = entity.id
    const props = {
      ...entity,
      onPageChange: (page) => api.notify(`#${id}:pageChange`, page),
      onRotate: (step) => api.notify(`#${id}:rotate`, step),
    }

    return this.renderCarousel(props)
  },
}
