import fs from "fs"
import path from "path"

const AUTH_CONFIG = `
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
`

/**
 * Writes what `supabase init` would, so `supabase start` works right away:
 * a config.toml holding only what differs from the CLI's defaults, and the
 * .gitignore for the CLI's local state.
 *
 * @param {string} targetDir
 * @param {{ auth: boolean }} options
 */
export function addSupabaseConfig(targetDir, { auth }) {
  const dir = path.join(targetDir, "supabase")
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(
    path.join(dir, "config.toml"),
    `# Settings left out keep the Supabase CLI's defaults.
project_id = "${path.basename(targetDir)}"
${auth ? AUTH_CONFIG : ""}`,
  )
  fs.writeFileSync(path.join(dir, ".gitignore"), ".branches\n.temp\n")
}
