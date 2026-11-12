import { importBlock } from "./imports.js"
import { LINE_WIDTH, relative } from "./source.js"

const FIREBASE_CONFIG_KEYS = {
  apiKey: "VITE_FIREBASE_API_KEY",
  projectId: "VITE_FIREBASE_PROJECT_ID",
  messagingSenderId: "VITE_FIREBASE_MESSAGING_SENDER_ID",
  appId: "VITE_FIREBASE_APP_ID",
}

/**
 * The source files of the analytics and push prompts. They are lit-html in
 * every syntax: src/main renders them next to the app, whatever it is written
 * in.
 *
 * @param {{ analytics: boolean, push: boolean, ui: boolean, i18n: boolean, ext: string, isTypeScript: boolean, projectName: string }} app
 * @returns {Record<string, string>} Sources by file path.
 */
export function promptFiles(app) {
  const files = {
    [`src/api/firebase.${app.ext}`]: firebaseSource(app),
    [`src/common/prompt.${app.ext}`]: promptSource(app),
  }
  if (app.analytics) {
    files[`${app.layout.analytics}/index.${app.ext}`] = analyticsSource(app)
  }
  if (app.push) {
    files[`src/api/push.${app.ext}`] = pushSource(app)
    files[`${app.layout.pushPrompt}/index.${app.ext}`] = pushPromptSource(app)
  }
  return files
}

export function envExample(app) {
  const keys = app.hasPrompts ? Object.values(FIREBASE_CONFIG_KEYS) : []
  if (app.analytics) keys.push("VITE_FIREBASE_MEASUREMENT_ID")
  if (app.push) keys.push("VITE_FIREBASE_VAPID_KEY")
  if (app.hasSupabase) keys.push("VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY")
  if (app.auth) keys.push("VITE_TURNSTILE_SITE_KEY")
  return keys.map((key) => `${key}=`).join("\n") + "\n"
}

function firebaseSource(app) {
  const entries = Object.entries(FIREBASE_CONFIG_KEYS).map(
    ([key, env]) => `  ${key}: import.meta.env.${env},`,
  )
  if (app.analytics) {
    entries.push(
      "  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,",
    )
  }
  return `export const firebaseConfig = {
${entries.join("\n")}
}
`
}

function promptSource(app) {
  const props = app.isTypeScript
    ? `interface PromptProps {
  message: string
  askLabel: string
  declineLabel: string
  onAsk: () => void
  onDecline: () => void
}

`
    : ""
  const annotation = app.isTypeScript ? ": PromptProps" : ""
  const params = `{ message, askLabel, declineLabel, onAsk, onDecline }${annotation}`
  const signature =
    `  render(${params}) {`.length <= LINE_WIDTH
      ? `  render(${params}) {`
      : `  render({
    message,
    askLabel,
    declineLabel,
    onAsk,
    onDecline,
  }${annotation}) {`

  if (app.ui) {
    return `${importBlock(
      promptImports(app, [
        'import { Button } from "@inglorious/ui/button"',
        'import { Flex } from "@inglorious/ui/flex"',
        'import { Snackbar } from "@inglorious/ui/snackbar"',
      ]),
    )}

${props}export const Prompt = {
${signature}
    return Snackbar.render({
      isOpen: true,
      position: "bottom-center",
      message,
      action: Flex.render({
        direction: "row",
        align: "center",
        gap: "sm",
        children: [
          Button.render({
            children: askLabel,
            color: "primary",
            size: "sm",
            onClick: onAsk,
          }),
          Button.render({
            children: declineLabel,
            variant: "ghost",
            size: "sm",
            onClick: onDecline,
          }),
        ],
      }),
    })
  },
}
${renderPromptsSource(app)}`
  }

  return `${importBlock(promptImports(app, []))}

${props}export const Prompt = {
${signature}
    return html\`<div class="app-prompt">
      <p>\${message}</p>
      <button @click=\${onAsk}>\${askLabel}</button>
      <button @click=\${onDecline}>\${declineLabel}</button>
    </div>\`
  },
}
${renderPromptsSource(app)}`
}

function promptImports(app, imports) {
  return [
    ...imports,
    'import { html } from "@inglorious/web"',
    ...(app.isTypeScript ? ['import type { AppApi } from "../../types"'] : []),
  ]
}

// Prettier moves a value to its own line when the property would not fit.
function prop(name, value, indent) {
  const line = `${indent}${name}: ${value},`
  if (line.length <= LINE_WIDTH) return line
  return `${indent}${name}:\n${indent}  ${value},`
}

function renderPromptsSource(app) {
  const annotation = app.isTypeScript ? ": AppApi" : ""
  const prompts = [
    ...(app.analytics ? ['${api.render("analytics")}'] : []),
    ...(app.push ? ['${api.render("pushPrompt")}'] : []),
  ]
  return `
export function renderPrompts(api${annotation}) {
  return html\`${prompts.join(" ")}\`
}
`
}

