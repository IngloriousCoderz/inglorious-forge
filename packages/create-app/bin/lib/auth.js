import fs from "fs"
import { EOL } from "os"
import path from "path"

import { AUTH_TEXTS } from "./auth-texts.js"
import { copyDir } from "./file.js"
import { importBlock } from "./imports.js"
import { LINE_WIDTH, relative } from "./source.js"

export const AUTH_METHODS = {
  password: {
    title: "Email and password",
    description: "With password reset and a code to confirm the email",
  },
  code: {
    title: "Code by email",
    description: "No password: a code sent by email signs in",
  },
}

/**
 * The source files of sign-in: the adapter over Supabase Auth and the `Auth`
 * type with its screen. The screen is lit-html in every syntax, like the
 * prompts: src/main renders it instead of the app while nobody is signed in,
 * and the app bar renders its account actions.
 */
export function authFiles(app) {
  return {
    [`src/api/auth.${app.ext}`]: adapterSource(app),
    [`${app.layout.auth}/index.${app.ext}`]: screenSource(app),
  }
}

/**
 * Adds what sign-in needs outside src/: the Edge Function that erases an
 * account, the email templates with the codes, and the setup in the README.
 */
export function addAuthSupport(targetDir, templatesRoot, { mobile }) {
  copyDir(path.join(templatesRoot, "features/auth"), targetDir)
  const readmePath = path.join(targetDir, "README.md")
  if (!fs.existsSync(readmePath)) return
  const readme = fs.readFileSync(readmePath, "utf-8")
  fs.writeFileSync(
    readmePath,
    `${readme.trimEnd()}${EOL}${EOL}${authSection(mobile)}${EOL}`,
  )
}

export function authCatalogue(language) {
  return AUTH_TEXTS[language]
}

function adapterSource(app) {
  const imports = [
    'import { createCaptcha, supabaseAuth } from "@inglorious/supabase"',
    'import { supabase } from "./supabase"',
  ]
  if (app.push) imports.push('import { signOut } from "./push"')

  const adapter = app.push
    ? `// Signing out unregisters this device's push token first.
export const authAdapter = { ...supabaseAuth(supabase, { captcha }), signOut }`
    : "export const authAdapter = supabaseAuth(supabase, { captcha })"

  return `${importBlock(imports)}

// Without a site key, as on a local stack, it asks for no CAPTCHA.
const captcha = createCaptcha({
  siteKey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
  element: "captcha",
})

${adapter}
`
}

