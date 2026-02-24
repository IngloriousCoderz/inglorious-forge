export function withRenderValidation(type) {
  if (typeof type.render !== "function") {
    throw new TypeError(
      "withRenderValidation(type): type.render must be a function",
    )
  }

  return {
    ...type,

    render(entity, api) {
      if (entity == null || api == null) {
        throw new TypeError("render(entity, api): both arguments are required")
      }

      return type.render(entity, api)
    },
  }
}
