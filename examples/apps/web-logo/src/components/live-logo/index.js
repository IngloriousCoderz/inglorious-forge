import { Logo, startInteraction, stopInteraction } from "@inglorious/logo"
import { set } from "@inglorious/utils/object.js"

export const LiveLogo = {
  ...Logo,

  fieldChange(entity, { path, value }, api) {
    set(entity, path, value)

    if (!path.includes("isInteractive")) return

    if (value) {
      startInteraction(entity, api)
    } else {
      stopInteraction()
    }
  },
}
