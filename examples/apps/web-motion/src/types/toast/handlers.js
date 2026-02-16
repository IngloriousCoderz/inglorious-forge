export function dismiss(entity, _payload, api) {
  if (entity.motionVariant === "exit") {
    return
  }

  api.notify(`#${entity.id}:removeWithMotion`, "exit")
}