function screenSource(app) {
  const ts = app.isTypeScript
  const hasPassword = app.authMethods.includes("password")
  const hasCode = app.authMethods.includes("code")
  const english = AUTH_TEXTS.en

  const value = (key) =>
    app.i18n ? `t("auth.${key}")` : JSON.stringify(english[key])
  const text = (key) => (app.i18n ? `\${t("auth.${key}")}` : english[key])
  const params = ts ? "entity: AppAuthEntity, api: AppApi" : "entity, api"
  const event = (name) => `\`#\${entity.id}:${name}\``
  const notify = (name) => `api.notify(${event(name)})`
  const sentTo = app.i18n
    ? '${t("auth.codeSent", { email: entity.email })}'
    : english.codeSent.replace("{{email}}", "${entity.email}")
  const isBusy = 'entity.status === "loading"'
  const describe = app.i18n
    ? "t(`auth.errors.${entity.error}`)"
    : "ERRORS[entity.error]"

  const input = (props) => {
    if (app.ui) {
      const lines = Object.entries(props).map(
        ([name, propValue]) => `      ${name}: ${propValue},`,
      )
      return `    \${Input.render({
${lines.join("\n")}
    })}`
    }
    const attributes = [
      `name=${props.name}`,
      `type=${props.inputType}`,
      ...(props.autocomplete ? [`autocomplete=${props.autocomplete}`] : []),
      ...(props.inputMode ? [`inputmode=${props.inputMode}`] : []),
      "required",
      ...(props.value ? [`.value=\${${props.value}}`] : []),
    ]
    return `    <label>
      \${${props.label}}
${voidElement("      ", "input", attributes)}
    </label>`
  }

  const submit = (key) =>
    app.ui
      ? `    \${Button.render({
      buttonType: "submit",
      color: "primary",
      isFullWidth: true,
      isDisabled: ${isBusy},
      children: ${value(key)},
    })}`
      : element("    ", "button", [`?disabled=\${${isBusy}}`], text(key))

  const action = (key, name) =>
    app.ui
      ? `    \${Button.render({
      variant: "ghost",
      onClick: () => ${notify(name)},
      children: ${value(key)},
    })}`
      : element(
          "    ",
          "button",
          ['type="button"', `@click=\${() => ${notify(name)}}`],
          text(key),
        )

  const changeEmail = action("change", "back")

  const form = (name, submitted, body) => `function ${name}Step(${params}) {
  return html\`<form
    @submit=\${onSubmit((data) =>
      ${submitted},
    )}
  >
${body}
  </form>\`
}`

  const send = (name, payload) =>
    typeof payload === "string"
      ? `api.notify(${event(name)}, ${payload})`
      : `api.notify(${event(name)}, {
${payload.map((field) => `        ${field},`).join("\n")}
      })`

  const passwordInput = (autocomplete) =>
    input({
      name: '"password"',
      inputType: '"password"',
      label: value(
        autocomplete === "new-password" ? "newPassword" : "password",
      ),
      ...(autocomplete === "new-password" && app.ui
        ? { hint: value("passwordHint") }
        : {}),
      autocomplete: `"${autocomplete}"`,
      isRequired: "true",
      isFullWidth: "true",
    })

  const codeInput = input({
    name: '"code"',
    inputType: '"text"',
    label: value("code"),
    inputMode: '"numeric"',
    autocomplete: '"one-time-code"',
    isRequired: "true",
    isFullWidth: "true",
  })

  const steps = [
    form(
      "email",
      send("emailSubmit", 'field(data, "email")'),
      `    <h1>${text("title")}</h1>
${input({
  name: '"email"',
  inputType: '"email"',
  label: value("email"),
  value: "entity.email",
  autocomplete: '"email"',
  isRequired: "true",
  isFullWidth: "true",
})}
${submit("continue")}`,
    ),
  ]
  const stepNames = ["email"]

  if (hasPassword) {
    stepNames.push("password", "signUp", "reset")
    const codeOffer = hasCode ? `\n${action("codeOffer", "codeRequest")}` : ""
    steps.push(
      form(
        "password",
        send("signInSubmit", 'field(data, "password")'),
        `    <h1>${text("title")}</h1>
    <p>\${entity.email}</p>
${passwordInput("current-password")}
${submit("signIn")}
${action("forgot", "resetRequest")}
${action("signUpOffer", "signUpShow")}${codeOffer}
${changeEmail}`,
      ),
      form(
        "signUp",
        send("signUpSubmit", ['password: field(data, "password")']),
        `    <h1>${text("signUpTitle")}</h1>
    <p>\${entity.email}</p>
${passwordInput("new-password")}
${submit("signUp")}
${action("signInOffer", "signInShow")}
${changeEmail}`,
      ),
      form(
        "reset",
        send("resetSubmit", [
          'code: field(data, "code")',
          'password: field(data, "password")',
        ]),
        `    <h1>${text("resetTitle")}</h1>
    <p>${sentTo}</p>
${codeInput}
${passwordInput("new-password")}
${submit("reset")}
    \${resendAction(entity, api)}
${changeEmail}`,
      ),
    )
  }

  stepNames.push("code")
  steps.push(
    form(
      "code",
      send("codeSubmit", 'field(data, "code")'),
      `    <h1>${text("codeTitle")}</h1>
    <p>${sentTo}</p>
${codeInput}
${submit("continue")}
    \${resendAction(entity, api)}
${changeEmail}`,
    ),
  )

  const imports = []
  if (app.ui) {
    imports.push(
      'import { Alert } from "@inglorious/ui/alert"',
      'import { Button } from "@inglorious/ui/button"',
      'import { ConfirmDialog } from "@inglorious/ui/confirm-dialog"',
      'import { Input } from "@inglorious/ui/input"',
    )
  }
  imports.push(
    'import { html, nothing } from "@inglorious/web"',
    'import { createAuth } from "@inglorious/web/auth"',
    `import { authAdapter } from "${relative(app.layout.auth, "src/api/auth")}"`,
  )
  if (app.i18n) {
    imports.push(`import { t } from "${relative(app.layout.auth, "src/i18n")}"`)
  }
  if (ts) {
    imports.push(
      `import type { AppApi, AppAuthEntity } from "${relative(app.layout.auth, "types")}"`,
      'import type { TemplateResult } from "@inglorious/web"',
    )
  }

  const methods = `[${app.authMethods.map((method) => `"${method}"`).join(", ")}]`
  const stepsType = ts
    ? `: Partial<
  Record<
    AppAuthEntity["step"],
    (entity: AppAuthEntity, api: AppApi) => TemplateResult
  >
>`
    : ""

  const errors = app.i18n
    ? ""
    : `
const ERRORS${ts ? ": Record<string, string>" : ""} = {
${Object.entries(english.errors)
  .map(([key, message]) => prop(key, JSON.stringify(message), "  "))
  .join("\n")}
}
`

  const errorMessage = app.ui
    ? `  return Alert.render({
    severity: "error",
    description: ${describe},
  })`
    : returnHtml(
        "p",
        ['class="app-auth-error"', 'role="alert"'],
        `\${${describe}}`,
      )

  const resendAction = app.ui
    ? `  return Button.render({
    variant: "ghost",
    onClick: () => ${notify("codeResend")},
    children: ${value("resend")},
  })`
    : returnHtml(
        "button",
        ['type="button"', `@click=\${() => ${notify("codeResend")}}`],
        text("resend"),
      )

  const isPage = app.routing
  const tag = isPage ? "section" : "span"
  const className = isPage ? "app-profile" : "app-account"
  const email = ts ? "entity.user?.email" : "entity.user.email"
  const signedInAs = app.i18n
    ? `\${t("auth.signedInAs", { email: ${email} })}`
    : english.signedInAs.replace("{{email}}", `\${${email}}`)
  const intro = isPage
    ? `
    <h1>${text("profile")}</h1>
    <p>${signedInAs}</p>`
    : ""
  const buttonLook = isPage
    ? `      variant: "outline",`
    : `      variant: "ghost",
      size: "sm",`

  const account = app.ui
    ? `function account(${params}) {
  return html\`<${tag} class="${className}">${intro}
    \${Button.render({
${buttonLook}
      onClick: () => ${notify("signOut")},
      children: ${value("signOut")},
    })}
    \${Button.render({
${buttonLook}
      color: "error",
      onClick: () => ${notify("accountEraseAsk")},
      children: ${value("erase")},
    })}
    \${ConfirmDialog.render({
      isOpen: entity.isEraseAsked,
${prop("message", value("eraseConfirm"), "      ")}
      confirmLabel: ${value("eraseYes")},
      cancelLabel: ${value("cancel")},
      tone: "danger",
      isBusy: ${isBusy},
      onConfirm: () => ${notify("accountErase")},
      onCancel: () => ${notify("accountEraseCancel")},
      children: errorMessage(entity),
    })}
  </${tag}>\`
}`
    : `function account(${params}) {
  if (entity.isEraseAsked) {
    return html\`<${tag} class="${className}" role="alertdialog">
      ${text("eraseConfirm")}
${element("      ", "button", [`?disabled=\${${isBusy}}`, `@click=\${() => ${notify("accountErase")}}`], text("eraseYes"))}
${element("      ", "button", [`@click=\${() => ${notify("accountEraseCancel")}}`], text("cancel"))}
      \${errorMessage(entity)}
    </${tag}>\`
  }
  return html\`<${tag} class="${className}">${intro}
${element("    ", "button", [`@click=\${() => ${notify("signOut")}}`], text("signOut"))}
${element("    ", "button", [`@click=\${() => ${notify("accountEraseAsk")}}`], text("erase"))}
  </${tag}>\`
}`

  const submitEvent = ts ? "event: SubmitEvent" : "event"
  const formTarget = ts ? "event.target as HTMLFormElement" : "event.target"
  const handleType = ts ? ": (data: FormData) => void" : ""
  const entityOnly = ts ? "entity: AppAuthEntity" : "entity"

  return `${importBlock(imports)}
${errors}
export const Auth = {
  ...createAuth({ adapter: authAdapter, methods: ${methods} }),

${
  isPage
    ? `  // Signed in, the profile page at /profile; signed out, the sign-in
  // screen, which src/main shows instead of the app.`
    : `  // Signed in, the account's actions, which the app bar shows; signed out,
  // the sign-in screen, which src/main shows instead of the app.`
}
  render(${params}) {
    return entity.user ? account(entity, api) : screen(entity, api)
  },
}

