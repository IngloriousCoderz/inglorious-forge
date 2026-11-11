export const NO_TAB = -1

export const tabs = [
  {
    value: "inbox",
    path: "/",
    label: "Inbox",
    icon: "✉",
    routes: ["inbox", "message"],
  },
  {
    value: "haptics",
    path: "/haptics",
    label: "Haptics",
    icon: "◉",
    routes: ["haptics"],
  },
  {
    value: "settings",
    path: "/settings",
    label: "Settings",
    icon: "⚙",
    routes: ["settings"],
  },
]

export function tabOf(route) {
  return tabs.findIndex((tab) => tab.routes.includes(route))
}
