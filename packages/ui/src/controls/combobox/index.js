import * as handlers from "./handlers.js"
import * as helpers from "./helpers.js"
import { Combobox as renderers } from "./template.js"

export const Combobox = {
  ...handlers,
  ...renderers,
  render(entity, api) {
    const id = entity.id
    const props = {
      ...entity,
      onToggle: () => api.notify(`#${id}:toggle`),
      onClear: () => {
        api.notify(`#${id}:clear`)
        entity.onClear?.()
      },
      onClose: () => {
        api.notify(`#${id}:close`)
        entity.onClose?.()
      },
      onSearchChange: (value) => {
        api.notify(`#${id}:searchChange`, value)
        entity.onSearchChange?.(value)
      },
      onFocusSet: (index) => api.notify(`#${id}:focusSet`, index),
      onFocusNext: () => api.notify(`#${id}:focusNext`),
      onFocusPrev: () => api.notify(`#${id}:focusPrev`),
      onFocusFirst: () => api.notify(`#${id}:focusFirst`),
      onFocusLast: () => api.notify(`#${id}:focusLast`),
      onOptionSelect: (option) => api.notify(`#${id}:optionSelect`, option),
    }

    return renderers.render(props)
  },
}

export const {
  filterOptions,
  formatOption,
  getOptionLabel,
  getOptionValue,
  isOptionSelected,
} = helpers