function analyticsSource(app) {
  const imports = [
    'import { firebaseAnalytics } from "@inglorious/firebase/analytics"',
    'import { createAnalytics } from "@inglorious/web/analytics"',
    'import { when } from "@inglorious/web/directives/when"',
    `import { firebaseConfig } from "${relative(app.layout.analytics, "src/api/firebase")}"`,
    `import { Prompt } from "${relative(app.layout.analytics, "src/common/prompt")}"`,
  ]
  if (app.i18n)
    imports.push(
      `import { t } from "${relative(app.layout.analytics, "src/i18n")}"`,
    )
  if (app.isTypeScript) {
    imports.push(
      `import type { AppAnalyticsEntity, AppApi } from "${relative(app.layout.analytics, "types")}"`,
    )
  }
  const label = labelFor(app)
  const params = app.isTypeScript
    ? "entity: AppAnalyticsEntity, api: AppApi"
    : "entity, api"

  return `${importBlock(imports)}

export const Analytics = {
  ...createAnalytics({
    adapter: firebaseAnalytics({ firebase: firebaseConfig }),
    consentKey: "${app.projectName}-analytics-consent",
  }),

  render(${params}) {
    return when(entity.isAsking, () =>
      Prompt.render({
${prop("message", label("analytics.prompt", "May we measure how you use this app? It helps us make it better."), "        ")}
${prop("askLabel", label("analytics.accept", "Allow"), "        ")}
${prop("declineLabel", label("analytics.decline", "No thanks"), "        ")}
        onAsk: () => api.notify(\`#\${entity.id}:analyticsConsent\`, true),
        onDecline: () => api.notify(\`#\${entity.id}:analyticsConsent\`, false),
      }),
    )
  },
}
`
}

export function supabaseSource() {
  return `import { createClient } from "@supabase/supabase-js"

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)
`
}

function pushSource(app) {
  const token = app.isTypeScript ? "token: string" : "token"
  const platform = app.isTypeScript ? "platform: string" : "platform"
  return `import { firebasePush } from "@inglorious/firebase/push"

import { firebaseConfig } from "./firebase"
import { supabase } from "./supabase"

export const push = firebasePush({
  firebase: firebaseConfig,
  vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
  saveToken,
  deleteToken,
  tokenKey: "${app.projectName}-push-token",
})

async function saveToken(${token}, ${platform}) {
  const { error } = await supabase.rpc("save_push_token", {
    p_token: token,
    p_platform: platform,
  })
  if (error) throw error
}

async function deleteToken(${token}) {
  const { error } = await supabase
    .from("push_tokens")
    .delete()
    .eq("token", token)
  if (error) throw error
}

// The token goes first: only its signed-in user may delete it.
export async function signOut() {
  await push.unregister().catch(() => {})
  await supabase.auth.signOut()
}
`
}

function pushPromptSource(app) {
  const imports = [
    'import { when } from "@inglorious/web/directives/when"',
    'import { createPushPrompt } from "@inglorious/web/push"',
    `import { push } from "${relative(app.layout.pushPrompt, "src/api/push")}"`,
    `import { Prompt } from "${relative(app.layout.pushPrompt, "src/common/prompt")}"`,
  ]
  if (app.i18n)
    imports.push(
      `import { t } from "${relative(app.layout.pushPrompt, "src/i18n")}"`,
    )
  if (app.isTypeScript) {
    imports.push(
      `import type { AppApi, AppPushPromptEntity } from "${relative(app.layout.pushPrompt, "types")}"`,
    )
  }
  const label = labelFor(app)
  const params = app.isTypeScript
    ? "entity: AppPushPromptEntity, api: AppApi"
    : "entity, api"
  const isShown = app.analytics
    ? `entity.isOpen && !api.getEntity("analytics")${app.isTypeScript ? "!" : ""}.isAsking`
    : "entity.isOpen"
  const open = app.analytics
    ? "    // One question at a time, the consent first.\n"
    : ""

  return `${importBlock(imports)}

export const PushPrompt = {
  ...createPushPrompt({
    adapter: push,
    declineKey: "${app.projectName}-push-declined",
  }),

  render(${params}) {
${open}    return when(${isShown}, () =>
      Prompt.render({
        message: ${label("push.prompt", "Turn on push notifications?")},
        askLabel: ${label("push.ask", "Notify me")},
        declineLabel: ${label("push.decline", "Not now")},
        onAsk: () => api.notify(\`#\${entity.id}:pushAsk\`),
        onDecline: () => api.notify(\`#\${entity.id}:pushDecline\`),
      }),
    )
  },
}
`
}

function labelFor(app) {
  return (key, text) => (app.i18n ? `t("${key}")` : JSON.stringify(text))
}
