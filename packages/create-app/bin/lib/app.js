import fs from "fs"
import { EOL } from "os"
import path from "path"

import { INDENTATION } from "./constants.js"
import { ICON_PACKS, LANGUAGES } from "./features.js"
import { importBlock } from "./imports.js"

// Prettier's line width, which generated files are written to fit.
const LINE_WIDTH = 80

/**
 * Writes the source of a lit-html app with the features chosen: Inglorious UI,
 * routing, page transitions, icon packs, internationalization and a mobile
 * layout. It replaces the template's hello world, keeping its message type as
 * the example on the home page. The files come out as Prettier and the
 * template's ESLint config would leave them.
 *
 * @param {string} targetDir
 * @param {object} pkg - The package.json being built; dependencies are added.
 * @param {object} options
 * @param {string} options.projectName
 * @param {boolean} options.isTypeScript
 * @param {boolean} options.ui
 * @param {string} options.theme - A key of THEMES.
 * @param {boolean} options.mobile
 * @param {boolean} options.routing
 * @param {boolean} options.transitions
 * @param {string[]} options.icons - Keys of ICON_PACKS.
 * @param {string[]} options.languages - Keys of LANGUAGES, the default first.
 */
export function addAppFeatures(targetDir, pkg, options) {
  const app = { ...options, ext: options.isTypeScript ? "ts" : "js" }
  app.i18n = Boolean(app.languages.length)
  // On a phone the pages are tabs at the bottom; elsewhere, links on top.
  app.tabs = app.ui && app.routing && app.mobile
  app.links = app.routing && !app.tabs

  addDependencies(pkg, app)

  const files = {
    [`src/main.${app.ext}`]: mainSource(app),
    [`src/app.${app.ext}`]: appSource(app),
    "src/app.css": appStyles(app),
    [`src/pages/home.${app.ext}`]: homeSource(app),
    [`src/types/message.${app.ext}`]: messageSource(app),
    [`src/store/index.${app.ext}`]: storeSource(app),
    [`src/store/entities.${app.ext}`]: entitiesSource(app),
  }
  if (app.routing) {
    files[`src/pages/about.${app.ext}`] = aboutSource(app)
    files[`src/store/routes.${app.ext}`] = routesSource(app)
  }
  if (app.i18n) {
    files[`src/i18n/index.${app.ext}`] = i18nSource(app)
    for (const language of app.languages) {
      files[`src/i18n/locales/${language}.json`] =
        JSON.stringify(LANGUAGES[language].texts, null, INDENTATION) + EOL
    }
  }
  if (app.isTypeScript) {
    files["types/index.d.ts"] = typesSource(app)
  }

  for (const [file, source] of Object.entries(files)) {
    const filePath = path.join(targetDir, file)
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, source)
  }

  if (app.ui) applyTheme(targetDir, app)
}

function addDependencies(pkg, app) {
  pkg.dependencies ??= {}
  if (app.ui) pkg.dependencies["@inglorious/ui"] = "workspace:*"
  if (app.i18n) pkg.dependencies["@inglorious/i18n"] = "workspace:*"
  for (const key of app.icons) {
    Object.assign(pkg.dependencies, ICON_PACKS[key].packages)
  }
}

// The theme is a class on <body>, which the theme's stylesheet is scoped to.
function applyTheme(targetDir, app) {
  const htmlPath = path.join(targetDir, "index.html")
  if (!fs.existsSync(htmlPath)) return
  const page = fs.readFileSync(htmlPath, "utf-8")
  fs.writeFileSync(
    htmlPath,
    page.replace("<body>", `<body class="iw-theme-${app.theme}">`),
  )
}

// ---------------------------------------------------------------- main

function mainSource(app) {
  const imports = []
  if (app.ui) {
    imports.push(
      'import "@inglorious/ui/base.css"',
      `import "@inglorious/ui/themes/${app.theme}.css"`,
      ...uiComponents(app).map((name) => `import "@inglorious/ui/${name}.css"`),
    )
    if (app.transitions) {
      imports.push('import "@inglorious/ui/view-transitions.css"')
    }
  }
  imports.push('import "./app.css"')
  if (app.transitions) {
    imports.push(
      'import { withTransitions } from "@inglorious/ui/view-transitions"',
    )
  }
  imports.push(
    'import { mount } from "@inglorious/web"',
    'import { App } from "./app"',
    'import { store } from "./store"',
  )
  if (app.i18n) imports.push('import { ready } from "./i18n"')

  const args = [
    app.transitions ? "withTransitions(store)" : "store",
    "(api) => App.render(null, api)",
    app.isTypeScript
      ? 'document.getElementById("root")!'
      : 'document.getElementById("root")',
  ]

  const body = app.i18n
    ? `// Mounts once the starting language has loaded, so the first render is
// already translated.
ready.then(() =>
${call("mount", args, "  ", ",")}
)`
    : call("mount", args, "", "")

  return `${importBlock(imports)}

${body}
`
}

