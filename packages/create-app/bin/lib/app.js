import fs from "fs"
import { EOL } from "os"
import path from "path"

import * as jsxComponents from "./app-jsx.js"
import * as litComponents from "./app-lit.js"
import * as vueComponents from "./app-vue.js"
import { authCatalogue, authFiles } from "./auth.js"
import {
  CAPACITOR_APP_VERSION,
  CAPACITOR_FIREBASE_VERSION,
  CAPACITOR_VERSION,
  CAPAWESOME_LIVE_UPDATE_VERSION,
  FIREBASE_VERSION,
  INDENTATION,
  SUPABASE_VERSION,
} from "./constants.js"
import {
  ICON_PACKS,
  LANGUAGES,
  NATIVE_UPDATE_TEXTS,
  PROMPT_TEXTS,
} from "./features.js"
import { importBlock } from "./imports.js"
import { nativeUpdateFiles } from "./native-update.js"
import { envExample, promptFiles, supabaseSource } from "./prompts.js"
import {
  appModel,
  call,
  layout,
  LINE_WIDTH,
  relative,
  union,
} from "./source.js"

const COMPONENTS = {
  "lit-html": litComponents,
  jsx: jsxComponents,
  vue: vueComponents,
}

/**
 * Writes the source of an app with the features chosen: Inglorious UI,
 * routing, page transitions, icon packs, internationalization, a mobile
 * layout, analytics and push prompts, and the page that blocks outdated native
 * builds, in lit-html, JSX or Vue. It replaces the template's hello world,
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
 * @param {boolean} options.analytics
 * @param {boolean} options.auth
 * @param {string[]} options.authMethods - Keys of AUTH_METHODS.
 * @param {boolean} options.push
 */
export function addAppFeatures(targetDir, pkg, options) {
  const app = { ...options, ext: options.isTypeScript ? "ts" : "js" }
  app.i18n = Boolean(app.languages.length)
  app.tabs = app.ui && app.routing && app.mobile
  app.links = app.routing && !app.tabs
  app.isVue = app.renderer === "vue"
  app.hasPrompts = app.analytics || app.push
  app.nativeUpdate = app.mobile && app.push
  app.hasSupabase = app.push || app.auth
  app.gate = app.nativeUpdate || app.auth
  app.appLinks = app.mobile && app.routing
  app.backButton = app.mobile && app.routing
  app.layout = layout(app)

  const components = COMPONENTS[app.renderer]
  const componentExt = components.extension(app)
  const model = appModel(app)

  addDependencies(pkg, app)

  const { layout: at } = app
  const files = {
    [`src/main.${app.ext}`]: mainSource(app, model),
    [`${at.app}/index.${componentExt}`]: components.appSource(app, model),
    [`${at.app}/style.css`]: appStyles(app),
    [`${at.home}/index.${componentExt}`]: components.homeSource(app, model),
    [`${at.message}/index.${componentExt}`]: components.messageSource(app),
    [`src/store/index.${app.ext}`]: storeSource(app),
    [`src/store/entities.${app.ext}`]: entitiesSource(app),
  }
  if (app.routing) {
    files[`${at.about}/index.${componentExt}`] = components.aboutSource(app)
    files[`src/store/routes.${app.ext}`] = routesSource(app)
  }
  if (app.i18n) {
    files[`src/i18n/index.${app.ext}`] = i18nSource(app)
    for (const language of app.languages) {
      files[`src/i18n/locales/${language}.json`] =
        JSON.stringify(catalogue(app, language), null, INDENTATION) + EOL
    }
  }
  if (app.hasPrompts) Object.assign(files, promptFiles(app))
  if (app.auth) Object.assign(files, authFiles(app))
  if (app.hasSupabase) files[`src/api/supabase.${app.ext}`] = supabaseSource()
  if (app.hasPrompts || app.auth) files[".env.example"] = envExample(app)
  if (app.nativeUpdate) Object.assign(files, nativeUpdateFiles(app))
  if (app.isTypeScript) {
    files["types/index.d.ts"] = typesSource(app)
  }

  // The template's hello world keeps its messages in the shell; here they move
  // to the home screen that renders them.
  removeTemplateMessages(targetDir, app)

  for (const [file, source] of Object.entries(files)) {
    const filePath = path.join(targetDir, file)
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, source)
  }

  if (app.ui) applyTheme(targetDir, app)
}

