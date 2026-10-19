// The app's components in lit-html: tagged templates in .js or .ts files.

import { importBlock } from "./imports.js"

export const extension = (app) => (app.isTypeScript ? "ts" : "js")

export function appSource(app, { pages, navIcons }) {
  const imports = ['import { html } from "@inglorious/web"']
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

  const template = app.ui
    ? uiShell(app, { label, pages, content })
    : plainShell(app, { label, pages, content })

  return `${importBlock(imports)}

export const App = {
  ${signature} {
${renderLocals(app)}    return html\`
${template}
    \`
  },
}
`
}

// The app's own entities are always there; TypeScript cannot know that.
export function renderLocals(app) {
  const always = app.isTypeScript ? "!" : ""
  const locals = []
  if (app.routing) {
    locals.push(`    const router = api.getEntity("router")${always}`)
  }
  if (app.i18n) locals.push(`    const i18n = api.getEntity("i18n")${always}`)
  return locals.length ? `${locals.join("\n")}\n\n` : ""
}

function uiShell(app, { label, pages, content }) {
  const nav = []
  if (app.links) {
    nav.push(
      ...pages.map(
        (page) =>
          `Link.render({ href: "${page.path}", children: ${label(page.key, page.text)} })`,
      ),
    )
  }
  if (app.i18n) {
    nav.push(`Select.render({
                value: i18n.locale,
                options: i18n.languages,
                size: "sm",
                ariaLabel: t("language"),
                onChange: (locale) => api.notify("#i18n:localeChange", locale),
              })`)
  }

  const trailing = nav.length
    ? `
          trailing: html\`<nav class="app-nav">
            \${[
              ${nav.join(",\n              ")},
            ]}
          </nav>\`,`
    : ""

  const header = `      <header${app.mobile ? ' class="pt-safe"' : ""}>
        \${AppBar.render({
          title: "${app.projectName}",${trailing}
        })}
      </header>
      <main>
        \${Container.render({ maxWidth: "md", children: ${content} })}
      </main>`

  if (!app.tabs) return header

  const actions = pages.map(
    (page) => `            {
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
        \${BottomNavigation.render({
          value: router.path,
          actions: [
${actions.join("\n")}
          ],
          onChange: (path) => api.notify("#router:navigate", path),
        })}
      </footer>`
}

// The native language picker's change handler, laid out as Prettier would at
// `indent`. TypeScript has to be told what the event's target is.
export function selectChange(app, indent) {
  if (!app.isTypeScript) {
    return `(event) =>
${indent}  api.notify("#i18n:localeChange", event.target.value)`
  }
  return `(event: Event) =>
${indent}  api.notify(
${indent}    "#i18n:localeChange",
${indent}    (event.target as HTMLSelectElement).value,
${indent}  )`
}

function plainShell(app, { label, pages, content }) {
  const nav = app.routing
    ? pages.map(
        (page) =>
          `          <a href="${page.path}">\${${label(page.key, page.text)}}</a>`,
      )
    : []
  if (app.i18n) {
    nav.push(`          <select
            aria-label=\${t("language")}
            @change=\${${selectChange(app, "            ")}}
          >
            \${i18n.languages${app.isTypeScript ? "?." : "."}map(
              (language) =>
                html\`<option
                  value=\${language.value}
                  ?selected=\${language.value === i18n.locale}
                >
                  \${language.label}
                </option>\`,
            )}
          </select>`)
  }
  const navBlock = nav.length
    ? `
        <nav class="app-nav">
${nav.join("\n")}
        </nav>`
    : ""

  return `      <header>
        <strong>${app.projectName}</strong>${navBlock}
      </header>
      <main>\${${content}}</main>`
}

export function homeSource(app, { showcase }) {
  const imports = ['import { html } from "@inglorious/web"']
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

  const text = (key, fallback) => (app.i18n ? `\${t("${key}")}` : fallback)
  const icons = showcase.length
    ? `
      <p class="app-icons">
${showcase
  .map(
    (icon) => `        \${Icon.render({
          icon: ${icon.name},
          size: "lg",
          label: "${icon.label}",
        })}`,
  )
  .join("\n")}
      </p>`
    : ""

  const signature = app.isTypeScript
    ? "render(entity: HomeEntity, api: AppApi)"
    : "render(entity, api)"

  return `${importBlock(imports)}

export const Home = {
  ${signature} {
    return html\`
      <h1>${text("home.title", "Welcome")}</h1>
      <p>
        \${api.render("message1")}, \${api.render("message2")},
        \${api.render("message3")}!
      </p>
      <p>${text("home.hint", "Click a greeting to shout it.")}</p>${icons}
    \`
  },
}
`
}

export function aboutSource(app) {
  const imports = ['import { html } from "@inglorious/web"']
  if (app.i18n) imports.push('import { t } from "../i18n"')
  const text = (key, fallback) => (app.i18n ? `\${t("${key}")}` : fallback)

  return `${importBlock(imports)}

export const About = {
  render() {
    return html\`
      <h1>${text("about.title", "About")}</h1>
      <p>${text("about.body", "A page of its own, at its own address.")}</p>
    \`
  },
}
`
}

export function messageSource(app) {
  const imports = ['import { html } from "@inglorious/web"']
  if (app.isTypeScript) {
    imports.push('import type { MessageType } from "../../types"')
  }
  if (app.i18n) imports.push('import { t } from "../i18n"')
  const greeting = app.i18n ? '${t("message.hello", { who })}' : "Hello ${who}"
  const declaration = app.isTypeScript
    ? "export const Message: MessageType = {"
    : "export const Message = {"

  return `${importBlock(imports)}

${declaration}
  click(entity) {
    entity.isUpperCase = !entity.isUpperCase
  },

  render(entity, api) {
    const who = entity.isUpperCase ? entity.who.toUpperCase() : entity.who
    return html\`<span @click=\${() => api.notify(\`#\${entity.id}:click\`)}
      >${greeting}</span
    >\`
  },
}
`
}
