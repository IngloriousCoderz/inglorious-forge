import { removeWithMotion } from "@inglorious/motion"

export function dismiss(entity, _payload, api) {
  if (entity.motionVariant === "exit") {
    return
  }

  removeWithMotion(api, entity.id, { exitVariant: "exit" })
}
