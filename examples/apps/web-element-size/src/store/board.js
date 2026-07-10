const CONFIGS = {
  Button: {
    type: "Button",
    children: "Button",
    color: "primary",
    isFullWidth: true,
  },
  Checkbox: { type: "Checkbox", label: "Checkbox", isChecked: true },
  Switch: { type: "Switch", label: "On", isChecked: true },
  Slider: { type: "Slider", isFullWidth: true },
  Input: { type: "Input", placeholder: "Type here", isFullWidth: true },
}

export const Board = {
  create(entity) {
    entity.children ??= []
  },

  addChild(entity, kind, api) {
    const id = `${kind.toLowerCase()}-${crypto.randomUUID()}`
    entity.children.push(id)
    api.notify("add", { id, ...CONFIGS[kind] })
  },

  removeChild(entity, id, api) {
    entity.children = entity.children.filter((child) => child !== id)
    api.notify("remove", id)
  },
}
