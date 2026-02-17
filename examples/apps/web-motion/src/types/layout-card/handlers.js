export function pulse(entity, _payload, api) {
  const next = entity.motionVariant === "visible" ? "focused" : "visible"
  api.notify(`#${entity.id}:motionVariantChange`, next)
}
