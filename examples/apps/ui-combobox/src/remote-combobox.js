import { handleRequest } from "@inglorious/store/async"
import { Combobox } from "@inglorious/ui/combobox"
import { withDebounce } from "@inglorious/web/decorators/with-debounce"

const DEBOUNCE_DELAY_MS = 300
const OPTIONS_LOAD_DELAY_MS = 150
// The server also knows what kind of animal each one is, which the labels
// don't say: searching "feline" finds the cat.
const ALL_OPTIONS = [
  { value: "cat", label: "Cat", kind: "feline mammal" },
  { value: "dog", label: "Dog", kind: "canine mammal" },
  { value: "seal", label: "Seal", kind: "pinniped mammal" },
  { value: "shark", label: "Shark", kind: "fish", isDisabled: true },
]

const BaseRemoteCombobox = {
  ...Combobox,

  toggle(entity, payload, api) {
    Combobox.toggle(entity, payload, api)
    if (entity.isOpen) api.notify(`#${entity.id}:optionsLoad`, "")
  },

  searchChange(entity, searchTerm, api) {
    Combobox.searchChange(entity, searchTerm, api)
    api.notify(`#${entity.id}:optionsLoad`, searchTerm)
  },

  // The Combobox's own `error` is its validation message: the request keeps
  // its state in fields of its own.
  ...handleRequest(
    "optionsLoad",
    {
      run: (searchTerm) => loadData(searchTerm),
      start(entity) {
        entity.isLoading = true
      },
      success(entity, options) {
        entity.isLoading = false
        Combobox.optionsSet(entity, options)
      },
      error(entity) {
        entity.isLoading = false
      },
    },
    { status: "loadStatus", error: "loadError" },
  ),
}

export const RemoteCombobox = [
  BaseRemoteCombobox,
  withDebounce(DEBOUNCE_DELAY_MS, ["optionsLoad"]),
]

async function loadData(searchText = "") {
  return await new Promise((resolve) => {
    setTimeout(() => {
      const normalizedQuery = searchText.trim().toLowerCase()
      const filteredOptions = ALL_OPTIONS.filter(({ label, kind }) => {
        if (!normalizedQuery) return true

        return `${label} ${kind}`.toLowerCase().includes(normalizedQuery)
      }).map(withoutKind)

      resolve(filteredOptions)
    }, OPTIONS_LOAD_DELAY_MS)
  })
}

function withoutKind(option) {
  const { kind, ...rest } = option // eslint-disable-line no-unused-vars
  return rest
}
