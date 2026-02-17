export const entities = {
  motionPanel: {
    type: "motionPanel",
    motionVariant: "visible",
  },
  playground: {
    type: "playground",
    nextToast: 1,
  },
  layoutDemo: {
    type: "layoutDemo",
    order: ["layoutCardA", "layoutCardB", "layoutCardC", "layoutCardD"],
  },
  layoutCardA: {
    type: "layoutCard",
    color: "#d7ecf7",
    label: "Alpha",
    motionVariant: "visible",
  },
  layoutCardB: {
    type: "layoutCard",
    color: "#f7e8d7",
    label: "Bravo",
    motionVariant: "visible",
  },
  layoutCardC: {
    type: "layoutCard",
    color: "#e3f0d3",
    label: "Charlie",
    motionVariant: "visible",
  },
  layoutCardD: {
    type: "layoutCard",
    color: "#f4dff0",
    label: "Delta",
    motionVariant: "visible",
  },
  sharedDemo: {
    type: "sharedDemo",
    expanded: false,
  },
  sharedHeroCompact: {
    type: "sharedPill",
    label: "Compact Hero",
    mode: "compact",
    motionLayoutId: "shared-hero",
  },
  sharedHeroExpanded: {
    type: "sharedPill",
    label: "Expanded Hero",
    mode: "expanded",
    motionLayoutId: "shared-hero",
  },
}
