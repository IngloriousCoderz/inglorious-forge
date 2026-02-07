export const message = {
  click(entity) {
    entity.isUpperCase = !entity.isUpperCase
  },

  render(entity, api) {
    const who = entity.isUpperCase ? entity.who.toUpperCase() : entity.who
    return (
      <span onClick={() => api.notify(`#${entity.id}:click`)}>Hello {who}</span>
    )
  },
}