function removeTemplateMessages(targetDir, app) {
  const templateMessages = "src/app/message"
  if (app.layout.message === templateMessages) return
  fs.rmSync(path.join(targetDir, templateMessages), {
    recursive: true,
    force: true,
  })
}

function addDependencies(pkg, app) {
  pkg.dependencies ??= {}
  if (app.ui) pkg.dependencies["@inglorious/ui"] = "workspace:*"
  if (app.i18n) pkg.dependencies["@inglorious/i18n"] = "workspace:*"
  for (const key of app.icons) {
    Object.assign(pkg.dependencies, ICON_PACKS[key].packages)
  }
  if (app.hasPrompts) {
    pkg.dependencies["@inglorious/firebase"] = "workspace:*"
    pkg.dependencies["@capacitor/core"] = CAPACITOR_VERSION
    pkg.dependencies.firebase = FIREBASE_VERSION
  }
  if (app.analytics) {
    pkg.dependencies["@capacitor-firebase/analytics"] =
      CAPACITOR_FIREBASE_VERSION
  }
  if (app.push) {
    pkg.dependencies["@capacitor-firebase/messaging"] =
      CAPACITOR_FIREBASE_VERSION
  }
  if (app.hasSupabase) {
    pkg.dependencies["@supabase/supabase-js"] = SUPABASE_VERSION
  }
  if (app.auth) pkg.dependencies["@inglorious/supabase"] = "workspace:*"
  if (app.nativeUpdate || app.appLinks || app.backButton) {
    pkg.dependencies["@capacitor/app"] = CAPACITOR_APP_VERSION
  }
  if (app.nativeUpdate) {
    pkg.dependencies["@inglorious/supabase"] = "workspace:*"
    pkg.dependencies["@capawesome/capacitor-live-update"] =
      CAPAWESOME_LIVE_UPDATE_VERSION
  }
}

function catalogue(app, language) {
  const { analytics, push } = PROMPT_TEXTS[language]
  return {
    ...LANGUAGES[language].texts,
    ...(app.analytics && { analytics }),
    ...(app.push && { push }),
    ...(app.nativeUpdate && { nativeUpdate: NATIVE_UPDATE_TEXTS[language] }),
    ...(app.auth && { auth: authCatalogue(language) }),
  }
}

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
/** Imports a component from its folder: its index, which a .vue file names. */
function componentImport(app, names, from) {
  if (!app.isVue) return `import { ${names} } from "${from}"`
  const line = `import { ${names} } from "${from}/index.vue"`
  return app.isTypeScript
    ? `// @ts-expect-error - Handled by @inglorious/vite-plugin-vue\n${line}`
    : line
}

