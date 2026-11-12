import path from "path"

import { ICON_PACKS } from "./features.js"

export const LINE_WIDTH = 80

/**
 * The parts of the app the components draw: the pages (with sign-in, a
 * profile page too), the icons on the tabs (from the first icon pack) and one
 * icon from each pack for the home page.
 */
export function appModel(app) {
  const [navPack] = app.icons
  const hasProfile = app.auth && app.routing
  const pages = [
    { path: "/", key: "nav.home", text: "Home", id: "home" },
    { path: "/about", key: "nav.about", text: "About", id: "about" },
    ...(hasProfile
      ? [
          {
            path: "/profile",
            key: "auth.profile",
            text: "Profile",
            id: "profile",
          },
        ]
      : []),
  ]
  const packIcons = app.tabs && navPack ? ICON_PACKS[navPack].nav : null
  const navIcons = packIcons
    ? Object.fromEntries(pages.map((page) => [page.id, packIcons[page.id]]))
    : null
  return {
    navIcons,
    pages: pages.map(({ id, ...page }) => ({ ...page, icon: navIcons?.[id] })),
    showcase: app.icons.map((key) => ICON_PACKS[key].showcase),
  }
}

/**
 * Where each part of a generated app lives. The shell and its own pieces are
 * in src/app; routed screens are in src/views, and without routing the one
 * screen is a piece of the shell. A piece lives with what renders it, so the
 * messages live in the home screen's folder.
 */
export function layout(app) {
  const screens = app.routing ? "src/views" : "src/app"
  return {
    app: "src/app",
    home: `${screens}/home`,
    about: "src/views/about",
    message: `${screens}/home/message`,
    analytics: "src/app/analytics",
    pushPrompt: "src/app/push-prompt",
    nativeUpdate: "src/app/native-update",
    auth: "src/app/auth",
  }
}

/** The import specifier from a folder to a path, both relative to the project. */
export function relative(fromDir, to) {
  const specifier = path.posix.relative(fromDir, to)
  return specifier.startsWith(".") ? specifier : `./${specifier}`
}

export function call(name, args, indent, trailing) {
  const line = `${indent}${name}(${args.join(", ")})${trailing}`
  if (line.length <= LINE_WIDTH) return line
  return `${indent}${name}(
${args.map((arg) => `${indent}  ${arg},`).join("\n")}
${indent})${trailing}`
}

export function union(name, members) {
  const line = `export type ${name} = ${members.join(" | ")}`
  if (line.length <= LINE_WIDTH) return line
  const secondLine = `  ${members.join(" | ")}`
  if (secondLine.length <= LINE_WIDTH)
    return `export type ${name} =\n${secondLine}`
  return `export type ${name} =\n${members.map((member) => `  | ${member}`).join("\n")}`
}

export function indent(block, spaces) {
  const pad = " ".repeat(spaces)
  return block
    .split("\n")
    .map((line) => (line ? pad + line : line))
    .join("\n")
}
