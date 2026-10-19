import fs from "fs"
import { EOL } from "os"
import path from "path"

import * as jsxComponents from "./app-jsx.js"
import * as litComponents from "./app-lit.js"
import * as vueComponents from "./app-vue.js"
import { INDENTATION } from "./constants.js"
import { ICON_PACKS, LANGUAGES } from "./features.js"
import { importBlock } from "./imports.js"
import { appModel, call, LINE_WIDTH, union } from "./source.js"

const COMPONENTS = {
  "lit-html": litComponents,
  jsx: jsxComponents,
  vue: vueComponents,
}

/**
 * Writes the source of an app with the features chosen: Inglorious UI,
 * routing, page transitions, icon packs, internationalization and a mobile
 * layout, in lit-html, JSX or Vue. It replaces the template's hello world,
 * keeping its message type as the example on the home page. The files come
 * out as Prettier and the template's ESLint config would leave them.
 *
 * @param {string} targetDir
 * @param {object} pkg - The package.json being built; dependencies are added.
 * @param {object} options
 * @param {string} options.projectName
 * @param {boolean} options.isTypeScript
 * @param {"lit-html" | "jsx" | "vue"} options.renderer
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
  app.isVue = app.renderer === "vue"

  const components = COMPONENTS[app.renderer]
  const componentExt = components.extension(app)
  const model = appModel(app)

  addDependencies(pkg, app)

  const files = {
    [`src/main.${app.ext}`]: mainSource(app),
    [`src/app.${componentExt}`]: components.appSource(app, model),
    "src/app.css": appStyles(app),
    [`src/pages/home.${componentExt}`]: components.homeSource(app, model),
    [`src/types/message.${componentExt}`]: components.messageSource(app),
    [`src/store/index.${app.ext}`]: storeSource(app),
    [`src/store/entities.${app.ext}`]: entitiesSource(app),
  }
  if (app.routing) {
    files[`src/pages/about.${componentExt}`] = components.aboutSource(app)
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

// An import of one of the app's components: Vue's name their file, and
// TypeScript cannot read .vue files, so it is told to expect that.
function componentImport(app, names, from) {
  if (!app.isVue) return `import { ${names} } from "${from}"`
  const line = `import { ${names} } from "${from}.vue"`
  return app.isTypeScript
    ? `// @ts-expect-error - Handled by @inglorious/vite-plugin-vue\n${line}`
    : line
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
    componentImport(app, "App", "./app"),
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

// The Inglorious UI components the app uses, for their stylesheets.
function uiComponents(app) {
  const names = ["app-bar", "container"]
  if (app.links) names.push("link")
  if (app.tabs) names.push("bottom-navigation")
  if (app.icons.length) names.push("icon")
  if (app.i18n) names.push("select")
  return names
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
  if (app.ui) {
    // In Vue the navigation is the app bar's content rather than its trailing
    // slot, so it pushes itself to the end.
    return app.isVue
      ? `${layout}
.iw-app-bar .app-nav {
  margin-inline-start: auto;
}
`
      : layout
  }
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

// ---------------------------------------------------------------- store

function storeSource(app) {
  const imports = [
    'import { createStore } from "@inglorious/store"',
    componentImport(app, "Home", "../pages/home"),
    componentImport(app, "Message", "../types/message"),
    'import { entities } from "./entities"',
    'import { middlewares } from "./middlewares"',
  ]
  if (app.routing) {
    imports.push(
      'import { Router, setRoutes } from "@inglorious/web/router"',
      componentImport(app, "About", "../pages/about"),
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
  const oneLine = `  types: { ${types.join(", ")} },`
  const typesValue =
    oneLine.length <= LINE_WIDTH
      ? oneLine
      : `  types: {
${types.map((type) => `    ${type},`).join("\n")}
  },`
  const generics = app.isTypeScript ? "<AppEntity, AppState>" : ""

  return `${importBlock(imports)}
${app.routing ? "\nsetRoutes(routes)\n" : ""}
export const store = createStore${generics}({
${typesValue}
  entities,
  middlewares,
  // Creates an entity for each type that has none: ${singletons(app).join(", ")}.
  autoCreateEntities: true,
})
`
}

// The entities the store creates on its own, as the comment in the store
// lists them.
function singletons(app) {
  const ids = ["home"]
  if (app.routing) ids.push("about", "router")
  if (app.i18n) ids.push("i18n")
  return ids
}

// Only the entities that need data, or come more than one to a type; the
// store creates the rest.
function entitiesSource(app) {
  const head = app.isTypeScript
    ? `import type { AppState } from "../../types"

export const entities: Partial<AppState> = {`
    : "export const entities = {"
  return `${head}
  message1: { type: "Message", who: "world" },
  message2: { type: "Message", who: "wide" },
  message3: { type: "Message", who: "web" },
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
    'import type {\n  BaseEntity,\n  EntitiesState,\n  EntityType,\n} from "@inglorious/store"',
    'import type { Api, TemplateResult } from "@inglorious/web"',
  ]
  const entities = ["MessageEntity", "HomeEntity"]
  const declarations = [
    `export interface MessageEntity extends BaseEntity {
  type: "Message"
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
      `export interface AppRouterEntity extends RouterEntity {
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
      `export interface AppI18nEntity extends I18nEntity {
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

// Each type's events and their payloads. Declare types with \`type\`, not
// \`interface\`: an interface does not fit the store's \`types\`.
export type MessageType = {
  click: (entity: MessageEntity) => void
  render: (entity: MessageEntity, api: AppApi) => TemplateResult
}
${
  app.renderer === "lit-html"
    ? `
export type HomeType = {
  render: (entity: HomeEntity, api: AppApi) => TemplateResult
}
`
    : ""
}
// A shorthand for a type: \`{ ... } satisfies AppType<MessageEntity>\` infers
// its handlers' parameters, but neither lists its events nor types payloads.
export type AppType<TEntity extends AppEntity> = EntityType<TEntity, AppApi>
`
}
