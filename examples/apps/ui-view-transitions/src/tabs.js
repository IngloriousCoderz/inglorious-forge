export const NO_TAB = -1

export const tabs = [
  { value: "home", path: "/", label: "Home", icon: "⌂", routes: ["home"] },
  {
    value: "articles",
    path: "/articles",
    label: "Articles",
    icon: "☰",
    routes: ["articleList", "articleDetail"],
  },
  {
    value: "about",
    path: "/about",
    label: "About",
    icon: "ⓘ",
    routes: ["about"],
  },
]

export function tabOf(route) {
  return tabs.findIndex((tab) => tab.routes.includes(route))
}