const steps${stepsType} = {
${stepNames.map((name) => `  ${name}: ${name}Step,`).join("\n")}
}

function screen(${params}) {
  return html\`<section class="app-auth">
    \${steps[entity.step]?.(entity, api)} \${errorMessage(entity)}
    <div id="captcha"></div>
  </section>\`
}

${steps.join("\n\n")}

${account}

function errorMessage(${entityOnly}) {
  if (!entity.error) return nothing
${errorMessage}
}

function resendAction(${params}) {
  if (entity.isCodeResent) return html\`<p>${text("resent")}</p>\`
${resendAction}
}

// Reads the fields when the form is sent, rather than every keystroke.
function onSubmit(handle${handleType}) {
  return (${submitEvent}) => {
    event.preventDefault()
    handle(new FormData(${formTarget}))
  }
}

function field(data${ts ? ": FormData" : ""}, name${ts ? ": string" : ""}) {
  return String(data.get(name) ?? "")
}
`
}

// An element as Prettier lays it out: on one line if it fits, then with its
// content on lines of its own, then with one attribute per line.
function element(indent, tag, attributes, content) {
  const open = `<${tag} ${attributes.join(" ")}>`
  const oneLine = `${indent}${open}${content}</${tag}>`
  if (oneLine.length <= LINE_WIDTH) return oneLine
  const tagLine = `${indent}${open}`
  const head =
    tagLine.length <= LINE_WIDTH
      ? tagLine
      : `${indent}<${tag}
${attributes.map((attribute) => `${indent}  ${attribute}`).join("\n")}
${indent}>`
  return `${head}
${indent}  ${content}
${indent}</${tag}>`
}

