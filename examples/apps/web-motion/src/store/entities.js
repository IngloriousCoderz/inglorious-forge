export const entities = {
  motionPanel: {
    type: "MotionPanel",
    motionVariant: "visible",
  },
  playground: {
    type: "Playground",
    nextToast: 1,
  },
  layoutDemo: {
    type: "LayoutDemo",
    order: ["layoutCardA", "layoutCardB", "layoutCardC", "layoutCardD"],
  },
  layoutCardA: {
    type: "LayoutCard",
    color: "#d7ecf7",
    label: "Alpha",
    motionVariant: "visible",
  },
  layoutCardB: {
    type: "LayoutCard",
    color: "#f7e8d7",
    label: "Bravo",
    motionVariant: "visible",
  },
  layoutCardC: {
    type: "LayoutCard",
    color: "#e3f0d3",
    label: "Charlie",
    motionVariant: "visible",
  },
  layoutCardD: {
    type: "LayoutCard",
    color: "#f4dff0",
    label: "Delta",
    motionVariant: "visible",
  },
  sharedDemo: {
    type: "SharedDemo",
    expanded: false,
  },
  sharedHeroCompact: {
    type: "SharedPill",
    label: "Compact Hero",
    mode: "compact",
    motionLayoutId: "shared-hero",
  },
  sharedHeroExpanded: {
    type: "SharedPill",
    label: "Expanded Hero",
    mode: "expanded",
    motionLayoutId: "shared-hero",
  },
}
