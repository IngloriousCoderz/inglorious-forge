import { Combobox } from "@inglorious/ui/combobox"

const SEARCH_DEBOUNCE_MS = 300

let fetchCount = 0

export const RemoteCombobox = {
  ...Combobox,

  toggle(entity, payload, api) {
    Combobox.toggle(entity, payload, api)

    if (!entity.isOpen) return

    api.notify(`#${entity.id}:optionsLoad`)
  },

  searchChange(entity, searchTerm, api) {
    Combobox.searchChange(entity, searchTerm, api)
    api.notifyDebounced(
      `#${entity.id}:optionsLoad`,
      searchTerm,
      SEARCH_DEBOUNCE_MS,
    )
  },

  async optionsLoad(entity, searchTerm, api) {
    const entityId = entity.id
    entity.isLoading = true
    const loadedOptions = await loadData(searchTerm)
    api.notify(`#${entityId}:optionsLoadSuccess`, loadedOptions)
  },

  optionsLoadSuccess(entity, payload) {
    entity.isLoading = false
    entity.options = payload
  },
}

async function loadData(searchTerm = "") {
  fetchCount++
  // eslint-disable-next-line no-console
  console.log(`[RemoteCombobox] fetch #${fetchCount} for "${searchTerm}"`)

  const allOptions = [
    { value: "cat", label: "Cat" },
    { value: "dog", label: "Dog" },
    { value: "seal", label: "Seal" },
    { value: "shark", label: "Shark", isDisabled: true },
  ]

  const term = searchTerm.trim().toLowerCase()
  if (!term) return allOptions

  return allOptions.filter((option) =>
    option.label.toLowerCase().includes(term),
  )
}
