export const requiresAuth = (type) => ({
  routeChange(entity, payload, api) {
    // Does this event concern me?
    if (payload.route !== entity.id) return

    const user = localStorage.getItem("user")
    if (!user) {
      api.notify("navigate", {
        to: "/login",
        redirectTo: window.location.pathname,
        replace: true,
      })
      return
    }

    type.routeChange?.(entity, payload, api)
  },
})
