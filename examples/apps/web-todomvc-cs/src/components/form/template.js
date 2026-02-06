import { html } from "@inglorious/web"

export function render(entity, api) {
  return html`<form
    @submit=${(event) => {
      event.preventDefault()
      api.notify("formSubmit", entity.value)
    }}
  >
    <input
      name="value"
      placeholder="What next?"
      autofocus
      .value=${entity.value}
      @input=${(event) => api.notify("inputChange", event.target.value)}
    />
    <button ?disabled=${!entity.value}>Add</button>
  </form>`
}
