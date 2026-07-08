import { Combobox } from "@inglorious/ui/combobox"
import { withDebounce } from "@inglorious/web/decorators/with-debounce"

const DEBOUNCE_DELAY_MS = 300
const OPTIONS_LOAD_DELAY_MS = 150
const ALL_OPTIONS = [
  { value: "cat", label: "Cat" },
  { value: "dog", label: "Dog" },
  { value: "seal", label: "Seal" },
  { value: "shark", label: "Shark", isDisabled: true },
]

const BaseRemoteCombobox = {
  ...Combobox,

  toggle(entity, payload, api) {
    Combobox.toggle(entity, payload, api)

    if (!entity.isOpen) return

    api.notify(`#${entity.id}:optionsLoad`)
  },

  searchChange(entity, searchTerm, api) {
    Combobox.searchChange(entity, searchTerm, api)
    api.notify(`#${entity.id}:optionsLoad`)
  },

  async optionsLoad(entity, payload, api) {
    const entityId = entity.id
    entity.isLoading = true
    const loadedOptions = await loadData(entity.searchTerm)
    api.notify(`#${entityId}:optionsLoadSuccess`, loadedOptions)
  },

  optionsLoadSuccess(entity, payload) {
    entity.isLoading = false
    entity.options = payload
  },
}

export const RemoteCombobox = [
  BaseRemoteCombobox,
  withDebounce(DEBOUNCE_DELAY_MS, ["searchChange"]),
]

async function loadData(searchText = "") {
  return await new Promise((resolve) => {
    setTimeout(() => {
      const normalizedQuery = searchText.trim().toLowerCase()
      const filteredOptions = ALL_OPTIONS.filter((option) => {
        if (!normalizedQuery) return true

        return option.label.toLowerCase().includes(normalizedQuery)
      })

      resolve(filteredOptions)
    }, OPTIONS_LOAD_DELAY_MS)
  })
}
