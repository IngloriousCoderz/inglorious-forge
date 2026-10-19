import type { FormType } from "../../../types"

export const Form: FormType = {
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
    return (
      <form
        onSubmit={(event: SubmitEvent) => {
          event.preventDefault()
          api.notify("formSubmit", entity.value)
        }}
      >
        <input
          name="value"
          placeholder="What next?"
          autoFocus
          value={entity.value}
          onInput={(event: InputEvent) =>
            api.notify("inputChange", (event.target as HTMLInputElement).value)
          }
        />
        <button disabled={!entity.value}>Add</button>
      </form>
    )
  },
}
