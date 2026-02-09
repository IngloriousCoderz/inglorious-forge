import { html } from "@inglorious/web"

import type { FormType } from "../../../types"

export const form: FormType = {
  create(entity) {
    entity.value = ""
  },

  inputChange(entity, value) {
    entity.value = value
  },

  formSubmit(entity) {
    entity.value = ""
  },

  render(entity, api) {
    return html`<form
      @submit=${(event: Event) => {
        event.preventDefault()
        api.notify("formSubmit", entity.value)
      }}
    >
      <input
        name="value"
        placeholder="What next?"
        autofocus
        .value=${entity.value}
        @input=${(event: Event) =>
          api.notify("inputChange", (event.target as HTMLInputElement).value)}
      />
      <button ?disabled=${!entity.value}>Add</button>
    </form>`
  },
}
