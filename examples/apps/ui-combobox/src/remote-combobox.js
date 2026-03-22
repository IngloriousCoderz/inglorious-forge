import { combobox } from "@inglorious/ui/combobox"

export const remoteCombobox = {
  ...combobox,

  toggle(entity, payload, api) {
    combobox.toggle(entity, payload, api)

    if (!entity.isOpen) return

    api.notify(`#${entity.id}:optionsLoad`)
  },

  async optionsLoad(entity, payload, api) {
    const entityId = entity.id
    entity.isLoading = true
    const loadedOptions = await loadData()
    api.notify(`#${entityId}:optionsLoadSuccess`, loadedOptions)
  },

  optionsLoadSuccess(entity, payload) {
    entity.isLoading = false
    entity.options = payload
  },
}

async function loadData() {
  return await [
    { value: "cat", label: "Cat" },
    { value: "dog", label: "Dog" },
    { value: "seal", label: "Seal" },
    { value: "shark", label: "Shark", isDisabled: true },
  ]
}