// `name(args)` on one line when it fits, one argument per line otherwise, as
// Prettier prints a call.
function call(name, args, indent, trailing) {
  const line = `${indent}${name}(${args.join(", ")})${trailing}`
  if (line.length <= LINE_WIDTH) return line
  return `${indent}${name}(
${args.map((arg) => `${indent}  ${arg},`).join("\n")}
${indent})${trailing}`
}

// The Inglorious UI components the app uses, for their stylesheets.
function uiComponents(app) {
  const names = ["app-bar", "container"]
  if (app.links) names.push("link")
  if (app.tabs) names.push("bottom-navigation")
  if (app.icons.length) names.push("icon")
  if (app.i18n) names.push("select")
  return names
}

// ---------------------------------------------------------------- app

function appSource(app) {
  const [navPack] = app.icons
  const navIcons = app.tabs && navPack ? ICON_PACKS[navPack].nav : null

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
  const pages = [
    { path: "/", key: "nav.home", text: "Home", icon: navIcons?.home },
    { path: "/about", key: "nav.about", text: "About", icon: navIcons?.about },
  ]

  const signature = app.isTypeScript
    ? "render(props: Record<string, unknown> | null, api: AppApi)"
    : "render(props, api)"

  // The app's own entities are always there; TypeScript cannot know that.
  const always = app.isTypeScript ? "!" : ""
  const locals = []
  if (app.routing) {
    locals.push(`    const router = api.getEntity("router")${always}`)
  }
  if (app.i18n) locals.push(`    const i18n = api.getEntity("i18n")${always}`)

  const content = app.routing
    ? "api.render(router.route)"
    : 'api.render("home")'

  const template = app.ui
    ? uiShell(app, { label, pages, content })
    : plainShell(app, { label, pages, content })

  return `${importBlock(imports)}

export const App = {
  ${signature} {
${locals.join("\n")}${locals.length ? "\n\n" : ""}    return html\`
${template}
    \`
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
          `Link.render({ href: "${page.path}", children: ${label(page.key, page.text)} })`,
      ),
    )
  }
  if (app.i18n) nav.push(languageSelect())

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

function languageSelect() {
  return `Select.render({
                value: i18n.locale,
                options: i18n.languages,
                size: "sm",
                "aria-label": t("language"),
                onChange: (locale) => api.notify("#i18n:localeChange", locale),
              })`
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
            @change=\${(event) =>
              api.notify("#i18n:localeChange", event.target.value)}
          >
            \${i18n.languages.map(
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

function appStyles(app) {
  const layout = `body {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

#root {
  flex: 1;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
  padding-block: 1.5rem;
}

.app-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}
`
  if (app.ui) return layout
  return `${layout}
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-block-end: 1px solid #ddd;
}

main {
  padding-inline: 1.5rem;
}
`
}

// ---------------------------------------------------------------- pages

function homeSource(app) {
  const showcase = app.icons.map((key) => ICON_PACKS[key].showcase)
  const imports = ['import { html } from "@inglorious/web"']
  for (const icon of showcase) {
    imports.push(`import ${icon.name} from "${icon.from}"`)
  }
  if (showcase.length)
    imports.push('import { Icon } from "@inglorious/ui/icon"')
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

function aboutSource(app) {
  const imports = ['import { html } from "@inglorious/web"']
  if (app.isTypeScript) {
    imports.push('import type { AboutEntity } from "../../types"')
  }
  if (app.i18n) imports.push('import { t } from "../i18n"')
  const text = (key, fallback) => (app.i18n ? `\${t("${key}")}` : fallback)
  const signature = app.isTypeScript
    ? "render(entity: AboutEntity)"
    : "render()"

  return `${importBlock(imports)}

