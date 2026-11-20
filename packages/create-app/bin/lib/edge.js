import fs from "fs"
import { EOL } from "os"
import path from "path"

const README_SECTION = `## Edge Functions

\`supabase start\` already serves every function in \`supabase/functions/\`. While editing one, \`pnpm edge\` serves them with their logs in this terminal, reloading on every save; \`pnpm edge:check\` type-checks and lints them with Deno, which must be installed. Functions read the secrets in \`supabase/functions/.env\` when they start: after changing one, restart the stack (\`supabase stop && supabase start\`) or \`pnpm edge\`.

The first \`pnpm edge:check\` writes \`supabase/functions/deno.lock\`: commit it, so every machine and every deploy runs the functions with the same versions of their dependencies.`

/**
 * Scripts for the app's Edge Functions, which sign-in and push both add:
 * serving them while editing, and checking them with Deno.
 *
 * @param {string} targetDir
 * @param {object} pkg - The package.json being built.
 */
export function addEdgeSupport(targetDir, pkg) {
  pkg.scripts ??= {}
  pkg.scripts.edge = "supabase functions serve"
  pkg.scripts["edge:check"] =
    "cd supabase/functions && deno check */index.ts && deno lint"

  const readmePath = path.join(targetDir, "README.md")
  if (!fs.existsSync(readmePath)) return
  const readme = fs.readFileSync(readmePath, "utf-8")
  fs.writeFileSync(
    readmePath,
    `${readme.trimEnd()}${EOL}${EOL}${README_SECTION}${EOL}`,
  )
}