function voidElement(indent, tag, attributes) {
  const oneLine = `${indent}<${tag} ${attributes.join(" ")} />`
  if (oneLine.length <= LINE_WIDTH) return oneLine
  return `${indent}<${tag}
${attributes.map((attribute) => `${indent}  ${attribute}`).join("\n")}
${indent}/>`
}

// `return html\`<tag>...</tag>\`` in a function body, laid out as Prettier does.
function returnHtml(tag, attributes, content) {
  const prefix = "  return html`"
  const open = `<${tag} ${attributes.join(" ")}>`
  const oneLine = `${prefix}${open}${content}</${tag}>\``
  if (oneLine.length <= LINE_WIDTH) return oneLine
  const tagLine = `${prefix}${open}`
  const head =
    tagLine.length <= LINE_WIDTH
      ? tagLine
      : `${prefix}<${tag}
${attributes.map((attribute) => `    ${attribute}`).join("\n")}
  >`
  return `${head}
    ${content}
  </${tag}>\``
}

// Prettier moves a value to its own line when the property would not fit.
function prop(name, value, indent) {
  const line = `${indent}${name}: ${value},`
  if (line.length <= LINE_WIDTH) return line
  return `${indent}${name}:\n${indent}  ${value},`
}

function authSection(mobile) {
  return `## Sign-in

People sign in with Supabase Auth: \`src/app/auth\` asks for the email, then a password, a new account or a code sent by email. Until someone is signed in, \`src/main\` shows that screen instead of the app. Codes, rather than links, work in the native app too, since nobody has to open anything.

With the [Supabase CLI](https://supabase.com/docs/guides/cli) installed, run \`supabase init\` here if you haven't, then add the email templates with the codes to \`supabase/config.toml\`:

\`\`\`toml
[auth.email]
enable_confirmations = true

[auth.email.template.confirmation]
subject = "Your confirmation code"
content_path = "./supabase/templates/confirmation.html"

[auth.email.template.magic_link]
subject = "Your sign-in code"
content_path = "./supabase/templates/magic_link.html"

[auth.email.template.recovery]
subject = "Your password reset code"
content_path = "./supabase/templates/recovery.html"
\`\`\`

\`supabase start\` runs it locally: the emails arrive in Mailpit, which \`supabase status\` lists. Copy \`.env.example\` to \`.env.local\` and fill in \`VITE_SUPABASE_URL\` and \`VITE_SUPABASE_ANON_KEY\` from \`supabase status\`.

For the hosted project, paste the three templates under Authentication → Emails, then:

\`\`\`sh
supabase link --project-ref <your project ref>
supabase functions deploy erase-account
\`\`\`

To stop bots from creating accounts, turn on CAPTCHA protection with Cloudflare Turnstile under Authentication → Attack Protection, and set \`VITE_TURNSTILE_SITE_KEY\`.

### Deleting an account

Apple and Google require apps that create accounts to delete them from inside the app. **Delete account**, on the profile page (or in the app bar without routing), calls the \`erase-account\` Edge Function, which deletes the user with \`eraseUser\` from \`@inglorious/supabase/edge\`. Tables whose rows belong to a user should reference \`auth.users\` with \`on delete cascade\`, and files under a folder named after the user's id go too, in the buckets listed in \`USER_BUCKETS\`.${
    mobile
      ? `

### Before the stores

- **App Store**: under App Privacy, declare the email address (for the account) and anything else the app collects, linked to the user.
- **Google Play**: fill in the Data safety form the same way, and give the web address where people can ask for their account to be deleted, as Google requires one outside the app too.`
      : ""
  }`
}
