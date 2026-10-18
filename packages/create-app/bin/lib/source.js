// What the generated app's components share, whatever their syntax: the pages,
// the icons they show, and helpers that print code the way Prettier would.

import { ICON_PACKS } from "./features.js"

// Prettier's line width, which generated files are written to fit.
export const LINE_WIDTH = 80

/**
 * The parts of the app the components draw: the two pages, the icons on the
 * tabs (from the first icon pack) and one icon from each pack for the home
 * page.
 */
export function appModel(app) {
  const [navPack] = app.icons
  const navIcons = app.tabs && navPack ? ICON_PACKS[navPack].nav : null
  return {
    navIcons,
    pages: [
      { path: "/", key: "nav.home", text: "Home", icon: navIcons?.home },
      {
        path: "/about",
        key: "nav.about",
        text: "About",
        icon: navIcons?.about,
      },
    ],
    showcase: app.icons.map((key) => ICON_PACKS[key].showcase),
  }
}

// `name(args)` on one line when it fits, one argument per line otherwise, as
// Prettier prints a call.
export function call(name, args, indent, trailing) {
  const line = `${indent}${name}(${args.join(", ")})${trailing}`
  if (line.length <= LINE_WIDTH) return line
  return `${indent}${name}(
${args.map((arg) => `${indent}  ${arg},`).join("\n")}
${indent})${trailing}`
}

// `export type Name = A | B`, broken after the `=` when too long, as Prettier
// prints it.
export function union(name, members) {
  const line = `export type ${name} = ${members.join(" | ")}`
  if (line.length <= LINE_WIDTH) return line
  return `export type ${name} =
  ${members.join(" | ")}`
}

// Indents every non-empty line of a block.
export function indent(block, spaces) {
  const pad = " ".repeat(spaces)
  return block
    .split("\n")
    .map((line) => (line ? pad + line : line))
    .join("\n")
}
