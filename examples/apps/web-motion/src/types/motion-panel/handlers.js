export function toggle(entity, _payload, api) {
  const variant = entity.motionVariant === "visible" ? "hidden" : "visible"
  api.notify(`#${entity.id}:motionVariantChange`, variant)
}
