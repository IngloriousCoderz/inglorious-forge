import * as handlers from "./handlers.js"
import { render as renderTemplate } from "./template.js"

export const BeforeAfter = {
  ...handlers,

  /**
   * Entity entrypoint. Bridges the stored entity to the pure template by
   * turning divider movement into a scoped `setPosition` event, so the only
   * state that lives on the entity is `position`.
   * @param {import('../../../types/controls/before-after.js').BeforeAfterProps} entity
   * @param {import('@inglorious/web').Api} api
   * @returns {import('@inglorious/web').TemplateResult}
   */
  render(entity, api) {
    const id = entity.id

    const props = {
      ...entity,
      onSlide: (position) => {
        api.notify(`#${id}:setPosition`, position)
        entity.onChange?.(position)
      },
    }

    return renderTemplate(props)
  },
}
