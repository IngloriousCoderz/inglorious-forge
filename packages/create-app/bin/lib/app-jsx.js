// The app's components in JSX: .jsx or .tsx files, compiled to lit-html by
// @inglorious/vite-plugin-jsx. Capitalized tags render store entities;
// Inglorious UI components are called as functions inside braces.

import { renderLocals } from "./app-lit.js"
import { importBlock } from "./imports.js"
import { LINE_WIDTH } from "./source.js"

export const extension = (app) => (app.isTypeScript ? "tsx" : "jsx")

export function appSource(app, { pages, navIcons }) {
  const imports = []
  if (navIcons) {
    for (const icon of Object.values(navIcons)) {
      imports.push(`import ${icon.name} from "${icon.from}"`)
    }
    imports.push('import { Icon } from "@inglorious/ui/icon"')
  }
  if (app.ui) {
    imports.push(
      'import { AppBar } from "@inglorious/ui/app-bar"',
      'import { Container } from "@inglorious/ui/container"',
    )
    if (app.tabs) {
      imports.push(
        'import { BottomNavigation } from "@inglorious/ui/bottom-navigation"',
      )
    }
    if (app.links) imports.push('import { Link } from "@inglorious/ui/link"')
    if (app.i18n) imports.push('import { Select } from "@inglorious/ui/select"')
  }
  if (app.isTypeScript) imports.push('import type { AppApi } from "../types"')
  if (app.i18n) imports.push('import { t } from "./i18n"')

  const label = (key, text) => (app.i18n ? `t("${key}")` : `"${text}"`)
  const signature = app.isTypeScript
    ? "render(props: Record<string, unknown> | null, api: AppApi)"
    : "render(props, api)"
  const content = app.routing
    ? "api.render(router.route)"
    : 'api.render("home")'

  const shell = app.ui
    ? uiShell(app, { label, pages, content })
    : plainShell(app, { label, pages, content })

  return `${importBlock(imports)}

export const App = {
  ${signature} {
${renderLocals(app)}    return (
      <>
${shell}
      </>
    )
  },
}
`
}

function uiShell(app, { label, pages, content }) {
  const nav = []
  if (app.links) {
    nav.push(
      ...pages.map(
        (page) =>
          `                {Link.render({ href: "${page.path}", children: ${label(page.key, page.text)} })}`,
      ),
    )
  }
  if (app.i18n) {
    nav.push(`                {Select.render({
                  value: i18n.locale,
                  options: i18n.languages,
                  size: "sm",
                  "aria-label": t("language"),
                  onChange: (locale) =>
                    api.notify("#i18n:localeChange", locale),
                })}`)
  }

  const trailing = nav.length
    ? `
            trailing: (
              <nav class="app-nav">
${nav.join("\n")}
              </nav>
            ),`
    : ""

  const header = `        <header${app.mobile ? ' class="pt-safe"' : ""}>
          {AppBar.render({
            title: "${app.projectName}",${trailing}
          })}
        </header>
        <main>
${containerCall(content)}
        </main>`

  if (!app.tabs) return header

  const actions = pages.map(
    (page) => `              {
                value: "${page.path}",
                label: ${label(page.key, page.text)},${
                  page.icon
                    ? `
                icon: Icon.render({ icon: ${page.icon.name}, size: "lg" }),`
                    : ""
                }
              },`,
  )

  return `${header}
        <footer class="pb-safe">
          {BottomNavigation.render({
            value: router.path,
            actions: [
${actions.join("\n")}
            ],
            onChange: (path) => api.notify("#router:navigate", path),
          })}
        </footer>`
}

// The page in a Container, on one line when it fits.
function containerCall(content) {
  const line = `          {Container.render({ maxWidth: "md", children: ${content} })}`
  if (line.length <= LINE_WIDTH) return line
  return `          {Container.render({
            maxWidth: "md",
            children: ${content},
          })}`
}

