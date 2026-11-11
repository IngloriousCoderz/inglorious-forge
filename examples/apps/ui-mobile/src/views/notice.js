import { Button } from "@inglorious/ui/button"
import { Snackbar } from "@inglorious/ui/snackbar"
import { when } from "@inglorious/web/directives/when"

const VISIBLE_MS = 3000

export const Notice = {
  show(entity, { message, canUndo = false }, api) {
    const shownAt = Date.now()
    entity.message = message
    entity.canUndo = canUndo
    entity.shownAt = shownAt
    setTimeout(() => api.notify("#notice:expire", shownAt), VISIBLE_MS)
  },

  expire(entity, shownAt) {
    if (entity.shownAt === shownAt) entity.message = null
  },

  hide(entity) {
    entity.message = null
  },

  render(entity, api) {
    return Snackbar.render({
      isOpen: Boolean(entity.message),
      position: "bottom-center",
      message: entity.message,
      action: when(entity.canUndo, () =>
        Button.render({
          variant: "ghost",
          size: "sm",
          onClick: () => {
            api.notify("#inbox:undo")
            api.notify("#notice:hide")
          },
          children: "Undo",
        }),
      ),
      onClose: () => api.notify("#notice:hide"),
    })
  },
}