export const About = {
  ${signature} {
    return html\`
      <h1>${text("about.title", "About")}</h1>
      <p>${text("about.body", "A page of its own, at its own address.")}</p>
    \`
  },
}
`
}

function messageSource(app) {
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

// ---------------------------------------------------------------- store

function storeSource(app) {
  const imports = [
    app.isTypeScript
      ? 'import { createStore, type TypesConfig } from "@inglorious/store"'
      : 'import { createStore } from "@inglorious/store"',
    'import { Home } from "../pages/home"',
    'import { Message } from "../types/message"',
    'import { entities } from "./entities"',
    'import { middlewares } from "./middlewares"',
  ]
  if (app.routing) {
    imports.push(
      'import { Router, setRoutes } from "@inglorious/web/router"',
      'import { About } from "../pages/about"',
      'import { routes } from "./routes"',
    )
  }
  if (app.isTypeScript) {
    imports.push('import type { AppEntity, AppState } from "../../types"')
  }
  if (app.i18n) imports.push('import { I18n } from "../i18n"')

  const types = ["Message", "Home"]
  if (app.routing) types.push("About", "Router")
  if (app.i18n) types.push("I18n")
  const cast = app.isTypeScript ? " as unknown as TypesConfig<AppEntity>" : ""
  const oneLine = `  types: { ${types.join(", ")} }${cast},`
  const typesValue =
    oneLine.length <= LINE_WIDTH
      ? oneLine
      : `  types: {
${types.map((type) => `    ${type},`).join("\n")}
  }${cast},`
  const generics = app.isTypeScript ? "<AppEntity, AppState>" : ""

  return `${importBlock(imports)}
${app.routing ? "\nsetRoutes(routes)\n" : ""}
export const store = createStore${generics}({
${typesValue}
  entities,
  middlewares,
})
`
}

function entitiesSource(app) {
  const entries = []
  if (app.routing) entries.push('  router: { type: "Router" },')
  if (app.i18n) entries.push('  i18n: { type: "I18n" },')
  entries.push('  home: { type: "Home" },')
  if (app.routing) entries.push('  about: { type: "About" },')
  entries.push(
    '  message1: { type: "Message", who: "world" },',
    '  message2: { type: "Message", who: "wide" },',
    '  message3: { type: "Message", who: "web" },',
  )
  const head = app.isTypeScript
    ? `import type { AppState } from "../../types"

export const entities: AppState = {`
    : "export const entities = {"
  return `${head}
${entries.join("\n")}
}
`
}

function routesSource(app) {
  const head = app.isTypeScript
    ? `import type { RoutesConfig } from "@inglorious/web/router"

// Each path names the entity its page renders.
export const routes: RoutesConfig = {`
    : `// Each path names the entity its page renders.
export const routes = {`
  return `${head}
  "/": "home",
  "/about": "about",
}
`
}

// ---------------------------------------------------------------- i18n

function i18nSource(app) {
  const [defaultLocale] = app.languages
  return `import { createI18n } from "@inglorious/i18n"

// One catalogue per language in ./locales, loaded when it is needed. Adding a
// language is adding its file.
export const { I18n, t, ready } = createI18n({
  catalogues: import.meta.glob("./locales/*.json"),
  defaultLocale: "${defaultLocale}",
  storageKey: "${app.projectName}-locale",
})
`
}

// ---------------------------------------------------------------- types

function typesSource(app) {
  const imports = [
    'import "./vite-end"',
    'import type { BaseEntity, EntitiesState } from "@inglorious/store"',
    'import type { Api, TemplateResult } from "@inglorious/web"',
  ]
  const entities = ["MessageEntity", "HomeEntity"]
  const declarations = [
    `export interface MessageEntity extends BaseEntity {
  type: "Message"
  id?: string
  who: string
  isUpperCase?: boolean
}`,
    `export interface HomeEntity extends BaseEntity {
  type: "Home"
}`,
  ]
  const state = [
    "  home: HomeEntity",
    "  message1: MessageEntity",
    "  message2: MessageEntity",
    "  message3: MessageEntity",
  ]

  if (app.routing) {
    imports.push('import type { RouterEntity } from "@inglorious/web/router"')
    entities.push("AboutEntity", "AppRouterEntity")
    declarations.push(
      `export interface AboutEntity extends BaseEntity {
  type: "About"
}`,
      `export interface AppRouterEntity extends BaseEntity, Omit<RouterEntity, "id"> {
  type: "Router"
}`,
    )
    state.unshift("  router: AppRouterEntity")
    state.push("  about: AboutEntity")
  }
  if (app.i18n) {
    imports.push('import type { I18nEntity } from "@inglorious/i18n"')
    entities.push("AppI18nEntity")
    declarations.push(
      `export interface AppI18nEntity extends BaseEntity, Omit<I18nEntity, "id"> {
  type: "I18n"
}`,
    )
    state.unshift("  i18n: AppI18nEntity")
  }

  return `${importBlock(imports)}

${declarations.join("\n\n")}

// Union type of all entities
${union("AppEntity", entities)}

// State type with known entity IDs
export interface AppState extends EntitiesState<AppEntity> {
${state.join("\n")}
}

export type AppApi = Api<AppEntity, AppState>

export interface MessageType {
  click: (entity: MessageEntity) => void
  render: (entity: MessageEntity, api: AppApi) => TemplateResult | null
}
`
}

// `export type Name = A | B`, broken after the `=` when too long, as Prettier
// prints it.
function union(name, members) {
  const line = `export type ${name} = ${members.join(" | ")}`
  if (line.length <= LINE_WIDTH) return line
  return `export type ${name} =
  ${members.join(" | ")}`
}
