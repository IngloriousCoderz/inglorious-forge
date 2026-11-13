import fs from "fs"
import { EOL } from "os"
import path from "path"

import { copyDir, stampMigration } from "./file.js"
import { importBlock } from "./imports.js"
import { relative } from "./source.js"

const README_SECTION = `## Mandatory Native Updates

The native apps carry their web code inside the binary, so only the stores update them. Each platform's row in the \`app_versions\` table holds the oldest build allowed to run: an older one shows nothing but an update page, at launch and whenever it comes back to the foreground.

Once a new build is live in a store, raise that platform's minimum to its build number:

\`\`\`sql
update public.app_versions set min_build = 7 where platform = 'android';
\`\`\`

Never before: users would be blocked with nothing to download. Set \`store_url\` to the store page, or the update page shows no button. A failed check keeps the last answer, so nobody is blocked for being offline.

Older builds keep talking to the backend until they are blocked, so a change that breaks them ships in two releases: a build that works with both backends, made mandatory, then the breaking change.`

/**
 * The source of the NativeUpdate type: the page that blocks a native build
 * older than the minimum in Supabase. Lit-html in every syntax, like the
 * prompts: src/main renders it in place of the app.
 *
 * @param {{ ui: boolean, i18n: boolean, ext: string, isTypeScript: boolean, layout: Record<string, string> }} app
 * @returns {Record<string, string>} Sources by file path.
 */
export function nativeUpdateFiles(app) {
  return {
    [`${app.layout.nativeUpdate}/index.${app.ext}`]: nativeUpdateSource(app),
  }
}

/**
 * Adds what mandatory native updates need outside src/: the app_versions
 * table and how to raise its minimum in the README.
 *
 * @param {string} targetDir
 * @param {string} templatesRoot
 */
export function addNativeUpdateSupport(targetDir, templatesRoot) {
  copyDir(path.join(templatesRoot, "features/native-update"), targetDir)
  stampMigration(targetDir, "native_update.sql")
  appendToReadme(targetDir)
}

function nativeUpdateSource(app) {
  const at = app.layout.nativeUpdate
  const imports = [
    'import { supabaseNativeUpdate } from "@inglorious/supabase"',
    'import { html } from "@inglorious/web"',
    'import { when } from "@inglorious/web/directives/when"',
    'import { createNativeUpdate } from "@inglorious/web/native/update"',
    `import { supabase } from "${relative(at, "src/api/supabase")}"`,
  ]
  if (app.ui) imports.push('import { Button } from "@inglorious/ui/button"')
  if (app.i18n) imports.push(`import { t } from "${relative(at, "src/i18n")}"`)
  if (app.isTypeScript) {
    imports.push(
      `import type { AppApi, AppNativeUpdateEntity } from "${relative(at, "types")}"`,
    )
  }
  const label = (key, text) =>
    app.i18n ? `t("nativeUpdate.${key}")` : JSON.stringify(text)
  const text = (key, plain) =>
    app.i18n ? `\${t("nativeUpdate.${key}")}` : plain
  const params = app.isTypeScript
    ? "entity: AppNativeUpdateEntity, api: AppApi"
    : "entity, api"
  const button = app.ui
    ? `\${when(entity.storeUrl, () =>
        Button.render({
          children: ${label("update", "Update")},
          color: "primary",
          onClick: () => api.notify(\`#\${entity.id}:nativeUpdateApply\`),
        }),
      )}`
    : `\${when(
        entity.storeUrl,
        () =>
          html\`<button
            @click=\${() => api.notify(\`#\${entity.id}:nativeUpdateApply\`)}
          >
            ${text("update", "Update")}
          </button>\`,
      )}`

  return `${importBlock(imports)}

export const NativeUpdate = {
  ...createNativeUpdate({ adapter: supabaseNativeUpdate(supabase) }),

  render(${params}) {
    const body = entity.storeUrl
      ? ${label("body", "This version of the app is no longer supported. Update it to keep going.")}
      : ${label("bodyNoLink", "This version of the app is no longer supported. Update it from your app store to keep going.")}

    return html\`<main class="app-update">
      <h1>${text("title", "Time to update")}</h1>
      <p>\${body}</p>
      ${button}
    </main>\`
  },
}
`
}

function appendToReadme(targetDir) {
  const readmePath = path.join(targetDir, "README.md")
  if (!fs.existsSync(readmePath)) return
  const readme = fs.readFileSync(readmePath, "utf-8")
  fs.writeFileSync(
    readmePath,
    `${readme.trimEnd()}${EOL}${EOL}${README_SECTION}${EOL}`,
  )
}
