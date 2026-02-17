export function addToast(entity, _payload, api) {
  const next = entity.nextToast
  entity.nextToast += 1

  api.notify("add", {
    id: `toast-${next}`,
    type: "toast",
    title: `Toast #${next}`,
    message: "Presence mode=wait queues exits in this group.",
    motionVariant: "visible",
    motionPresenceGroup: "toasts",
  })
}
