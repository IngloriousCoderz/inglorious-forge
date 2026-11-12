import fs from "fs"
import { EOL } from "os"
import path from "path"

import { copyDir, stampMigration } from "./file.js"

const FIRST_NUMBER = 1

/**
 * Adds what analytics and push need outside src/: the service worker, the
 * Supabase side of push, and the setup steps in the README.
 *
 * @param {string} targetDir
 * @param {object} pkg - The package.json being built; scripts are added.
 * @param {object} options
 * @param {string} options.templatesRoot
 * @param {boolean} options.analytics
 * @param {boolean} options.push
 * @param {boolean} options.mobile
 */
export function addFirebaseSupport(targetDir, pkg, options) {
  const { templatesRoot, push } = options
  pkg.scripts ??= {}

  if (push) {
    copyDir(path.join(templatesRoot, "features/push"), targetDir)
    stampMigration(targetDir, "push.sql")
    pkg.scripts["vault:push"] = "node scripts/push-vault-secrets.mjs"
    keepSupabaseOutOfTypeScript(targetDir)
  }

  appendSetupToReadme(targetDir, options)
}

// The Deno function is in no TS project, and Supabase's typings do not compile.
export function keepSupabaseOutOfTypeScript(targetDir) {
  const eslintConfig = path.join(targetDir, "eslint.config.ts")
  if (
    fs.existsSync(eslintConfig) &&
    fs.readFileSync(eslintConfig, "utf-8").includes('"supabase/"')
  ) {
    return
  }
  replaceInFile(
    eslintConfig,
    "defineConfig([\n",
    'defineConfig([\n  { ignores: ["supabase/"] },\n',
  )
  replaceInFile(
    path.join(targetDir, "tsconfig.app.json"),
    '"noEmit": true,',
    '"noEmit": true,\n    "skipLibCheck": true,',
  )
}

function replaceInFile(file, search, replacement) {
  if (!fs.existsSync(file)) return
  fs.writeFileSync(
    file,
    fs.readFileSync(file, "utf-8").replace(search, replacement),
  )
}

function appendSetupToReadme(targetDir, { analytics, push, mobile }) {
  const readmePath = path.join(targetDir, "README.md")
  if (!fs.existsSync(readmePath)) return

  const sections = [firebaseSection({ analytics, push, mobile })]
  if (analytics) sections.push(analyticsSection(mobile))
  if (push) sections.push(pushSection(mobile))

  const readme = fs.readFileSync(readmePath, "utf-8")
  fs.writeFileSync(
    readmePath,
    `${readme.trimEnd()}${EOL}${EOL}${sections.join(EOL + EOL)}${EOL}`,
  )
}

function firebaseSection({ analytics, push, mobile }) {
  const steps = [
    "Create a project in the [Firebase console](https://console.firebase.google.com) and add a web app to it.",
    "Copy `.env.example` to `.env.local` and fill it in from Project settings → General → your web app. These values end up in the built app, so they are not secret.",
  ]
  if (analytics) {
    steps.push(
      "`VITE_FIREBASE_MEASUREMENT_ID` is the web app's `measurementId`. Do not paste Google's `gtag.js` snippet into `index.html`: it would start before anyone agreed.",
    )
  }
  if (push) {
    steps.push(
      "`VITE_FIREBASE_VAPID_KEY` is the public half of a Web Push key pair, from Project settings → Cloud Messaging → Web configuration.",
    )
  }
  if (mobile) {
    steps.push(
      "Add an Android and an iOS app too, and put their `google-services.json` and `GoogleService-Info.plist` in the project's root folder: `pnpm mobile:sync` copies them into the native projects, and sets up the rest.",
    )
  }
  return `## Firebase Setup

${numbered(steps)}`
}

function analyticsSection(mobile) {
  const native = mobile
    ? `

The native apps must start with collection off, or they measure from launch. \`inglorious-capacitor configure\` writes that setting into the native projects after every \`cap sync\`.`
    : ""
  return `## Analytics

Usage is measured with Google Analytics for Firebase, and only for people who said yes: until then, no analytics code loads. Check that your privacy policy covers it, naming Google as the processor.

Page views follow the router by themselves. The app's own events go through the entity, and are dropped without consent:

\`\`\`js
api.notify("#analytics:analyticsTrack", { name: "sign_up" })
\`\`\`

To let people change their answer, for example from a settings page, notify \`#analytics:analyticsAsk\` to bring the prompt back.${native}`
}

function pushSection(mobile) {
  const devices = mobile ? "the PWA and the native apps" : "the PWA"
  return `## Push Notifications

Pushes reach ${devices} through Firebase Cloud Messaging. Supabase keeps each device's token and sends: inserting a row in \`notifications\` is what sends a push.

\`\`\`sql
insert into public.notifications (user_id, title, body, url)
values ('<user id>', 'Hello', 'You have a new message', '/');
\`\`\`

The permission prompt appears once someone signs in with Supabase Auth, so the app needs a sign-in screen. To sign out, call \`signOut\` from \`src/api/push\`, which deletes the device's token first.

To set it up, with the [Supabase CLI](https://supabase.com/docs/guides/cli) installed:

${numbered([
  "In the Firebase console, go to Project settings → Service accounts → Generate new private key. The file is a real secret: never commit it.",
  "In the Google Cloud console, give that service account the **Firebase Cloud Messaging API Admin** role. The similarly named Firebase Cloud Messaging Admin cannot send.",
  "Run `supabase init` here, then `supabase start` to try it locally, with the file's JSON on one line as `FCM_SERVICE_ACCOUNT` in `supabase/functions/.env`. `supabase status` gives the values of `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.",
])}

To deploy:

\`\`\`bash
supabase link --project-ref <your project ref>
supabase db push
supabase secrets set FCM_SERVICE_ACCOUNT="$(cat path/to/service-account.json)"
supabase functions deploy push-notify
pnpm vault:push
\`\`\`

\`pnpm vault:push\` tells the database how to reach the function. It stores the project's legacy \`service_role\` key in Vault, which is the key \`push-notify\` can read a role from.

A browser's service worker only exists in a build, so try web pushes with \`pnpm build && pnpm preview\`.`
}

function numbered(steps) {
  return steps
    .map((step, index) => `${FIRST_NUMBER + index}. ${step}`)
    .join("\n")
}