function plainShell(app, { label, pages, content }) {
  const nav = app.routing
    ? pages.map(
        (page) =>
          `            <a href="${page.path}">${app.i18n ? `{${label(page.key, page.text)}}` : page.text}</a>`,
      )
    : []
  if (app.i18n) {
    nav.push(`            <select
              aria-label={t("language")}
              onChange={(event) =>
                api.notify("#i18n:localeChange", event.target.value)
              }
            >
              {i18n.languages.map((language) => (
                <option
                  value={language.value}
                  selected={language.value === i18n.locale}
                >
                  {language.label}
                </option>
              ))}
            </select>`)
  }
  const navBlock = nav.length
    ? `
          <nav class="app-nav">
${nav.join("\n")}
          </nav>`
    : ""

  return `        <header>
          <strong>${app.projectName}</strong>${navBlock}
        </header>
        <main>{${content}}</main>`
}

export function homeSource(app, { showcase }) {
  const imports = ['import { Message } from "../types/message"']
  for (const icon of showcase) {
    imports.push(`import ${icon.name} from "${icon.from}"`)
  }
  if (showcase.length) {
    imports.push('import { Icon } from "@inglorious/ui/icon"')
  }
  if (app.isTypeScript) {
    imports.push('import type { AppApi, HomeEntity } from "../../types"')
  }
  if (app.i18n) imports.push('import { t } from "../i18n"')

  const text = (key, fallback) => (app.i18n ? `{t("${key}")}` : fallback)
  const icons = showcase.length
    ? `
        <p class="app-icons">
${showcase
  .map(
    (icon) => `          {Icon.render({
            icon: ${icon.name},
            size: "lg",
            label: "${icon.label}",
          })}`,
  )
  .join("\n")}
        </p>`
    : ""

  // Capitalized tags render entities, which TypeScript takes for components.
  const expectError = app.isTypeScript
    ? "          {/* @ts-expect-error - JSX components are entity type names, not imports */}\n"
    : ""
  const signature = app.isTypeScript
    ? "render(entity: HomeEntity, api: AppApi)"
    : "render(entity, api)"

  return `${importBlock(imports)}

export const Home = {
  ${signature} {
    return (
      <>
        <h1>${text("home.title", "Welcome")}</h1>
        <p>
${expectError}          <Message entityId="message1" />, <Message entityId="message2" />,{" "}
${expectError}          <Message entityId="message3" />!
        </p>
        <p>${text("home.hint", "Click a greeting to shout it.")}</p>${icons}
      </>
    )
  },
}
`
}

export function aboutSource(app) {
  const imports = []
  if (app.isTypeScript) {
    imports.push('import type { AboutEntity } from "../../types"')
  }
  if (app.i18n) imports.push('import { t } from "../i18n"')
  const text = (key, fallback) => (app.i18n ? `{t("${key}")}` : fallback)
  const signature = app.isTypeScript
    ? "render(entity: AboutEntity)"
    : "render()"
  const head = imports.length ? `${importBlock(imports)}\n\n` : ""

  return `${head}export const About = {
  ${signature} {
    return (
      <>
        <h1>${text("about.title", "About")}</h1>
        <p>${text("about.body", "A page of its own, at its own address.")}</p>
      </>
    )
  },
}
`
}

export function messageSource(app) {
  const imports = []
  if (app.isTypeScript) {
    imports.push('import type { MessageType } from "../../types"')
  }
  if (app.i18n) imports.push('import { t } from "../i18n"')
  const greeting = app.i18n ? '{t("message.hello", { who })}' : "Hello {who}"
  const declaration = app.isTypeScript
    ? "export const Message: MessageType = {"
    : "export const Message = {"
  const head = imports.length ? `${importBlock(imports)}\n\n` : ""

  const span = app.i18n
    ? `      <span onClick={() => api.notify(\`#\${entity.id}:click\`)}>
        ${greeting}
      </span>`
    : `      <span onClick={() => api.notify(\`#\${entity.id}:click\`)}>${greeting}</span>`

  return `${head}${declaration}
  click(entity) {
    entity.isUpperCase = !entity.isUpperCase
  },

  render(entity, api) {
    const who = entity.isUpperCase ? entity.who.toUpperCase() : entity.who
    return (
${span}
    )
  },
}
`
}
