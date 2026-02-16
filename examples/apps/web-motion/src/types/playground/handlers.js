export function addToast(entity, _payload, api) {
  const next = entity.nextToast
  entity.nextToast += 1

  api.notify("add", {
    id: `toast-${next}`,
    type: "toast",
    title: `Toast #${next}`,
    message: "Exit waits for animation end before remove.",
    motionVariant: "visible",
  })
}