function mainSource(app, { pages }) {
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
  imports.push(`import "${relative("src", app.layout.app)}/style.css"`)
  imports.push(
    `import { ${app.hasPrompts || app.ui || app.gate ? "html, mount" : "mount"} } from "@inglorious/web"`,
    componentImport(app, "App", relative("src", app.layout.app)),
    'import { store } from "./store"',
  )
  if (app.i18n) imports.push('import { ready } from "./i18n"')
  if (app.push) imports.push('import { supabase } from "./api/supabase"')
  if (app.auth) {
    imports.push(
      'import { authAdapter } from "./api/auth"',
      'import { watchAuth } from "@inglorious/web/auth"',
    )
  }
  if (app.hasPrompts) {
    imports.push('import { renderPrompts } from "./common/prompt"')
  }
  if (app.nativeUpdate || app.appLinks || app.backButton) {
    imports.push('import { App as NativeApp } from "@capacitor/app"')
  }
  if (app.mobile) {
    imports.push(
      'import { SystemBars } from "@capacitor/core"',
      'import { Haptics } from "@capacitor/haptics"',
      'import { haptics } from "@inglorious/web/haptics"',
      'import { watchSystemBars } from "@inglorious/web/system-bars"',
    )
  }
  if (app.ui || app.mobile) {
    imports.push('import { watchKeyboard } from "@inglorious/web/keyboard"')
  }
  if (app.appLinks) {
    imports.push('import { watchAppLinks } from "@inglorious/web/app-links"')
  }
  if (app.backButton) {
    imports.push(
      'import { watchBackButton } from "@inglorious/web/back-button"',
    )
  }
  if (app.nativeUpdate) {
    imports.push(
      'import { LiveUpdate } from "@capawesome/capacitor-live-update"',
      'import { liveUpdateManifestUrl } from "@inglorious/supabase"',
      'import { watchLiveUpdate } from "@inglorious/web/live-update"',
      'import { watchNativeUpdate } from "@inglorious/web/native-update"',
    )
  }
  if (app.gate && app.isTypeScript) {
    imports.push('import type { AppApi } from "../types"')
  }

  const args = [
    "store",
    app.gate
      ? "renderApp"
      : app.hasPrompts || app.ui
        ? `(api) => html\`${appParts(app)}\``
        : "(api) => App.render(null, api)",
    app.isTypeScript
      ? 'document.getElementById("root")!'
      : 'document.getElementById("root")',
  ]

  const body = app.i18n
    ? `// Mounts once the starting language has loaded, so the first render is
// already translated.
${afterReady(args)}`
    : call("mount", args, "", "")

  const session = app.push
    ? `

supabase.auth.onAuthStateChange((_event, session) => {
  store.notify(session ? "#pushPrompt:pushStart" : "#pushPrompt:pushStop")
})`
    : ""

  const auth = app.auth
    ? `

watchAuth(authAdapter, store)`
    : ""

  const keyboard =
    app.ui || app.mobile
      ? `

watchKeyboard()`
      : ""

  const systemBars = app.mobile
    ? `

watchSystemBars(SystemBars)
haptics.use(Haptics)`
    : ""

  const appLinks = app.appLinks
    ? `

watchAppLinks(NativeApp, store)`
    : ""

  const rootPaths = pages.map((page) => `"${page.path}"`).join(", ")
  const backButton = app.backButton
    ? `

// Back from a top-level page closes the app, as on other Android apps.
watchBackButton(NativeApp, { rootPaths: [${rootPaths}] })`
    : ""

  const nativeUpdate = app.nativeUpdate
    ? `

watchNativeUpdate(NativeApp, store)

// Only release builds are stamped: a development build stays as it is.
const release = Number(import.meta.env.VITE_LIVE_UPDATE_RELEASE)
if (release) {
  watchLiveUpdate({
    plugin: LiveUpdate,
    app: NativeApp,
    manifestUrl: liveUpdateManifestUrl(import.meta.env.VITE_SUPABASE_URL),
    release,
  })
}
`
    : ""

  return `${importBlock(imports)}

${body}${session}${auth}${keyboard}${systemBars}${appLinks}${backButton}${nativeUpdate}${app.gate ? renderAppSource(app) : ""}
`
}

function renderAppSource(app) {
  const always = app.isTypeScript ? "!" : ""
  const update = app.nativeUpdate
    ? `
  // An outdated native build shows nothing but the update page.
  if (api.getEntity("nativeUpdate")${always}.isUpdateRequired) {
    return api.render("nativeUpdate")
  }`
    : ""
  const page = app.auth
    ? `
  // Nothing until the saved session is read, then the sign-in screen until
  // someone signs in.
  const auth = api.getEntity("auth")${always}
  if (!auth.isReady) return html\`\`
  const page = auth.user ? App.render(null, api) : api.render("auth")`
    : `
  const page = App.render(null, api)`
  return `

function renderApp(api${app.isTypeScript ? ": AppApi" : ""}) {${update}${page}
  return html\`${appParts(app, "${page}")}\`
}`
}

// What renders beside the app: the consent and permission prompts, and the
// toast stack.
function appParts(app, main = "${App.render(null, api)}") {
  const parts = [main]
  if (app.hasPrompts) parts.push("${renderPrompts(api)}")
  if (app.ui) parts.push('${api.render("toast")}')
  return parts.join(" ")
}

function afterReady(args) {
  const oneLine = `ready.then(() => ${call("mount", args, "", "")})`
  if (!oneLine.includes("\n") && oneLine.length <= LINE_WIDTH) return oneLine
  return `ready.then(() =>
${call("mount", args, "  ", ",")}
)`
}

function uiComponents(app) {
  const names = ["app-bar", "container"]
  if (app.links) names.push("link")
  if (app.tabs) names.push("bottom-navigation")
  if (app.icons.length) names.push("icon")
  if (app.i18n) names.push("select")
  if (app.hasPrompts) names.push("snackbar", "button", "flex")
  if (app.auth) {
    names.push("input", "button", "alert", "dialog", "confirm-dialog")
  }
  names.push("toast")
  return [...new Set(names)]
}

const PROMPT_ABOVE_TABS = `
body {
  --iw-snackbar-offset-bottom: 5rem;
}
`

const UPDATE_PAGE = `
.app-update {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.5rem;
  text-align: center;
}
`

