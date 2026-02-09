export default function render(entity, api) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        api.notify("formSubmit", entity.value)
      }}
    >
      <input
        name="value"
        placeholder="What next?"
        autoFocus
        value={entity.value}
        onInput={(event) => api.notify("inputChange", event.target.value)}
      />
      <button disabled={!entity.value}>Add</button>
    </form>
  )
}
