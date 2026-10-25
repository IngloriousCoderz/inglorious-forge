// The app's components in JSX: .jsx or .tsx files, compiled to lit-html by
// @inglorious/vite-plugin-jsx. A capitalized tag with props renders a
// component; `<Message entityId="message1" />` renders an entity. TypeScript
// expects components to be functions, so in .tsx each capitalized tag is
// preceded by a `@ts-expect-error`.

import { renderLocals, selectChange } from "./app-lit.js"
import { importBlock } from "./imports.js"

export const extension = (app) => (app.isTypeScript ? "tsx" : "jsx")

const EXPECT_ERROR =
  "@ts-expect-error - Inglorious components are objects, not functions"

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

  const signature = app.isTypeScript
    ? "render(props: Record<string, unknown> | null, api: AppApi)"
    : "render(props, api)"
  const content = app.routing
    ? "api.render(router.route)"
    : 'api.render("home")'

  const shell = app.ui
    ? uiShell(app, { pages, content })
    : plainShell(app, { pages, content })

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

export function homeSource(app, { showcase }) {
  const imports = ['import { Message } from "../types/message"']
  for (const icon of showcase) {
    imports.push(`import ${icon.name} from "${icon.from}"`)
  }
  if (showcase.length) {
    imports.push('import { Icon } from "@inglorious/ui/icon"')
  }
  if (app.i18n) imports.push('import { t } from "../i18n"')

  const text = (key, fallback) => (app.i18n ? `{t("${key}")}` : fallback)
  const icons = showcase.length
    ? `
        <p className="app-icons">
${showcase
  .map(
    (icon) =>
      `${expectError(app, "          ")}          <Icon icon={${icon.name}} size="lg" label="${icon.label}" />`,
  )
  .join("\n")}
        </p>`
    : ""

  return `${importBlock(imports)}

export const Home = {
  render() {
    return (
      <>
        <h1>${text("home.title", "Welcome")}</h1>
        <p>
${expectError(app, "          ")}          <Message entityId="message1" />, <Message entityId="message2" />,{" "}
${expectError(app, "          ")}          <Message entityId="message3" />!
        </p>
        <p>${text("home.hint", "Click a greeting to shout it.")}</p>${icons}
      </>
    )
  },
}
`
}

export function aboutSource(app) {
  const head = app.i18n ? 'import { t } from "../i18n"\n\n' : ""
  const text = (key, fallback) => (app.i18n ? `{t("${key}")}` : fallback)

  return `${head}export const About = {
  render() {
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
  const annotation = app.isTypeScript ? ": MessageType" : ""

  const span = app.i18n
    ? `      <span onClick={() => api.notify(\`#\${entity.id}:click\`)}>
        ${greeting}
      </span>`
    : `      <span onClick={() => api.notify(\`#\${entity.id}:click\`)}>${greeting}</span>`

  const head = imports.length ? `${importBlock(imports)}\n\n` : ""

  return `${head}export const Message${annotation} = {
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

// The comment line before a capitalized tag in .tsx: `{/* */}` among JSX
// children, `//` inside code.
function expectError(app, indent, isChild = true) {
  if (!app.isTypeScript) return ""
  const comment = isChild ? `{/* ${EXPECT_ERROR} */}` : `// ${EXPECT_ERROR}`
  return `${indent}${comment}\n`
}

// A callback's parameter. The components' props are not typed in .tsx, so
// TypeScript cannot infer it.
function typed(app, name, type) {
  return app.isTypeScript ? `${name}: ${type}` : name
}

// A page's label: translated, or the English text.
function labelText(app, page) {
  return app.i18n ? `{t("${page.key}")}` : page.text
}

function labelValue(app, page) {
  return app.i18n ? `t("${page.key}")` : `"${page.text}"`
}

function uiShell(app, { pages, content }) {
  const nav = []
  if (app.links) {
    nav.push(
      ...pages.map(
        (page) =>
          `${expectError(app, "                ")}                <Link href="${page.path}">${labelText(app, page)}</Link>`,
      ),
    )
  }
  if (app.i18n) {
    nav.push(`${expectError(app, "                ")}                <Select
                  value={i18n.locale}
                  options={i18n.languages}
                  size="sm"
                  ariaLabel={t("language")}
                  onChange={(${typed(app, "locale", "string")}) =>
                    api.notify("#i18n:localeChange", locale)
                  }
                />`)
  }

  const appBar = nav.length
    ? `${expectError(app, "          ")}          <AppBar
            title="${app.projectName}"
            trailing={
              <nav className="app-nav">
${nav.join("\n")}
              </nav>
            }
          />`
    : `${expectError(app, "          ")}          <AppBar title="${app.projectName}" />`

  const header = `        <header${app.mobile ? ' className="pt-safe"' : ""}>
${appBar}
        </header>
        <main>
${expectError(app, "          ")}          <Container maxWidth="md">{${content}}</Container>
        </main>`

  if (!app.tabs) return header

  const actions = pages.map((page) => {
    const icon = page.icon
      ? `
${expectError(app, "                ", false)}                icon: <Icon icon={${page.icon.name}} size="lg" />,`
      : ""
    return `              {
                value: "${page.path}",
                label: ${labelValue(app, page)},${icon}
              },`
  })

  return `${header}
        <footer className="pb-safe">
${expectError(app, "          ")}          <BottomNavigation
            value={router.path}
            actions={[
${actions.join("\n")}
            ]}
            onChange={(${typed(app, "path", "string")}) => api.notify("#router:navigate", path)}
          />
        </footer>`
}

function plainShell(app, { pages, content }) {
  const nav = app.routing
    ? pages.map(
        (page) =>
          `            <a href="${page.path}">${labelText(app, page)}</a>`,
      )
    : []
  if (app.i18n) {
    nav.push(`            <select
              aria-label={t("language")}
              onChange={${selectChange(app, "              ")}
              }
            >
              {i18n.languages${app.isTypeScript ? "?." : "."}map((language) => (
                <option
                  key={language.value}
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
          <nav className="app-nav">
${nav.join("\n")}
          </nav>`
    : ""

  return `        <header>
          <strong>${app.projectName}</strong>${navBlock}
        </header>
        <main>{${content}}</main>`
}