const AUTH_SCREEN = `
.app-auth {
  width: min(100% - 3rem, 24rem);
  margin: 3rem auto;
}

.app-auth form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.app-profile {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
}

.app-account {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}
`

const PLAIN_AUTH = `
.app-auth label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.app-auth-error {
  color: #b00020;
}
`

const PLAIN_PROMPT = `
.app-prompt {
  position: fixed;
  inset-block-end: 1rem;
  inset-inline: 1rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  background: #fff;
}

.app-prompt p {
  flex: 1 1 100%;
  margin: 0;
}
`

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
${app.tabs && app.hasPrompts ? PROMPT_ABOVE_TABS : ""}${app.nativeUpdate ? UPDATE_PAGE : ""}${app.auth ? AUTH_SCREEN : ""}`
  if (app.ui) {
    return app.isVue
      ? `${layout}
.iw-app-bar .app-nav {
  margin-inline-start: auto;
}
`
      : layout
  }
  return `${layout}${app.hasPrompts ? PLAIN_PROMPT : ""}${app.auth ? PLAIN_AUTH : ""}
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

function storeSource(app) {
  const imports = [
    'import { createStore } from "@inglorious/store"',
    componentImport(app, "Home", relative("src/store", app.layout.home)),
    componentImport(app, "Message", relative("src/store", app.layout.message)),
    'import { entities } from "./entities"',
    'import { middlewares } from "./middlewares"',
  ]
  if (app.transitions) {
    imports.push(
      'import { withTransitions } from "@inglorious/ui/view-transitions"',
    )
  }
  if (app.routing) {
    imports.push(
      'import { Router, setRoutes } from "@inglorious/web/router"',
      componentImport(app, "About", relative("src/store", app.layout.about)),
      'import { routes } from "./routes"',
    )
  }
  if (app.isTypeScript) {
    imports.push(
      'import type { AppEntity, AppEvents, AppState } from "../../types"',
    )
  }
  if (app.i18n) imports.push('import { I18n } from "../i18n"')
  if (app.analytics) {
    imports.push(
      `import { Analytics } from "${relative("src/store", app.layout.analytics)}"`,
    )
  }
  if (app.push) {
    imports.push(
      `import { PushPrompt } from "${relative("src/store", app.layout.pushPrompt)}"`,
    )
  }
  if (app.nativeUpdate) {
    imports.push(
      `import { NativeUpdate } from "${relative("src/store", app.layout.nativeUpdate)}"`,
    )
  }
  if (app.auth) {
    imports.push(
      `import { Auth } from "${relative("src/store", app.layout.auth)}"`,
    )
  }
  if (app.ui) imports.push('import { Toast } from "@inglorious/ui/toast"')

  const types = ["Message", "Home"]
  if (app.routing) types.push("About", "Router")
  if (app.i18n) types.push("I18n")
  if (app.analytics) types.push("Analytics")
  if (app.push) types.push("PushPrompt")
  if (app.nativeUpdate) types.push("NativeUpdate")
  if (app.auth) types.push("Auth")
  if (app.ui) types.push("Toast")
  const oneLine = `  types: { ${types.join(", ")} },`
  const typesValue =
    oneLine.length <= LINE_WIDTH
      ? oneLine
      : `  types: {
${types.map((type) => `    ${type},`).join("\n")}
  },`
  const generics = app.isTypeScript ? "<AppEntity, AppState, AppEvents>" : ""

  return `${importBlock(imports)}
${app.routing ? "\nsetRoutes(routes)\n" : ""}
export const store = createStore${generics}({
${typesValue}
  entities,
  middlewares: ${app.transitions ? "[withTransitions(), ...middlewares]" : "middlewares"},
  // Creates an entity for each type that has none: ${singletons(app).join(", ")}.
  autoCreateEntities: true,
})
`
}

function singletons(app) {
  const ids = ["home"]
  if (app.routing) ids.push("about", "router")
  if (app.i18n) ids.push("i18n")
  if (app.analytics) ids.push("analytics")
  if (app.push) ids.push("pushPrompt")
  if (app.nativeUpdate) ids.push("nativeUpdate")
  if (app.auth) ids.push("auth")
  if (app.ui) ids.push("toast")
  return ids
}

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

const PROFILE_ROUTE = `
  // The signed-in account, which the Auth entity renders.
  "/profile": "auth",`

function routesSource(app) {
  const head = app.isTypeScript
    ? `import type { RoutesConfig } from "@inglorious/web/router"

// Each path names the entity its page renders.
export const routes: RoutesConfig = {`
    : `// Each path names the entity its page renders.
export const routes = {`
  return `${head}
  "/": "home",
  "/about": "about",${app.auth ? PROFILE_ROUTE : ""}
}
`
}

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

/**
 * `export type AppEvents = EventsOf<...>`, wrapped as Prettier would: on one
 * line if it fits, then with the types on a line of their own, then one per
 * line.
 */
function eventsOf(types) {
  const head = "export type AppEvents = EventsOf<"
  const oneLine = `${head}${types.join(" | ")}>`
  if (oneLine.length <= LINE_WIDTH) return oneLine
  const inner = `  ${types.join(" | ")}`
  if (inner.length <= LINE_WIDTH) return `${head}\n${inner}\n>`
  return `${head}\n${types.map((type) => `  | ${type}`).join("\n")}\n>`
}

function typesSource(app) {
  const imports = [
    'import "./vite-env"',
    `import type {
  BaseEntity,
  EntitiesState,
  EntityType,
  EventsOf,
} from "@inglorious/store"`,
    'import type { Api, TemplateResult } from "@inglorious/web"',
  ]
  const entities = ["MessageEntity", "HomeEntity"]
  // The types whose events the app sends: its own, then the libraries'.
  const eventTypes = ["MessageType"]
  if (app.renderer === "lit-html") eventTypes.push("HomeType")
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
    imports.push(
      'import type { RouterEntity, RouterType } from "@inglorious/web/router"',
    )
    eventTypes.push("RouterType")
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
    imports.push('import type { I18nEntity, I18nType } from "@inglorious/i18n"')
    eventTypes.push("I18nType")
    entities.push("AppI18nEntity")
    declarations.push(
      `export interface AppI18nEntity extends I18nEntity {
  type: "I18n"
}`,
    )
    state.unshift("  i18n: AppI18nEntity")
  }
  if (app.analytics) {
    imports.push(
      'import type { AnalyticsEntity, AnalyticsType } from "@inglorious/web/analytics"',
    )
    eventTypes.push("AnalyticsType")
    entities.push("AppAnalyticsEntity")
    declarations.push(
      `export interface AppAnalyticsEntity extends AnalyticsEntity {
  type: "Analytics"
}`,
    )
    state.push("  analytics: AppAnalyticsEntity")
  }
  if (app.push) {
    imports.push(
      'import type { PushPromptEntity, PushPromptType } from "@inglorious/web/push"',
    )
    eventTypes.push("PushPromptType")
    entities.push("AppPushPromptEntity")
    declarations.push(
      `export interface AppPushPromptEntity extends PushPromptEntity {
  type: "PushPrompt"
}`,
    )
    state.push("  pushPrompt: AppPushPromptEntity")
  }
  if (app.nativeUpdate) {
    imports.push(
      `import type {
  NativeUpdateEntity,
  NativeUpdateType,
} from "@inglorious/web/native-update"`,
    )
    eventTypes.push("NativeUpdateType")
    entities.push("AppNativeUpdateEntity")
    declarations.push(
      `export interface AppNativeUpdateEntity extends NativeUpdateEntity {
  type: "NativeUpdate"
}`,
    )
    state.push("  nativeUpdate: AppNativeUpdateEntity")
  }
  if (app.auth) {
    imports.push(
      'import type { AuthEntity, AuthType } from "@inglorious/web/auth"',
    )
    eventTypes.push("AuthType")
    entities.push("AppAuthEntity")
    declarations.push(
      `export interface AppAuthEntity extends AuthEntity {
  type: "Auth"
}`,
    )
    state.push("  auth: AppAuthEntity")
  }

  if (app.ui) {
    imports.push(
      'import type { ToastEntity, ToastType } from "@inglorious/ui/toast"',
    )
    eventTypes.push("ToastType")
    entities.push("AppToastEntity")
    declarations.push(
      `export interface AppToastEntity extends ToastEntity {
  type: "Toast"
}`,
    )
    state.push("  toast: AppToastEntity")
  }

  return `${importBlock(imports)}

${declarations.join("\n\n")}

// Union type of all entities
${union("AppEntity", entities)}

// State type with known entity IDs
export interface AppState extends EntitiesState<AppEntity> {
${state.join("\n")}
}

// The events the app's types answer, so that \`notify\` checks them.
${eventsOf(eventTypes)}

export type AppApi = Api<AppEntity, AppState, AppEvents>

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
